import './style.css'
import * as THREE from 'three'
import { CinematicCamera } from './core/camera/CinematicCamera'
import { InputManager } from './core/input/InputManager'
import { PlayerController } from './game/player/PlayerController'
import { CombatController } from './game/combat/CombatController'
import { Enemy } from './game/enemies/Enemy'

// PRINCE OF HESPERIA - Cinematic 2.5D Side-View
console.log('%c[Prince of Hesperia] 2.5D foundation running', 'color:#64748b')

const container = document.getElementById('app')!
container.innerHTML = ''

const renderer = new THREE.WebGLRenderer({ 
  antialias: true, 
  powerPreference: 'high-performance' 
})
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.shadowMap.enabled = true
container.appendChild(renderer.domElement)

const scene = new THREE.Scene()
scene.fog = new THREE.Fog(0x0b0c12, 26, 62)

// Cinematic 2.5D Camera
const camera = new THREE.PerspectiveCamera(48, window.innerWidth / window.innerHeight, 0.5, 160)
const cinematicCamera = new CinematicCamera(camera)

// === DRAMATIC CINEMATIC LIGHTING (high-end stylized) ===
const hemi = new THREE.HemisphereLight(0x5a6a7a, 0x0a0c12, 0.42)
scene.add(hemi)

// Strong warm key light (sun through dust)
const keyLight = new THREE.DirectionalLight(0xffd8a0, 1.65)
keyLight.position.set(18, 38, 9)
keyLight.castShadow = true
keyLight.shadow.mapSize.set(2048, 2048)
keyLight.shadow.camera.near = 5
keyLight.shadow.camera.far = 90
keyLight.shadow.camera.left = -22
keyLight.shadow.camera.right = 22
keyLight.shadow.camera.top = 28
keyLight.shadow.camera.bottom = -12
scene.add(keyLight)

// Strong cool rim light (very important for 2.5D silhouette)
const rimLight = new THREE.DirectionalLight(0x9ad4ff, 1.35)
rimLight.position.set(-22, 16, -14)
scene.add(rimLight)

// Subtle fill from below (Mars dust bounce)
const fillLight = new THREE.DirectionalLight(0x8a6f55, 0.35)
fillLight.position.set(4, -8, 12)
scene.add(fillLight)

// === ATMOSPHERE ===
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(80, 36),
  new THREE.MeshStandardMaterial({ color: 0x1a1f28, roughness: 0.92, metalness: 0.03 })
)
ground.rotation.x = -Math.PI / 2
ground.receiveShadow = true
scene.add(ground)

// Dust haze plane (very subtle)
const haze = new THREE.Mesh(
  new THREE.PlaneGeometry(90, 42),
  new THREE.MeshStandardMaterial({ 
    color: 0x2a2520, 
    roughness: 1, 
    transparent: true, 
    opacity: 0.28 
  })
)
haze.rotation.x = -Math.PI / 2
haze.position.y = 0.08
scene.add(haze)

// === PLATFORMS (more interesting side-view layout) ===
const stoneMat = new THREE.MeshStandardMaterial({ color: 0x2f363f, roughness: 0.85, metalness: 0.08 })

const platforms = [
  { x: 0, y: 0, w: 14, h: 1.2 },
  { x: 11, y: 3.2, w: 7, h: 1 },
  { x: -9, y: 2.6, w: 6, h: 1 },
  { x: 18, y: 1.4, w: 5.5, h: 1 },
]

platforms.forEach(p => {
  const plat = new THREE.Mesh(new THREE.BoxGeometry(p.w, p.h, 3.6), stoneMat)
  plat.position.set(p.x, p.y + p.h / 2, 0)
  plat.castShadow = true
  plat.receiveShadow = true
  scene.add(plat)
})

// === PRINCE - HIGH-END STYLIZED 2.5D MESH (strong silhouette) ===
const prince = createPrinceMesh()
scene.add(prince)

// Systems
const input = new InputManager(true)
const player = new PlayerController(prince, input, true)
const combat = new CombatController(player, input)

// Enemies
const enemies: Enemy[] = []
enemies.push(new Enemy(scene, new THREE.Vector3(7.5, 0, 0)))
enemies.push(new Enemy(scene, new THREE.Vector3(-7, 0, 0)))
enemies.push(new Enemy(scene, new THREE.Vector3(15, 0, 0)))

const clock = new THREE.Clock()

function animate() {
  requestAnimationFrame(animate)
  const delta = Math.min(clock.getDelta(), 0.1)

  input.update()
  player.update(delta)
  combat.update(delta)

  for (let i = enemies.length - 1; i >= 0; i--) {
    const enemy = enemies[i]
    enemy.update(delta, player, combat)
    if (!enemy.isAlive()) {
      scene.remove(enemy.mesh)
      enemies.splice(i, 1)
    }
  }

  cinematicCamera.update(player.getPosition(), delta)
  renderer.render(scene, camera)
}

animate()

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})

function createPrinceMesh(): THREE.Group {
  const g = new THREE.Group()

  // Materials - richer, more premium
  const cloth = new THREE.MeshStandardMaterial({ color: 0x2c2520, roughness: 0.65, metalness: 0.08 })
  const armor = new THREE.MeshStandardMaterial({ color: 0x3f322a, roughness: 0.38, metalness: 0.52 })
  const darkArmor = new THREE.MeshStandardMaterial({ color: 0x25201c, roughness: 0.32, metalness: 0.6 })
  const head = new THREE.MeshStandardMaterial({ color: 0x1f1c22, roughness: 0.48 })
  const copper = new THREE.MeshStandardMaterial({ color: 0x9c5f3a, roughness: 0.28, metalness: 0.72 })
  const tech = new THREE.MeshStandardMaterial({ 
    color: 0x3a9ba8, 
    roughness: 0.24, 
    metalness: 0.65, 
    emissive: 0x0f2a33, 
    emissiveIntensity: 0.55 
  })
  const sword = new THREE.MeshStandardMaterial({ color: 0x4a515a, roughness: 0.25, metalness: 0.85 })

  // Torso (core silhouette)
  const torso = new THREE.Mesh(new THREE.BoxGeometry(1.18, 1.72, 0.68), cloth)
  torso.position.y = 1.12
  torso.castShadow = true
  g.add(torso)

  // Chest armor plate (strong side profile)
  const chest = new THREE.Mesh(new THREE.BoxGeometry(1.32, 0.92, 0.78), armor)
  chest.position.y = 1.48
  chest.castShadow = true
  g.add(chest)

  // Shoulder pauldrons (very important for silhouette)
  const leftPaul = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.68, 0.92), darkArmor)
  leftPaul.position.set(-0.82, 1.72, 0)
  g.add(leftPaul)

  const rightPaul = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.68, 0.92), darkArmor)
  rightPaul.position.set(0.82, 1.72, 0)
  g.add(rightPaul)

  // Head + helmet (distinctive side view)
  const helmetBase = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.76, 0.76), head)
  helmetBase.position.y = 2.42
  g.add(helmetBase)

  // Helmet crest / tech ridge (gives instant recognition)
  const crest = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.42, 0.96), copper)
  crest.position.set(0, 2.72, 0)
  g.add(crest)

  // Visor strip (tech, Mars feel)
  const visor = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.18, 0.82), tech)
  visor.position.y = 2.38
  g.add(visor)

  // Neck guard
  const neck = new THREE.Mesh(new THREE.BoxGeometry(0.96, 0.28, 0.72), darkArmor)
  neck.position.y = 2.08
  g.add(neck)

  // Arms (layered for depth)
  const armMat = new THREE.MeshStandardMaterial({ color: 0x2a2520, roughness: 0.55 })
  const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.36, 1.22, 0.46), armMat)
  leftArm.position.set(-0.78, 1.18, 0)
  g.add(leftArm)

  const rightArm = new THREE.Mesh(new THREE.BoxGeometry(0.36, 1.22, 0.46), armMat)
  rightArm.position.set(0.78, 1.18, 0)
  g.add(rightArm)

  // Forearm guards
  const leftGuard = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.72, 0.54), armor)
  leftGuard.position.set(-0.88, 0.72, 0)
  g.add(leftGuard)

  const rightGuard = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.72, 0.54), armor)
  rightGuard.position.set(0.88, 0.72, 0)
  g.add(rightGuard)

  // Legs (strong stance)
  const legMat = new THREE.MeshStandardMaterial({ color: 0x25201c, roughness: 0.6 })
  const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.42, 1.08, 0.52), legMat)
  leftLeg.position.set(-0.34, 0.54, 0)
  g.add(leftLeg)

  const rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.42, 1.08, 0.52), legMat)
  rightLeg.position.set(0.34, 0.54, 0)
  g.add(rightLeg)

  // Boots
  const boot = new THREE.MeshStandardMaterial({ color: 0x1f1c18, roughness: 0.5, metalness: 0.2 })
  const leftBoot = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.32, 0.62), boot)
  leftBoot.position.set(-0.34, 0.16, 0)
  g.add(leftBoot)

  const rightBoot = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.32, 0.62), boot)
  rightBoot.position.set(0.34, 0.16, 0)
  g.add(rightBoot)

  // Cape / cloak element (huge for silhouette and movement feel)
  const cape = new THREE.Mesh(new THREE.BoxGeometry(0.22, 1.85, 1.15), darkArmor)
  cape.position.set(-0.62, 1.35, -0.1)
  g.add(cape)

  // Sword (sheathed on back for now - side view reads well)
  const swordBlade = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.65, 0.14), sword)
  swordBlade.position.set(0.92, 1.35, -0.08)
  g.add(swordBlade)

  const swordGuard = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.12, 0.36), copper)
  swordGuard.position.set(0.92, 2.05, -0.08)
  g.add(swordGuard)

  // Small tech details on chest
  const chestDetail = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.14, 0.82), tech)
  chestDetail.position.y = 1.68
  g.add(chestDetail)

  return g
}
