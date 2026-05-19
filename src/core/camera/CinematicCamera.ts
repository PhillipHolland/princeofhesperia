import * as THREE from 'three';

/**
 * Cinematic 2.5D Camera for Prince of Hesperia.
 * 
 * Primarily locked to a side-view plane (like classic Prince of Persia),
 * but with deliberate cinematic freedom: push/pull, vertical shifts,
 * and dramatic angles that enhance tension and weight without breaking readability.
 */
export type CameraMode = 
  | 'standard'   // Normal traversal
  | 'combat'     // Tighter, more stable framing for fights
  | 'dramatic'   // Pulled back or angled for big moments (falls, collapses)
  | 'close'      // Intimate framing (emotional beats, precise platforming)
  | 'wide'       // Very pulled back for scale and atmosphere
  | 'hurt';      // Reacts to player being damaged (slight lag + shake)

export class CinematicCamera {
  private camera: THREE.PerspectiveCamera;
  private mode: CameraMode = 'standard';

  // Base side-view offset — tuned for classic Prince of Persia profile view
  // We want the camera almost purely from the side (strong silhouette), not 3/4 angle
  private baseOffset = new THREE.Vector3(0, 6.5, 26); // x offset, height, depth (Z)

  // Smoothed targets
  private currentPosition = new THREE.Vector3();
  private targetPosition = new THREE.Vector3();

  private currentLookAt = new THREE.Vector3();
  private targetLookAt = new THREE.Vector3();

  // Smoothing (lower = more cinematic lag/weight)
  private positionLerp = 0.08;
  private lookAtLerp = 0.12;

  // Hurt reaction state
  private hurtIntensity = 0;
  private hurtDecay = 0;

  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera;
    this.currentPosition.copy(camera.position);
    this.currentLookAt.set(0, 4, 0);
  }

  public setMode(mode: CameraMode) {
    this.mode = mode;

    if (mode === 'hurt') {
      this.hurtIntensity = 0.9;
      this.hurtDecay = 1.4;
    }
  }

  public update(playerPosition: THREE.Vector3, delta: number) {
    const offset = this.getOffsetForCurrentMode();

    this.targetPosition.copy(playerPosition).add(offset);

    // Look at upper body for clean side-view profile (classic PoP framing)
    this.targetLookAt.copy(playerPosition);
    this.targetLookAt.y += 3.2;
    // Very little Z look offset — we want to see the character in strong profile, not 3/4
    this.targetLookAt.z += 0.4;

    // Apply hurt shake + slower recovery (feels heavy)
    if (this.hurtIntensity > 0) {
      const shake = this.hurtIntensity * 0.35;
      this.targetPosition.x += (Math.random() - 0.5) * shake;
      this.targetPosition.y += (Math.random() - 0.5) * shake * 0.5;
      this.hurtIntensity = Math.max(0, this.hurtIntensity - delta * 2.2);
    }

    const posLerp = this.hurtDecay > 0 ? 0.035 : this.positionLerp;
    this.currentPosition.lerp(this.targetPosition, posLerp);
    this.currentLookAt.lerp(this.targetLookAt, this.lookAtLerp);

    if (this.hurtDecay > 0) {
      this.hurtDecay = Math.max(0, this.hurtDecay - delta);
    }

    this.camera.position.copy(this.currentPosition);
    this.camera.lookAt(this.currentLookAt);
  }

  private getOffsetForCurrentMode(): THREE.Vector3 {
    const offset = this.baseOffset.clone();

    switch (this.mode) {
      case 'combat':
        offset.z *= 0.65;   // push in for intensity
        offset.y *= 0.88;
        break;

      case 'dramatic':
        offset.z *= 1.45;   // pull back for scale
        offset.y *= 1.18;
        break;

      case 'close':
        offset.z *= 0.52;
        offset.y *= 0.82;
        break;

      case 'wide':
        offset.z *= 1.7;
        offset.y *= 1.3;
        break;

      case 'hurt':
        offset.z *= 1.12;
        offset.y *= 1.08;
        break;

      default:
        break;
    }

    return offset;
  }

  public getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }

  // For external tuning during development
  public setBaseOffset(x: number, y: number, z: number) {
    this.baseOffset.set(x, y, z);
  }

  public setLerpSpeeds(position: number, lookAt: number) {
    this.positionLerp = position;
    this.lookAtLerp = lookAt;
  }
}
