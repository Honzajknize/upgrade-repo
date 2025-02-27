import * as THREE from '../../knihovny/threejs/three.module.js';


//Scéna s kamerou a renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//Světlo
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5,10,5);
directionalLight.castShadow = true;
scene.add(directionalLight);


const light = new THREE.PointLight(0xffffff,70,25);
light.position.set(5,5,5); // umístění světla
scene.add(light);



const wallSize = 2;
const mazeSize = 5; //rozměr mřížky

//hráč (koule)
const playerSize = 1.2;
const playerGeometry = new THREE.SphereGeometry(playerSize, 32,32);
const playerMaterial = new THREE.MeshStandardMaterial({ color: 0x00ffd5 });
const player = new THREE.Mesh(playerGeometry, playerMaterial);
player.position.set(1* wallSize, 0, 1 * wallSize);
scene.add(player);


//povolení stínů
renderer.shadowMap.enabled = true;
player.castShadow = true;
player.receiveShadow = true;
light.castShadow = true;

renderer.shadowMap.type = THREE.PCFSoftShadowMap;
light.shadow.mapSize.width = 1024;
light.shadow.mapSize.height = 1024;

// M A Z E maze M A Z E maze M A Z E
const grid = [
    [1,1,1,1,1],
    [1,0,0,0,1],
    [1,0,1,0,1],
    [1,0,1,0,1],
    [1,1,1,1,1]
];

for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length;j++) {
        if (grid[i][j] === 1) {
            const wallGeometry = new THREE.BoxGeometry(wallSize, wallSize, wallSize);
            const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x8B0000 }); 
            const wall = new THREE.Mesh(wallGeometry, wallMaterial);
            ;
            wall.position.set(j* wallSize, 0, i *  wallSize);
            scene.add(wall);
        }
    }
}



//Kamera nad bludištěm (top-down)
camera.position.set(mazeSize, 10, mazeSize);
camera.lookAt(player.position);

//Pohyb hráče pomocí klávesnice
document.addEventListener('keydown', (event) => {
    const moveDistance = wallSize;
    let newX = player.position.x;
    let newZ = player.position.z;

    if (event.key === 'ArrowUp' || event.key === 'w') newZ -= moveDistance;
    if (event.key === 'ArrowDown' || event.key === 's') newZ += moveDistance;
    if (event.key === 'ArrowLeft' || event.key === 'a') newX -= moveDistance;
    if (event.key === 'ArrowRight' || event.key === 'd') newX += moveDistance;


    //přepočet souřadnic do gridu
    const gridX = Math.round(newX / wallSize);
    const gridZ = Math.round(newZ / wallSize);

    //Kontrola kolize
    if(grid[gridZ] && grid[gridZ][gridX] === 0) {
        player.position.set(newX, 0, newZ);
    }
});

//Animace
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate();
