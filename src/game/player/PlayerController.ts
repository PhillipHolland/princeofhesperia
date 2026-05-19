import * as THREE from 'three';
import { InputManager } from '../../core/input/InputManager';

export type MovementState =
  | 'standing'
  | 'running'
  | 'jumping'
  | 'falling'
  | 'hanging'
  | 'climbing'
  | 'crouching'
  | 'enGarde'
  | 'hurt';

export class PlayerController {
  private position: THREE.Vector3;
  private velocity = new THREE.Vector3();
  private state: MovementState = 'standing';

  private isEnGarde = false;
  private isHurt = false;
  private hurtTimer = 0;

  // Tuned for weighty, deliberate 2.5D feel (Prince of Persia DNA)
  private readonly maxRunSpeed = 7.5;
  private readonly runAcceleration = 18;
  private readonly runDeceleration = 15;
  private readonly friction = 7;

  private readonly gravity = 23;
  private readonly jumpForce = 10.8;
  private readonly shortHopForce = 6.8;

  private readonly airControl = 0.32;


  private readonly ledgeGrabMaxSpeed = 5.5;
  private readonly ledgeGrabMaxDownSpeed = 6.5;

  constructor(
    private object: THREE.Group,
    private input: InputManager,
    private isMobile: boolean
  ) {
    this.position = object.position.clone();
  }

  public update(delta: number) {
    this.input.update();

    if (this.isHurt) {
      this.hurtTimer -= delta;
      this.velocity.x *= 0.9;
      this.velocity.z *= 0.9;
      this.velocity.y -= this.gravity * delta;

      this.position.x += this.velocity.x * delta;
      this.position.y += this.velocity.y * delta;
      this.position.z += this.velocity.z * delta;

      this.object.position.copy(this.position);

      if (this.hurtTimer <= 0) {
        this.isHurt = false;
      }
      return;
    }

    const moveInput = this.getMovementInput();

    switch (this.state) {
      case 'standing':
      case 'running':
      case 'enGarde':
        this.handleGroundedMovement(moveInput, delta);
        this.handleGroundedJump();
        break;

      case 'jumping':
      case 'falling':
        this.handleAirMovement(moveInput, delta);
        this.checkLedgeGrab();
        break;

      case 'hanging':
        this.handleHanging();
        break;

      case 'climbing':
        this.handleClimbing(delta);
        break;
    }

    // Apply gravity
    if (this.state !== 'hanging' && this.state !== 'climbing') {
      this.velocity.y -= this.gravity * delta;
    }

    // Apply movement
    this.position.x += this.velocity.x * delta;
    this.position.y += this.velocity.y * delta;
    this.position.z += this.velocity.z * delta;

    this.object.position.copy(this.position);
  }

  private handleGroundedMovement(inputDir: THREE.Vector3, delta: number) {
    const isEnGarde = this.isEnGarde;
    const maxSpeed = isEnGarde ? 6.0 : this.maxRunSpeed;
    const accel = isEnGarde ? 14 : this.runAcceleration;
    const decel = isEnGarde ? 18 : this.runDeceleration;

    if (inputDir.lengthSq() > 0.01) {
      const target = inputDir.clone().multiplyScalar(maxSpeed);
      this.velocity.x = THREE.MathUtils.lerp(this.velocity.x, target.x, accel * delta);
      this.velocity.z = THREE.MathUtils.lerp(this.velocity.z, target.z, accel * delta);
    } else {
      const friction = decel + this.friction;
      this.velocity.x *= 1 - Math.min(friction * delta, 0.92);
      this.velocity.z *= 1 - Math.min(friction * delta, 0.92);
    }

    if (inputDir.lengthSq() > 0.1) {
      this.state = isEnGarde ? 'enGarde' : 'running';
    } else {
      this.state = isEnGarde ? 'enGarde' : 'standing';
    }
  }

  private handleGroundedJump() {
    if (this.input.isJumpPressed() && this.isGrounded()) {
      const force = this.input.isJumpHeldLonger?.() ? this.jumpForce : this.shortHopForce;
      this.velocity.y = force;
      this.state = 'jumping';
    }
  }

  private handleAirMovement(inputDir: THREE.Vector3, delta: number) {
    const control = this.airControl;

    if (inputDir.lengthSq() > 0.01) {
      const target = inputDir.clone().multiplyScalar(this.maxRunSpeed * 0.9);
      this.velocity.x = THREE.MathUtils.lerp(this.velocity.x, target.x, control * delta);
      this.velocity.z = THREE.MathUtils.lerp(this.velocity.z, target.z, control * delta);
    }

    if (this.velocity.y < 0) {
      this.state = 'falling';
    }
  }

  private checkLedgeGrab() {
    // Placeholder for real ledge detection logic
    if (
      this.state === 'falling' &&
      Math.abs(this.velocity.x) <= this.ledgeGrabMaxSpeed &&
      this.velocity.y >= -this.ledgeGrabMaxDownSpeed
    ) {
      // For the slice we simulate successful grabs occasionally for testing
      if (Math.random() < 0.12) {
        this.state = 'hanging';
        this.velocity.set(0, 0, 0);
      }
    }
  }

  private handleHanging() {
    this.velocity.set(0, 0, 0);
    if (this.input.isJumpPressed()) {
      this.state = 'falling';
    }
  }

  private handleClimbing(_delta: number) {
    // Very limited movement while climbing
    this.velocity.x *= 0.6;
    if (this.input.isJumpPressed()) {
      this.state = 'standing';
      this.velocity.y = 6;
    }
  }

  private getMovementInput(): THREE.Vector3 {
    const input = new THREE.Vector3();

    if (this.isMobile) {
      input.x = this.input.move?.x || 0;
      input.z = this.input.move?.y || 0;
    } else {
      if (this.input.keys['w'] || this.input.keys['arrowup']) input.z -= 1;
      if (this.input.keys['s'] || this.input.keys['arrowdown']) input.z += 1;
      if (this.input.keys['a'] || this.input.keys['arrowleft']) input.x -= 1;
      if (this.input.keys['d'] || this.input.keys['arrowright']) input.x += 1;
    }

    if (input.lengthSq() > 1) input.normalize();
    return input;
  }

  private isGrounded(): boolean {
    return this.position.y <= 0.1;
  }

  // Public API
  public getPosition(): THREE.Vector3 {
    return this.position;
  }

  public getVelocity(): THREE.Vector3 {
    return this.velocity;
  }

  public getCurrentState(): MovementState {
    return this.state;
  }

  public setEnGarde(active: boolean) {
    this.isEnGarde = active;
  }

  public takeHit(knockback: number = 5) {
    this.isHurt = true;
    this.hurtTimer = 0.6;
    this.velocity.x += (Math.random() - 0.5) * knockback;
    this.velocity.y = 4;
    this.state = 'hurt';
  }
}
