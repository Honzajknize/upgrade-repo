import * as THREE from '../../knihovny/threejs/three.module.js';
import { Maze } from './maze.js';
import Player from './player.js';

export class Game {

 constructor(minimap = null) {
    
    console.log(" Hra inicializována!");
    this.minimap = minimap;
    this.gameEnded = false;
    this.frozen = false;
     this.scene = new THREE.Scene();
     
    this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
     this.renderer = new THREE.WebGLRenderer();
     this.renderer.setSize(window.innerWidth, window.innerHeight);
     //document.body.appendChild(this.renderer.domElement);

     const gameContainer = document.getElementById("gameContainer");
     if (gameContainer) {
        gameContainer.appendChild(this.renderer.domElement);
     }else {
        console.error("Element #gameContainer nebyl nalezen!");
     }

    //podlaha
    
    

    //velikosti bludiště
     this.wallSize = 1;
     this.corridorSize = 3;
     this.mazeSize = 15; 
     this.selectedAlgorithm = "binaryTree";

     //světlo
     this.setupLights();
     //maze
    this.applyMazeSizeFromInput();


     this.createMaze();
     this.createFloor();
     this.createPlayer();
     this.addWinMenuListeners();
    
   
     this.camera.position.set(this.mazeSize, 0.1, this.mazeSize);
     console.log("Hráč inicializován:", this.player);
     this.camera.lookAt(this.player.mesh.position);
   


    

      document.addEventListener('keydown', (event) => {
        if (event.key.toLowerCase() === 'c') {
            this.maze.toggleCollisions();
        }
        if(event.key.toLowerCase() === 'p') {
            this.maze.toggleDebugViewMode();
        }
      });
   
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

 createMaze() {
    console.log(" Generování bludiště pomocí:", this.selectedAlgorithm);
   

    this.maze = new Maze(
        this.mazeSize,
         this.wallSize,
         this.corridorSize,
         this.selectedAlgorithm
        ); 
    this.maze.build(this.scene);
    console.log("maze instance:", this.maze);
    console.log("minimap instance:", this.minimap);

    if (this.minimap) {
        const data = this.maze.getMinimapData();
        console.log("minimap data from maze", data);
        this.minimap.render(this.maze.getMinimapData());
    }
 }

 createFloor() {
    const floorSize = this.mazeSize * this.corridorSize + this.corridorSize * 4;

    if (this.floor) {
        this.scene.remove(this.floor);
    }

    const floorGeometry = new THREE.PlaneGeometry(floorSize, floorSize);
    //const floorMaterial = new THREE.MeshStandardMaterial({color: 0xaaaaaa });
    const textureLoader = new THREE.TextureLoader();
    const floorTexture = textureLoader.load("../assets/floor.png");

    floorTexture.magFilter = THREE.NearestFilter;
    floorTexture.minFilter = THREE.NearestFilter;
    floorTexture.generateMipmaps = false;

    //opakování textury
    floorTexture.wrapS = THREE.RepeatWrapping;
    floorTexture.wrapT = THREE.RepeatWrapping;
    const repeatCount = this.mazeSize;

    floorTexture.repeat.set(repeatCount * 5, repeatCount * 5);

    const floorMaterial = new THREE.MeshStandardMaterial({
        map: floorTexture
    });
    
    this.floor = new THREE.Mesh(floorGeometry, floorMaterial);
    this.floor.rotation.x = -Math.PI /2;
    this.floor.position.y = 0;

    this.scene.add(this.floor);

 }

 createPlayer() {
    this.player = new Player(this, this.scene, this.maze, this.wallSize, 2);
    window.player = this.player;
    console.log(" Hráč inicializován:", this.player);

    /*const restartBtn =document.getElementById("restartGame");
    if (restartBtn) {
        restartGame.restartBtn.addEventListener("click", () =>  this.restartGame());
         
    }
        */

   
 }

 triggerWin() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.freezeGame();
    setTimeout(() => {
        this.showWinMenu();
    },1000);
 }

 freezeGame(){
    if(this.player) {
        this.player.freeze();
    }
 }

 freeze() {
    this.frozen = true;
 }
 unfreeze() {
    this.frozen = false;
    if(this.player && typeof this.player.unfreeze === 'function') {
        this.player.unfreeze();
   }
 }

 showWinMenu() {
    const winMenu = document.getElementById("winMenu");
    if (winMenu) {
        winMenu.style.display = "block";
    } else {
        console.error(" winmenu neexistuje v DOM.");
    }
 }

applyMazeSizeFromInput() {
    const mazeSizeInput = document.getElementById("mazeSize");
    if (!mazeSizeInput) return;

    const safeValue = this.sanitizeMazeSize(mazeSizeInput.value);
    this.mazeSize = safeValue;
    mazeSizeInput.value = safeValue;
}

 restartGame() {
    const win = document.getElementById("winMenu");
    if (win) win.style.display = "none";
    this.gameEnded = false; //aby hra mohla pokračovat znova
    this.unfreeze();
   /* document.getElementById("winMenu").style.display = "none";
   */
    this.applyMazeSizeFromInput();
    this.resetMaze();
    
}



 resetMaze() {
    console.log (" Reset bludiště...");
     //Odstranění objektů bludiště
     this.maze.removeFromScene(this.scene);
    
     if(this.player) {
        this.player.destroy();
     } 
      this.createMaze();
      this.createFloor();
      this.createPlayer(); //vytvoreni novyho player se spravnym ovladanim
    
     setTimeout(() => {
        if (this.player && this.player.mesh) {
            this.player.resetPosition();
        } else {
            console.error("Chyba: Hráč nebyl vytvořen při resetu bludiště.");
        }
     },200);
     //this.maze.build(this.scene);
     //this.player.resetPosition();
 }

 sanitizeMazeSize(rawValue) {
    let value = Number(rawValue);

    if (!Number.isFinite(value)) {
        value = 15;
    }

    value = Math.floor(value);
    if(value < 5) value = 5;
    if (value > 51) value = 51;

    if (value % 2 === 0) {
        value -= 1;
    }

    //kdyby pretekl max
    if (value > 51) {
        value = 49;
    }
    return value;
 }

 addWinMenuListeners() {
    const restartBtn = document.getElementById("restartGame");
    if (restartBtn) {
        restartBtn.addEventListener("click", () => {
            this.restartGame();
        });
    } else {
        console.warn("Tlačítko #restartGame nebylo nalezeno.");
    }
 }
     


 animate(){
     requestAnimationFrame(() => this.animate());
     
     if (this.player && this.player.mesh) {
        this.player.update();
        this.updateCamera();

     } else {
        console.warn(" Upozornění: Hráč není ještě inicializován, skippin update..");
     }
    
     this.renderer.render(this.scene, this.camera);
 }

}





