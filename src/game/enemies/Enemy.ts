import * as THREE from 'three';
import { PlayerController } from '../player/PlayerController';
import { CombatController } from '../combat/CombatController';

export type EnemyState = 'idle' | 'chase' | 'attack' | 'hurt' | 'dead';

export class Enemy {
  public mesh: THREE.Group;
  protected position: THREE.Vector3;
  protected velocity = new THREE.Vector3();

  protected state: EnemyState = 'idle';
  protected health = 3;
  protected maxHealth = 3;

  protected hurtTimer = 0;
  protected attackCooldown = 0;

  protected detectionRange = 12;
  protected attackRange = 2.2;
  protected moveSpeed = 3.5;

  constructor(scene: THREE.Scene, startPosition: THREE.Vector3) {
    this.position = startPosition.clone();
    this.mesh = this.createMesh();
    this.mesh.position.copy(this.position);
    scene.add(this.mesh);
  }

  protected createMesh(): THREE.Group {
    const group = new THREE.Group();

    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.65, 0.75, 1.9, 12),
      new THREE.MeshStandardMaterial({ color: 0x4a3f35, roughness: 0.75 })
    );
    body.position.y = 0.9;
    group.add(body);

    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.6, 12, 12),
      new THREE.MeshStandardMaterial({ color: 0x2a2a2f, roughness: 0.65 })
    );
    head.position.y = 2.15;
    group.add(head);

    const core = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 10, 10),
      new THREE.MeshStandardMaterial({ 
        color: 0xff6b6b, 
        emissive: 0x661111,
        emissiveIntensity: 0.6 
      })
    );
    core.position.y = 1.4;
    group.add(core);

    return group;
  }

  public update(delta: number, player: PlayerController, combat: CombatController) {
    if (this.state === 'dead') return;

    this.attackCooldown -= delta;

    if (this.state === 'hurt') {
      this.hurtTimer -= delta;
      this.velocity.x *= 0.85;
      this.position.x += this.velocity.x * delta;

      if (this.hurtTimer <= 0) {
        this.state = 'idle';
      }
      this.syncMesh();
      return;
    }

    this.checkForPlayerAttack(combat);

    const distanceToPlayer = this.position.distanceTo(player.getPosition());

    if (distanceToPlayer < this.detectionRange && this.state !== 'attack') {
      this.state = 'chase';
    }

    if (this.state === 'chase') {
      this.handleChase(player, distanceToPlayer, delta);
    }

    if (this.state === 'attack' && this.attackCooldown <= 0) {
      this.tryAttack(player);
    }

    this.position.x += this.velocity.x * delta;
    this.syncMesh();
  }

  private handleChase(player: PlayerController, distance: number, _delta: number) {
    const direction = player.getPosition().x - this.position.x;
    const dir = Math.sign(direction);

    this.velocity.x = dir * this.moveSpeed;

    if (distance < this.attackRange && this.attackCooldown <= 0) {
      this.state = 'attack';
      this.velocity.x = 0;
    }
  }

  private tryAttack(player: PlayerController) {
    this.attackCooldown = 1.2;

    const distance = this.position.distanceTo(player.getPosition());

    if (distance < 2.8) {
      console.log('%c[Enemy] Hit player!', 'color:#ff6b6b');
    }

    setTimeout(() => {
      if (this.state !== 'dead') this.state = 'chase';
    }, 600);
  }

  private checkForPlayerAttack(combat: CombatController) {
    if (!combat || combat.getCurrentState() !== 'active') return;

    const hitPos = combat.getHitboxPosition();
    const hitRadius = combat.getHitboxRadius();

    const distance = this.position.distanceTo(hitPos);

    if (distance < hitRadius + 0.8) {
      this.takeHit();
    }
  }

  public takeHit() {
    if (this.state === 'hurt' || this.state === 'dead') return;

    this.health -= 1;
    this.state = 'hurt';
    this.hurtTimer = 0.6;
    this.velocity.x = (Math.random() - 0.5) * 6;

    console.log(`%c[Enemy] Took damage! HP: ${this.health}`, 'color:#ff9f43');

    if (this.health <= 0) {
      this.die();
    }
  }

  private die() {
    this.state = 'dead';
    this.mesh.rotation.z = Math.PI / 2;
    console.log('%c[Enemy] Died', 'color:#ff6b6b');
  }

  private syncMesh() {
    this.mesh.position.x = this.position.x;
    this.mesh.position.y = this.position.y + 0.9;
    this.mesh.position.z = this.position.z;
  }

  public getPosition(): THREE.Vector3 {
    return this.position;
  }

  public isAlive(): boolean {
    return this.state !== 'dead';
  }
}
