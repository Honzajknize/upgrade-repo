 import * as THREE from '../../knihovny/threejs/three.module.js';
 
 export class Maze {
    constructor(size, wallSize, corridorSize) {
        this.size = size;
        this.wallSize = wallSize;
        this.corridorSize = corridorSize;
        this.walls = [];
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

    //otevření vchodu
    maze[0][1] = 0;
    maze[1][1] = 0;
    
    //otevření cíle 
    maze[size -2][size - 2] = 0;
    maze[size - 1][size - 2] = 0;

    return maze;
}

build(scene) {
    this.walls = [];

    for (let i = 0; i < this.grid.length; i++) {
        for (let j = 0; j < this.grid[i].length; j++) {
            if (this.grid[i][j] === 1) {
                const wallGeometry = new THREE.BoxGeometry(this.wallSize, this.wallSize, this.wallSize);

                const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x8B0000 });

                const wall = new THREE.Mesh(wallGeometry, wallMaterial);

                wall.position.set(j * this.wallSize, this.wallSize / 2, i * this.wallSize);
                scene.add(wall);
                this.walls.push(wall);
            }
        }
    }
    //Cíl
    const goalGeometry = new THREE.BoxGeometry(this.corridorSize, 0.2, this.corridorSize);
    const goalMaterial = new THREE.MeshStandardMaterial({
        color: 0xFFD700 
    });
    this.goal = new THREE.Mesh(goalGeometry, goalMaterial);
    this.goal.position.set((this.size - 2) * this.corridorSize, 0.1, (this.size - 2) * this.corridorSize);
    scene.add(this.goal);
}


isWall(x,z){
    const gridX = Math.floor(x / this.wallSize);
    const gridZ = Math.floor(z / this.wallSize);
    
    if (gridZ < 0 || gridZ >= this.grid.length || gridX < 0 || gridX >= this.grid[0].length) {
        return true;
    }
   // return this.grid[gridZ] && this.grid[gridZ][gridX] === 1;

   return this.grid[gridZ][gridX] === 1;
}

removeFromScene(scene){
    this.walls.forEach(wall => {
         scene.remove(wall)
});
this.walls = [];
    
}


}
export default Maze;