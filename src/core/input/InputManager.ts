export class InputManager {
  public keys: Record<string, boolean> = {};
  public move = { x: 0, y: 0 };


  private jumpPressed = false;
  private jumpHeldFrames = 0;

  constructor(private isMobile: boolean) {
    window.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;
    });
    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });

    // Touch support (basic for now - full virtual joystick in next pass)
    if (isMobile) {
      this.setupBasicTouch();
    }
  }

  private setupBasicTouch() {
    window.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      this.move.x = (touch.clientX / window.innerWidth - 0.5) * 1.6;
      this.move.y = (touch.clientY / window.innerHeight - 0.5) * 0.8;
    });

    window.addEventListener('touchmove', (e) => {
      const touch = e.touches[0];
      this.move.x = (touch.clientX / window.innerWidth - 0.5) * 1.6;
      this.move.y = (touch.clientY / window.innerHeight - 0.5) * 0.8;
    });

    window.addEventListener('touchend', () => {
      this.move.x = 0;
      this.move.y = 0;
    });
  }

  public update() {
    if (!this.isMobile) {
      this.move.x = 0;
      this.move.y = 0;

      if (this.keys['a'] || this.keys['arrowleft']) this.move.x = -1;
      if (this.keys['d'] || this.keys['arrowright']) this.move.x = 1;
      if (this.keys['w'] || this.keys['arrowup']) this.move.y = -1;
      if (this.keys['s'] || this.keys['arrowdown']) this.move.y = 1;
    }

    if (this.keys[' ']) {
      this.jumpPressed = true;
      this.jumpHeldFrames++;
    } else {
      this.jumpPressed = false;
      this.jumpHeldFrames = 0;
    }
  }

  public isJumpPressed(): boolean {
    return this.jumpPressed;
  }

  public isJumpHeldLonger(): boolean {
    return this.jumpHeldFrames > 8;
  }

  public getMoveVector() {
    return this.move;
  }
}
