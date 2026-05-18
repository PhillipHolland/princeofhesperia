import './style.css';
import * as THREE from 'three';
import { CinematicCamera } from './core/camera/CinematicCamera';
import { InputManager } from './core/input/InputManager';
import { PlayerController } from './game/player/PlayerController';
import { CombatController } from './game/combat/CombatController';
import { Enemy } from './game/enemies/Enemy';

// =====================================================
// PRINCE OF HESPERIA - High-end Stylized Sci-Fi
// Mobile Safari optimized • Cinematic angled camera
// =====================================================

const container = document.getElementById('app')!;

// Clear default Vite content
container.innerHTML = '';

// Three.js Renderer - tuned for mobile Safari
const renderer = new THREE.WebGLRenderer({
  antialias: false, // Better performance on iOS
  powerPreference: 'high-performance',
  alpha: false,
});

const pixelRatio = Math.min(window.devicePixelRatio, 2);
renderer.setPixelRatio(pixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

container.appendChild(renderer.domElement);

// Scene
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x0a0b0f, 22, 55);

// Cinematic 2.5D Camera
const camera = new THREE.PerspectiveCamera(48, window.innerWidth / window.innerHeight, 0.5, 120);
const cinematicCamera = new CinematicCamera(camera);
const cinematicCamera = new CinematicCamera(camera);

// Lighting - High-end stylized, cinematic, mobile-friendly
const hemiLight = new THREE.HemisphereLight(0x5a6a7a, 0x0c0e12, 0.65);
scene.add(hemiLight);

// Key light (sun) - strong direction + good shadows
const sunLight = new THREE.DirectionalLight(0xffe8c0, 1.25);
sunLight.position.set(18, 35, 12);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 1024;
sunLight.shadow.mapSize.height = 1024;
sunLight.shadow.camera.near = 8;
sunLight.shadow.camera.far = 85;
sunLight.shadow.camera.left = -22;
sunLight.shadow.camera.right = 22;
sunLight.shadow.camera.top = 22;
sunLight.shadow.camera.bottom = -22;
sunLight.shadow.bias = -0.0008;
scene.add(sunLight);

// Fill / rim light from the opposite side (very important for silhouette on mobile)
const rimLight = new THREE.DirectionalLight(0x7dd3fc, 0.45);
rimLight.position.set(-16, 20, -18);
scene.add(rimLight);

// Ground - more interesting surface
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(60, 60),
  new THREE.MeshStandardMaterial({ 
    color: 0x1f2937, 
    roughness: 0.88,
    metalness: 0.08 
  })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Platforms with better materials
const platformMat = new THREE.MeshStandardMaterial({ 
  color: 0x3f322a, 
  roughness: 0.78,
  metalness: 0.15 
});

const p1 = new THREE.Mesh(new THREE.BoxGeometry(8, 1, 8), platformMat);
p1.position.set(0, 3, -12);
p1.castShadow = true;
p1.receiveShadow = true;
scene.add(p1);

const p2 = new THREE.Mesh(new THREE.BoxGeometry(6, 1, 10), platformMat);
p2.position.set(14, 5, -8);
p2.castShadow = true;
p2.receiveShadow = true;
scene.add(p2);

// === Game Systems ===
const input = new InputManager(true); // mobile-first

const prince = createPrinceMesh();
scene.add(prince);

const player = new PlayerController(prince, input, true);

// We need to create a CombatController (import at top)
const combat = new CombatController(player, input);

// Enemies for combat testing
const enemies: any[] = [];
function spawnTestEnemies() {
  const e1 = new Enemy(scene, new THREE.Vector3(6, 0, -8));
  const e2 = new Enemy(scene, new THREE.Vector3(-5, 0, -14));
  enemies.push(e1, e2);
}
spawnTestEnemies();



// Basic animation loop
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const delta = Math.min(clock.getDelta(), 0.1);

  input.update();
  player.update(delta);
  combat.update(delta);

  // Update enemies
  for (let i = enemies.length - 1; i >= 0; i--) {
    const enemy = enemies[i];
    enemy.update(delta, player, combat);

    if (!enemy.isAlive()) {
      scene.remove(enemy.mesh);
      enemies.splice(i, 1);
    }
  }

  // Update enemies
  for (let i = enemies.length - 1; i >= 0; i--) {
    const enemy = enemies[i];
    enemy.update(delta, player, combat);

    if (!enemy.isAlive()) {
      scene.remove(enemy.mesh);
      enemies.splice(i, 1);
    }
  }

  // Cinematic 2.5D Camera
  cinematicCamera.update(prince.position, delta);

  renderer.render(scene, camera);
}

animate();

// Temporary keyboard for desktop testing
(window as any).keys = {};
window.addEventListener('keydown', (e) => ((window as any).keys[e.key.toLowerCase()] = true));
window.addEventListener('keyup', (e) => ((window as any).keys[e.key.toLowerCase()] = false));

// Resize handler
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});



// Keyboard input (temporary for desktop testing)
(window as any).keys = {};
window.addEventListener('keydown', (e) => ((window as any).keys[e.key.toLowerCase()] = true));
window.addEventListener('keyup', (e) => ((window as any).keys[e.key.toLowerCase()] = false));

console.log('%c[Prince of Hesperia] Combat testing enabled. WASD to move, F or Space to attack.', 'color:#64748b');

function createPrinceMesh() {
  const group = new THREE.Group();

  // Materials - higher quality for stylized look
  const bodyMat = new THREE.MeshStandardMaterial({ 
    color: 0x2c2520, 
    roughness: 0.65, 
    metalness: 0.12 
  });
  const armorMat = new THREE.MeshStandardMaterial({ 
    color: 0x3f322a, 
    roughness: 0.5, 
    metalness: 0.28 
  });
  const headMat = new THREE.MeshStandardMaterial({ 
    color: 0x1a1a1f, 
    roughness: 0.55 
  });
  const accentMat = new THREE.MeshStandardMaterial({ 
    color: 0xa15c3a, 
    roughness: 0.4, 
    metalness: 0.35 
  });

  // Torso
  const torso = new THREE.Mesh(
    new THREE.CylinderGeometry(1.0, 1.2, 2.4, 14),
    bodyMat
  );
  torso.position.y = 1.2;
  torso.castShadow = true;
  group.add(torso);

  // Chest armor
  const chest = new THREE.Mesh(
    new THREE.CylinderGeometry(1.1, 1.25, 1.1, 14),
    armorMat
  );
  chest.position.y = 1.65;
  chest.castShadow = true;
  group.add(chest);

  // Head
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.82, 16, 16),
    headMat
  );
  head.position.y = 2.7;
  head.castShadow = true;
  group.add(head);

  // Helmet
  const helmet = new THREE.Mesh(
    new THREE.CylinderGeometry(0.78, 0.82, 0.85, 16),
    armorMat
  );
  helmet.position.y = 2.8;
  helmet.castShadow = true;
  group.add(helmet);

  // Visor (tech accent)
  const visor = new THREE.Mesh(
    new THREE.CylinderGeometry(0.62, 0.62, 0.22, 16),
    accentMat
  );
  visor.position.y = 2.92;
  visor.rotation.x = Math.PI / 2;
  group.add(visor);

  // Left Arm (Shield)
  const leftArm = new THREE.Mesh(
    new THREE.CylinderGeometry(0.36, 0.4, 2.1, 12),
    armorMat
  );
  leftArm.position.set(-1.4, 1.5, 0);
  leftArm.rotation.z = 0.4;
  leftArm.castShadow = true;
  group.add(leftArm);

  // Shield plate
  const shield = new THREE.Mesh(
    new THREE.CylinderGeometry(0.95, 0.95, 0.28, 8),
    armorMat
  );
  shield.position.set(-2.15, 1.0, 0);
  shield.rotation.z = Math.PI / 2;
  shield.castShadow = true;
  group.add(shield);

  // Right Arm (Weapon)
  const rightArm = new THREE.Mesh(
    new THREE.CylinderGeometry(0.38, 0.42, 2.25, 12),
    armorMat
  );
  rightArm.position.set(1.45, 1.45, 0);
  rightArm.rotation.z = -0.45;
  rightArm.castShadow = true;
  group.add(rightArm);

  // Weapon head
  const weapon = new THREE.Mesh(
    new THREE.BoxGeometry(1.05, 0.3, 1.4),
    accentMat
  );
  weapon.position.set(2.45, 1.8, 0);
  weapon.castShadow = true;
  group.add(weapon);

  // Legs
  const legMat = new THREE.MeshStandardMaterial({ 
    color: 0x2c2520, 
    roughness: 0.72 
  });

  const leftLeg = new THREE.Mesh(
    new THREE.CylinderGeometry(0.4, 0.36, 1.6, 12),
    legMat
  );
  leftLeg.position.set(-0.55, 0.8, 0);
  leftLeg.castShadow = true;
  group.add(leftLeg);

  const rightLeg = new THREE.Mesh(
    new THREE.CylinderGeometry(0.4, 0.36, 1.6, 12),
    legMat
  );
  rightLeg.position.set(0.55, 0.8, 0);
  rightLeg.castShadow = true;
  group.add(rightLeg);

  return group;
}
