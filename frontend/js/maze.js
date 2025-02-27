 import * as THREE from '../../knihovny/threejs/three.module.js';
 
 export class Maze {
    constructor(size, wallSize) {
        this.size = size;
        this.wallSize = wallSize;
        this.grid = this.generateMaze(size);
    }

    generateMaze(size) {
        let maze = Array.from({ length: size }, () => Array(size).fill(1));

        function carvePath(x, y) {
            let directions = [[0, -2], [0, 2], [-2, 0], [2, 0]];
            directions = directions.sort(() => Math.random() - 0.5);

            for (let [dx, dy] of directions) {
                let nx = x + dx, ny = y + dy;
                if (ny > 0 && ny < size - 1 && nx > 0 && nx < size - 1 && maze[ny][nx] === 1) {
                    maze[ny][nx] = 0;
                    maze[y + dy / 2][x + dx / 2] = 0;
                    carvePath(nx, ny);
                }
            }
        }
    let startX = 1, startY = 1;
    maze[startY][startX] = 0;
    carvePath(startX, startY);
    return maze;
}

build(scene) {
    for (let i = 0; i < this.grid.length; i++) {
        for (let j = 0; j < this.grid[i].length; j++) {
            if (this.grid[i][j] === 1) {
                const wallGeometry = new THREE.BoxGeometry(this.wallSize, this.wallSize, this.wallSize);
                const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x8B0000 });
                const wall = new THREE.Mesh(wallGeometry, wallMaterial);
                wall.position.set(j * this.wallSize, 0, i * this.wallSize);
                scene.add(wall);
            }
        }
    }
}

isWall(x,z){
    const gridX = Math.round(x / this.wallSize);
    const gridZ = Math.round(z / this.wallSize);
    return this.grid[gridZ] && this.grid[gridZ][gridX] === 1;
}
}
export default Maze;