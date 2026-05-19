import * as THREE from 'three';
import { PlayerController } from '../player/PlayerController';
import { InputManager } from '../../core/input/InputManager';

export interface AttackDefinition {
  name: string;
  windup: number;
  active: number;
  recovery: number;
  damage: number;
  range: number;
}

export class CombatController {
  private state: 'idle' | 'winding' | 'active' | 'recovery' = 'idle';
  private timer = 0;
  private currentAttack: AttackDefinition | null = null;

  private readonly attacks: Record<string, AttackDefinition> = {
    quick: { name: 'quick', windup: 0.08, active: 0.12, recovery: 0.22, damage: 1, range: 2.4 },
    heavy: { name: 'heavy', windup: 0.22, active: 0.18, recovery: 0.45, damage: 2, range: 2.6 },
  };

  constructor(
    private player: PlayerController,
    private input: InputManager
  ) {}

  public update(delta: number) {
    if (this.state !== 'idle') {
      this.timer -= delta;

      if (this.timer <= 0) {
        if (this.state === 'winding') {
          this.state = 'active';
          this.timer = this.currentAttack!.active;
        } else if (this.state === 'active') {
          this.state = 'recovery';
          this.timer = this.currentAttack!.recovery;
        } else {
          this.state = 'idle';
          this.currentAttack = null;
        }
      }
    }

    // Input handling (F = quick, G = heavy for keyboard testing)
    if (this.state === 'idle' && this.canAttack()) {
      if (this.input.keys['f']) {
        this.startAttack('quick');
      } else if (this.input.keys['g']) {
        this.startAttack('heavy');
      }
    }
  }

  private canAttack(): boolean {
    const state = this.player.getCurrentState();
    return state !== 'hurt' && state !== 'hanging' && state !== 'climbing';
  }

  private startAttack(type: 'quick' | 'heavy') {
    this.currentAttack = this.attacks[type];
    this.state = 'winding';
    this.timer = this.currentAttack.windup;
  }

  public getCurrentState() {
    return this.state;
  }

  public getActiveAttack(): AttackDefinition | null {
    return this.state === 'active' ? this.currentAttack : null;
  }

  public getHitboxPosition(playerPos: THREE.Vector3): THREE.Vector3 | null {
    const attack = this.getActiveAttack();
    if (!attack) return null;

    const dir = 1; // facing right for now
    return new THREE.Vector3(
      playerPos.x + dir * attack.range * 0.7,
      playerPos.y + 1.6,
      playerPos.z
    );
  }
}
