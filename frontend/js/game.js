import * as THREE from '../../knihovny/threejs/three.module.js';
import {Maze} from './maze.js';
import Player from './player.js';

export class Game {

constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    this.wallSize = 1;
    this.mazeSize = 9;

    this.setupLights();
    this.maze = new Maze(this.mazeSize, this.wallSize,2);
    this.maze.build(this.scene);

    this.player = new Player(this.scene, this.maze,this.wallSize,2);

    this.camera.position.set(this.mazeSize, 10, this.mazeSize);
    this.camera.lookAt(this.player.mesh.position);

   
   
    this.animate();
}


setupLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff,1);
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

    this.maze = new Maze(this.mazeSize,this.wallSize,2);
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

