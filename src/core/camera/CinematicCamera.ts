import * as THREE from 'three';

/**
 * Cinematic 2.5D Camera
 * 
 * Designed for side-view gameplay (like Prince of Persia) with cinematic freedom.
 * The camera stays primarily on the side but can dynamically push in/out, 
 * shift vertically, and create dramatic angles without breaking readability.
 */
export type CameraMode = 'standard' | 'combat' | 'dramatic' | 'close' | 'wide';

export class CinematicCamera {
  private camera: THREE.PerspectiveCamera;

  // Base offset from the player (side view)
  private baseOffset = new THREE.Vector3(0, 8, 18); // height, depth (side), forward

  // Current smoothed position
  private currentPosition = new THREE.Vector3();
  private targetPosition = new THREE.Vector3();

  // Look-at target with some lag for cinematic feel
  private currentLookAt = new THREE.Vector3();
  private targetLookAt = new THREE.Vector3();

  // Current mode
  private mode: CameraMode = 'standard';

  // Smoothing factors (lower = more lag / weighty)
  private positionLerp = 0.08;
  private lookAtLerp = 0.12;

  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera;
    this.currentPosition.copy(camera.position);
    this.currentLookAt.set(0, 4, 0);
  }

  public setMode(mode: CameraMode) {
    this.mode = mode;
  }

  public update(playerPosition: THREE.Vector3, delta: number) {
    // Calculate desired offset based on current mode
    const offset = this.getOffsetForMode();

    // Target position (player + offset)
    this.targetPosition.copy(playerPosition).add(offset);

    // Target look-at point (slightly ahead of the player for better framing)
    this.targetLookAt.copy(playerPosition);
    this.targetLookAt.y += 4; // Look at upper body/head height
    this.targetLookAt.z += 1.5; // Slight look-ahead

    // Smooth interpolation (gives weight and cinematic feel)
    this.currentPosition.lerp(this.targetPosition, this.positionLerp);
    this.currentLookAt.lerp(this.targetLookAt, this.lookAtLerp);

    // Apply to camera
    this.camera.position.copy(this.currentPosition);
    this.camera.lookAt(this.currentLookAt);
  }

  private getOffsetForMode(): THREE.Vector3 {
    const offset = this.baseOffset.clone();

    switch (this.mode) {
      case 'combat':
        // Push in for more intense close combat
        offset.z *= 0.7;
        offset.y *= 0.9;
        break;

      case 'dramatic':
        // Pull back for scale and drama (collapsing environments, big moments)
        offset.z *= 1.4;
        offset.y *= 1.15;
        break;

      case 'close':
        // Very intimate for emotional or high-tension moments
        offset.z *= 0.55;
        offset.y *= 0.85;
        break;

      case 'wide':
        // Very pulled back for exploration or big reveals
        offset.z *= 1.7;
        offset.y *= 1.25;
        break;

      case 'standard':
      default:
        // Default cinematic follow
        break;
    }

    return offset;
  }

  public getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }

  // Utility methods for external control
  public setBaseOffset(x: number, y: number, z: number) {
    this.baseOffset.set(x, y, z);
  }

  public setLerpSpeeds(position: number, lookAt: number) {
    this.positionLerp = position;
    this.lookAtLerp = lookAt;
  }
}
