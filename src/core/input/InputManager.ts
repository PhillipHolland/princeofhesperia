import * as THREE from 'three';

export class InputManager {
  public keys: Record<string, boolean> = {};
  public move = new THREE.Vector2();

  public jump = false;
  public attack = false;

  private isMobile: boolean;

  constructor(isMobile: boolean) {
    this.isMobile = isMobile;
    if (!isMobile) {
      this.setupKeyboard();
    }
  }

  private setupKeyboard() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;
    });
    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });
  }

  public update() {
    if (!this.isMobile) {
      this.move.set(0, 0);
      if (this.keys['w'] || this.keys['arrowup']) this.move.y = -1;
      if (this.keys['s'] || this.keys['arrowdown']) this.move.y = 1;
      if (this.keys['a'] || this.keys['arrowleft']) this.move.x = -1;
      if (this.keys['d'] || this.keys['arrowright']) this.move.x = 1;

      if (this.move.lengthSq() > 1) this.move.normalize();

      this.attack = this.keys['f'] || this.keys[' '];
    }
  }

  public isAttackPressed(): boolean {
    return this.attack;
  }

  public isHeavyAttackHeld(): boolean {
    return this.keys['shift'];
  }
}
