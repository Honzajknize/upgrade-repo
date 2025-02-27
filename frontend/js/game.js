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
    this.maze = new Maze(this.mazeSize, this.wallSize);
    this.maze.build(this.scene);

    this.player = new Player(this.scene, this.maze,this.wallSize);

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

animate(){
    requestAnimationFrame(() => this.animate());
    this.player.update();
    this.renderer.render(this.scene, this.camera);
}

}

