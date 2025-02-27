
import * as THREE from '../../knihovny/threejs/three.module.js';
export class Player {
constructor(scene, maze, wallSize) {
    this.wallSize = wallSize;
    this.maze = maze;
    this.geometry = new THREE.SphereGeometry(0.5,32,32);
    this.material = new THREE.MeshStandardMaterial({ color: 0x00ffd5});
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.position.set(1 * wallSize, 0, 1 * wallSize);
    scene.add(this.mesh);

    this.targetX = this.mesh.position.x;
    this.targetZ = this.mesh.position.z;

    this.initControls();
}

initControls(){
    document.addEventListener('keydown',
        (event) => {
            const moveSpeed = this.wallSize;
            let moveX = this.targetX;
            let mozeZ = this.targetZ;

            if (event.key === 'ArrowUp' || event.key === 'w') moveZ -= moveSpeed;
            if (event.key === 'ArrowDown' || event.key === 's') moveZ += moveSpeed;
            if (event.key === 'ArrowLeft' || event.key === 'a') moveX -= moveSpeed;
            if (event.key === 'ArrowRight' || event.key === 'd') moveX += moveSpeed;

            if(!this.maze.isWall(moveX, moveZ)) {
                this.targetX = moveX;
                this.targetZ = moveZ;
            }

        }
    );

}

update() {
    this.mesh.position.lerp(new THREE.Vector3(this.targetX, this.mesh.position.y, this.targetZ), 0.1);
}

}
export default Player;