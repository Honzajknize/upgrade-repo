import * as THREE from '../../knihovny/threejs/three.module.js';
import {Maze} from './maze.js';
import Player from './player.js';

export class Game {

 constructor() {
    console.log("✅ Hra inicializována!");
     this.scene = new THREE.Scene();
     
     this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
     this.renderer = new THREE.WebGLRenderer();
     this.renderer.setSize(window.innerWidth, window.innerHeight);
     document.body.appendChild(this.renderer.domElement);

    //podlaha
    const floorGeometry = new THREE.PlaneGeometry(50,50);
    const floorMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa});
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI /2; //Otočení aby byl podlahou
    floor.position.y = 0; 
    this.scene.add(floor);

     this.wallSize = 1;
     this.mazeSize = 9;

     this.setupLights();
     this.maze = new Maze(this.mazeSize, this.wallSize,2);
     
     this.player = new Player(this.scene, this.maze, this.wallSize, 2);
     window.player = this.player; // Nastavení globální reference
     console.log("window player nastaven na :", window.player);
     this.maze.build(this.scene);
    

     this.player = new Player(this.scene, this.maze,this.wallSize,2);
    

     this.camera.position.set(this.mazeSize, 10, this.mazeSize);
     console.log("Hráč inicializován:", this.player);
     this.camera.lookAt(this.player.mesh.position);
     
   
     this.animate();
 }


 setupLights() {
     const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
     this.scene.add(ambientLight);

     const directionalLight = new THREE.DirectionalLight(0xffffff,5);
     directionalLight.position.set(5,10,5);
     directionalLight.castShadow = true;
     this.scene.add(directionalLight);
 }

 updateCamera() {
     //Nastavení kamery nad háčem 
     const cameraHeight = 5;
     const cameraOffsetZ = -3;
     
     this.camera.position.set(
         this.player.mesh.position.x,
         this.player.mesh.position.y + cameraHeight,
         this.player.mesh.position.z + cameraOffsetZ
     );

     this.camera.lookAt(this.player.mesh.position);
 }



 resetMaze() {
     //Odstranění objektů bludiště
     this.maze.removeFromScene(this.scene);

     this.maze = new Maze(this.mazeSize,this.wallSize,this.corridorSize);
     this.maze.build(this.scene);

     this.player.resetPosition();
 }

 


 animate(){
     requestAnimationFrame(() => this.animate());
     

     this.player.update();
     this.updateCamera();
     this.renderer.render(this.scene, this.camera);
 }

}

function restartGame() {
    document.getElementById("winMenu").style.display = "none";
    game.resetMaze();
}

function showWinMenu() {
    const winMenu = document.getElementById("winMenu");
    if (winMenu) {
        winMenu.style.display = "block";
    } else {
        console.error(" winmenu neexistuje v DOM.");
    }
 }

