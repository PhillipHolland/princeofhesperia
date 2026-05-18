import * as THREE from 'three';
import { InputManager } from '../../core/input/InputManager';
import { PlayerController } from '../player/PlayerController';

export type AttackType = 'quick' | 'heavy';

export interface AttackDefinition {
  type: AttackType;
  windupDuration: number;
  activeDuration: number;
  recoveryDuration: number;
  damage: number;
  hitboxRadius: number;
}

export type CombatState = 'idle' | 'winding_up' | 'active' | 'recovery';

export class CombatController {
  private state: CombatState = 'idle';
  private currentAttack: AttackDefinition | null = null;
  private timer = 0;
  private hitboxPosition = new THREE.Vector3();

  private player: PlayerController;
  private input: InputManager;

  constructor(player: PlayerController, input: InputManager) {
    this.player = player;
    this.input = input;
  }

  public update(delta: number) {
    if (this.state === 'idle') {
      this.tryStartAttack();
      return;
    }

    this.timer -= delta;

    if (this.timer <= 0) {
      this.advanceState();
    }

    if (this.state === 'active') {
      this.updateHitboxPosition();
    }
  }

  private tryStartAttack() {
    if (!this.input.isAttackPressed()) return;

    const type: AttackType = this.input.isHeavyAttackHeld?.() ? 'heavy' : 'quick';
    this.startAttack(type);
  }

  private startAttack(type: AttackType) {
    this.currentAttack = this.getAttackDefinition(type);
    this.state = 'winding_up';
    this.timer = this.currentAttack.windupDuration;
  }

  private advanceState() {
    if (!this.currentAttack) {
      this.state = 'idle';
      return;
    }

    switch (this.state) {
      case 'winding_up':
        this.state = 'active';
        this.timer = this.currentAttack.activeDuration;
        break;

      case 'active':
        this.state = 'recovery';
        this.timer = this.currentAttack.recoveryDuration;
        break;

      case 'recovery':
        this.state = 'idle';
        this.currentAttack = null;
        break;
    }
  }

  private updateHitboxPosition() {
    const forward = 1.8;
    const playerPos = this.player.getPosition();

    this.hitboxPosition.set(
      playerPos.x + forward, 
      playerPos.y + 1.2, 
      playerPos.z
    );
  }

  private getAttackDefinition(type: AttackType): AttackDefinition {
    if (type === 'heavy') {
      return {
        type: 'heavy',
        windupDuration: 0.35,
        activeDuration: 0.2,
        recoveryDuration: 0.55,
        damage: 2,
        hitboxRadius: 1.4,
      };
    } else {
      return {
        type: 'quick',
        windupDuration: 0.18,
        activeDuration: 0.15,
        recoveryDuration: 0.32,
        damage: 1,
        hitboxRadius: 1.1,
      };
    }
  }

  public getCurrentState(): CombatState {
    return this.state;
  }

  public getHitboxPosition(): THREE.Vector3 {
    return this.hitboxPosition;
  }

  public getHitboxRadius(): number {
    return this.currentAttack ? this.currentAttack.hitboxRadius : 0;
  }
}
