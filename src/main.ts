import './style.css';
import * as THREE from 'three';

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

// Cinematic Angled Camera
const camera = new THREE.PerspectiveCamera(48, window.innerWidth / window.innerHeight, 0.5, 120);
camera.position.set(0, 26, 22);
camera.lookAt(0, 2, 0);

// Lighting - moody, stylized, performant on mobile
const hemiLight = new THREE.HemisphereLight(0x4a5568, 0x0f1116, 0.6);
scene.add(hemiLight);

const sunLight = new THREE.DirectionalLight(0xfff1d6, 1.1);
sunLight.position.set(22, 32, 14);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 1024;
sunLight.shadow.mapSize.height = 1024;
sunLight.shadow.camera.near = 5;
sunLight.shadow.camera.far = 80;
scene.add(sunLight);

// Ground
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(60, 60),
  new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.92 })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Simple test platforms
const platformMat = new THREE.MeshStandardMaterial({ color: 0x3f322a, roughness: 0.82 });
const p1 = new THREE.Mesh(new THREE.BoxGeometry(8, 1, 8), platformMat);
p1.position.set(0, 3, -12);
p1.castShadow = true;
scene.add(p1);

const p2 = new THREE.Mesh(new THREE.BoxGeometry(6, 1, 10), platformMat);
p2.position.set(14, 5, -8);
p2.castShadow = true;
scene.add(p2);

// Temporary Prince placeholder
const prince = createPrinceMesh();
scene.add(prince);

// Basic animation loop
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const delta = Math.min(clock.getDelta(), 0.1);

  // Simple forward movement test (WASD will be replaced with proper input later)
  const speed = 4.0;
  if ((window as any).keys?.w) prince.position.z -= speed * delta;
  if ((window as any).keys?.s) prince.position.z += speed * delta;
  if ((window as any).keys?.a) prince.position.x -= speed * delta;
  if ((window as any).keys?.d) prince.position.x += speed * delta;

  // Very basic camera follow (will be replaced with CinematicCamera)
  camera.position.x = prince.position.x * 0.6;
  camera.position.z = prince.position.z * 0.6 + 18;
  camera.lookAt(prince.position.x, 4, prince.position.z);

  renderer.render(scene, camera);
}

animate();

// Keyboard input (temporary for desktop testing)
(window as any).keys = {};
window.addEventListener('keydown', (e) => ((window as any).keys[e.key.toLowerCase()] = true));
window.addEventListener('keyup', (e) => ((window as any).keys[e.key.toLowerCase()] = false));

// Resize handler
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

console.log('%c[Prince of Hesperia] Three.js foundation running. Mobile Safari optimized.', 'color:#64748b');

function createPrinceMesh() {
  const group = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(1.0, 1.2, 2.4, 14),
    new THREE.MeshStandardMaterial({ color: 0x2c2520, roughness: 0.7 })
  );
  body.position.y = 1.2;
  body.castShadow = true;
  group.add(body);

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.8, 14, 14),
    new THREE.MeshStandardMaterial({ color: 0x1a1a1f, roughness: 0.6 })
  );
  head.position.y = 2.7;
  head.castShadow = true;
  group.add(head);

  return group;
}
