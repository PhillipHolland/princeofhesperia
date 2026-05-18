import * as THREE from 'three';
import { InputManager } from '../../core/input/InputManager';

export class PlayerController {
  private velocity = new THREE.Vector3();

  private object: THREE.Group;
  private input: InputManager;
  private isMobile: boolean;

  constructor(object: THREE.Group, input: InputManager, isMobile: boolean) {
    this.object = object;
    this.input = input;
    this.isMobile = isMobile;
  }

  public update(delta: number) {
    const moveInput = this.getMovementInput();

    if (moveInput.lengthSq() > 0.01) {
      const targetSpeed = 7.5;
      const accel = 20;

      const desired = moveInput.clone().multiplyScalar(targetSpeed);
      this.velocity.x = THREE.MathUtils.lerp(this.velocity.x, desired.x, accel * delta);
      this.velocity.z = THREE.MathUtils.lerp(this.velocity.z, desired.z, accel * delta);
    } else {
      const decel = 16;
      this.velocity.x *= 1 - Math.min(decel * delta, 0.9);
      this.velocity.z *= 1 - Math.min(decel * delta, 0.9);
    }

    this.object.position.x += this.velocity.x * delta;
    this.object.position.z += this.velocity.z * delta;
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

  public getPosition(): THREE.Vector3 {
    return this.object.position;
  }
}
