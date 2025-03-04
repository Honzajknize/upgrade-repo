import * as THREE from '../../knihovny/threejs/three.module.js';
export class Player {
constructor(scene, maze, wallSize) {
    this.wallSize = wallSize;
    //this.corridorSize = corridorSize;
    this.maze = maze;
    this.geometry = new THREE.SphereGeometry(0.5,32,32);
    this.material = new THREE.MeshStandardMaterial({ color: 0x00ffd5});
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    
    
    scene.add(this.mesh);

    this.moveSpeed = 0.1;

    //Nalezení volného místa pro spawn hráče
    for(let i = 0; i < this.maze.grid.length; i++) {
        for (let j = 0; j < this.maze.grid[i].length; j++) {
            if (this.maze.grid[i][j] === 0) {
                this.mesh.position.set(j * this.wallSize, 0, i* this.wallSize);
                return;
            }
        }
    }
 

    this.initControls();
}

initControls(){
    document.addEventListener('keydown',
        (event) => {
            
            let moveX = 0;
            let moveZ = 0;

            if (event.key === 'ArrowUp' || event.key === 'w') moveZ -= moveSpeed;
            if (event.key === 'ArrowDown' || event.key === 's') moveZ += moveSpeed;
            if (event.key === 'ArrowLeft' || event.key === 'a') moveX -= moveSpeed;
            if (event.key === 'ArrowRight' || event.key === 'd') moveX += moveSpeed;

            const newX = this.mesh.position.x + moveX;
            const newZ = this.mesh.position.z + moveZ;

           
            if (!this.maze.isWall(newX, newZ)) {
                this.mesh.position.set(newX, this.mesh.position.y, newZ);
            }
        });
}

update() {
    this.mesh.position.lerp(new THREE.Vector3(this.targetX, this.mesh.position.y, this.targetZ), 0.2);
}

resetPosition() {
   
    for (let i = 0; i < this.maze.grid.length; i++) {
        for (let j = 0; j < this.maze.grid[i].length; j++) {
            if (this.maze.grid[i][j] === 0) { 
                this.mesh.position.set(j * this.wallSize, 0, i * this.wallSize);
                return;
            }
        }
    }
}

}
export default Player;