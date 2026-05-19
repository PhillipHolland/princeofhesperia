import './style.css'
import * as THREE from 'three'

// PRINCE OF HESPERIA - Clean 2.5D Foundation
console.log('%c[Prince of Hesperia] Clean foundation initialized', 'color:#64748b')

const container = document.getElementById('app')!
container.innerHTML = ''

const renderer = new THREE.WebGLRenderer({ 
  antialias: true, 
  powerPreference: 'high-performance' 
})
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setSize(window.innerWidth, window.innerHeight)
container.appendChild(renderer.domElement)

const scene = new THREE.Scene()
scene.fog = new THREE.Fog(0x0a0b0f, 25, 60)

// 2.5D Side-view camera (cinematic but locked to side plane)
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.5, 150)
camera.position.set(0, 8, 20)
camera.lookAt(0, 3, 0)

// Basic lighting
const hemi = new THREE.HemisphereLight(0x4a5a6a, 0x0a0c10, 0.6)
scene.add(hemi)

const sun = new THREE.DirectionalLight(0xffe8c0, 1.2)
sun.position.set(12, 35, 8)
scene.add(sun)

// Simple ground for testing
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(50, 30),
  new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.9 })
)
ground.rotation.x = -Math.PI / 2
scene.add(ground)

// Temporary placeholder character (we will replace with proper 2.5D Prince)
const prince = new THREE.Mesh(
  new THREE.BoxGeometry(1.4, 2.4, 0.8),
  new THREE.MeshStandardMaterial({ color: 0x3f322a, roughness: 0.5, metalness: 0.3 })
)
prince.position.y = 1.1
scene.add(prince)

// Basic side-view movement test
const keys: any = {}
window.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true)
window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false)

let velX = 0
const speed = 8

function animate() {
  requestAnimationFrame(animate)

  let input = 0
  if (keys['a'] || keys['arrowleft']) input -= 1
  if (keys['d'] || keys['arrowright']) input += 1

  velX = velX * 0.88 + input * speed * 0.12
  prince.position.x += velX * 0.016

  // Simple side-view camera follow
  camera.position.x = prince.position.x * 0.6
  camera.lookAt(prince.position.x * 0.2, 3, 0)

  renderer.render(scene, camera)
}

animate()

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})
