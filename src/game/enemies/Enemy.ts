import * as THREE from 'three';
import { PlayerController } from '../player/PlayerController';
import { CombatController } from '../combat/CombatController';

export class Enemy {
  public mesh: THREE.Group;
  public position: THREE.Vector3;
  private velocity = new THREE.Vector3();
  private health = 3;
  private state: 'idle' | 'chase' | 'attack' | 'hurt' | 'dead' = 'idle';
  private attackCooldown = 0;
  private hurtTimer = 0;

  constructor(scene: THREE.Scene, startPos: THREE.Vector3) {
    this.position = startPos.clone();
    this.mesh = this.createEnemyMesh();
    this.mesh.position.copy(this.position);
    scene.add(this.mesh);
  }

  private createEnemyMesh(): THREE.Group {
    const g = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: 0x2a2f38, roughness: 0.8 });
    const armor = new THREE.MeshStandardMaterial({ color: 0x1f242b, roughness: 0.6, metalness: 0.3 });

    g.add(new THREE.Mesh(new THREE.BoxGeometry(1.1, 2.1, 0.7), mat));
    g.children[0].position.y = 1.05;

    g.add(new THREE.Mesh(new THREE.BoxGeometry(1.22, 0.7, 0.82), armor));
    g.children[1].position.y = 1.65;

    g.add(new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.7, 0.68), armor));
    g.children[2].position.y = 2.3;

    return g;
  }

  public update(delta: number, player: PlayerController, _combat: CombatController) {
    if (this.state === 'dead') return;

    const playerPos = player.getPosition();
    const dx = playerPos.x - this.position.x;

    if (this.state === 'hurt') {
      this.hurtTimer -= delta;
      this.velocity.x *= 0.85;
      if (this.hurtTimer <= 0) this.state = 'idle';
    } else {
      // Simple chase
      const dist = Math.abs(dx);
      if (dist > 1.8 && dist < 18) {
        this.state = 'chase';
        const dir = Math.sign(dx);
        this.velocity.x = THREE.MathUtils.lerp(this.velocity.x, dir * 4.2, 6 * delta);
      } else {
        this.velocity.x *= 0.82;
        if (dist < 1.8 && this.attackCooldown <= 0) {
          this.state = 'attack';
          this.attackCooldown = 1.1;
          // Simple attack: if player is close, hit them
          if (dist < 2.8) {
            player.takeHit(3.5);
          }
        }
      }
    }

    this.attackCooldown = Math.max(0, this.attackCooldown - delta);

    this.position.x += this.velocity.x * delta;
    this.position.y = Math.max(0, this.position.y);
    this.mesh.position.copy(this.position);
  }

  public takeHit(damage: number, knockback: number) {
    this.health -= damage;
    this.velocity.x = (Math.random() - 0.5) * knockback * 1.5;
    this.hurtTimer = 0.35;
    this.state = 'hurt';

    if (this.health <= 0) {
      this.state = 'dead';
    }
  }

  public isAlive(): boolean {
    return this.state !== 'dead';
  }
}
