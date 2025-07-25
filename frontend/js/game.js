import * as THREE from '../../knihovny/threejs/three.module.js';
import { Maze } from './maze.js';
import Player from './player.js';

export class Game {

 constructor() {
    console.log(" Hra inicializována!");
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
    const floorGeometry = new THREE.PlaneGeometry(50,50);
    const floorMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa});
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI /2; //Otočení aby byl podlahou
    floor.position.y = 0; 
    this.scene.add(floor);

    //velikosti bludiště
     this.wallSize = 1;
     this.corridorSize = 3;
     this.mazeSize = 45; //predtim bylo 15*
     this.selectedAlgorithm = "binaryTree";

     //světlo
     this.setupLights();
     //maze
     this.createMaze();

     this.createPlayer();
     this.addWinMenuListeners();
    
   
     this.camera.position.set(this.mazeSize, 0.1, this.mazeSize);
     console.log("Hráč inicializován:", this.player);
     this.camera.lookAt(this.player.mesh.position);
   

       /* const mazeSelector = document.getElementById("mazeAlgo");

        if(mazeSelector) {
            mazeSelector.addEventListener("change", (event) => {
                console.log("Změna algoritmu:", event.target.value);
                this.selectedAlgorithm = event.target.value;
                this.resetMaze();
            });
        } else {
            console.error("Element #mazeAlgo nebyl nalezen v DOM.");
        }
            */
    

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
   

    this.maze = new Maze(this.mazeSize,
         this.wallSize,
         this.corridorSize,
         this.selectedAlgorithm); 
    this.maze.build(this.scene);
 }

 createPlayer() {
    this.player = new Player(this, this.scene, this.maze, this.wallSize, 2);
    window.player = this.player;
    console.log(" Hráč inicializován:", this.player);

    const restartBtn =document.getElementById("restartGame");
    if (restartBtn) {
        restartGame.addEventListener("click", () => {
            this.restartGame();
        });
    }

   
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
 }

 showWinMenu() {
    const winMenu = document.getElementById("winMenu");
    if (winMenu) {
        winMenu.style.display = "block";
    } else {
        console.error(" winmenu neexistuje v DOM.");
    }
 }

 restartGame() {
    document.getElementById("winMenu").style.display = "none";
    
    this.resetMaze();
}



 resetMaze() {
    console.log (" Reset bludiště...");
     //Odstranění objektů bludiště
     this.maze.removeFromScene(this.scene);
     this.createMaze();
     if(this.player) {
        this.player.destroy();
     } 
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





