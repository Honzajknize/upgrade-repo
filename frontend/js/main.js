import * as THREE from '../../knihovny/threejs/three.module.js';


//Scéna s kamerou a renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//Světlo
const light = new THREE.AmbientLight(0xffffff,0.5);
scene.add(light);

//Koule
const geometry = new THREE.SphereGeometry(1,32,32);
const material = new THREE.MeshStandardMaterial({ color: 0x00ff00, roughness: 0.5 });
const ball = new THREE.Mesh(geometry, material);
scene.add(ball);

camera.position.z = 5;

//Animace
function animate() {
    requestAnimationFrame(animate);
    ball.rotation.y += 0.01;
    renderer.render(scene, camera);
}
animate();