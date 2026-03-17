  import * as THREE from '../../knihovny/threejs/three.module.js';
 // v Současné době Primův alogritmus test
 export class Maze {
     constructor(size, wallSize, corridorSize, algorithm = "silkroad") {
         this.size = size;
         this.wallSize = wallSize;
         this.corridorSize = corridorSize;
         this.algorithm = algorithm;
         this.grid = Array.from({ length: size }, () => Array(size).fill(1));
         this.walls = [];
         
         this.collisionEnabled = true;
         this.debugMode = false;
         
        if(this.algorithm === "prim") {
            this.generatePrimMaze();
        } else if (this.algorithm === "binaryTree") {
            this.generateBinaryTree();
        }else {
            console.error("Neznámý algoritmus!");
            this.generateBinaryTree();
        
            
        }
     }
//maze generation methods
     generateBinaryTree() {

        console.log("Generování bludiště pomocí Binary Tree Maze...");
        // 1) vypln cesty
        for (let y = 1; y < this.size; y+= 2) {
            for(let x = 1; x < this.size; x += 2) {
                this.grid[y][x] = 0;
                let directions = [];
                if (x > 1) directions.push([-1,0]);
                if (y > 1) directions.push([0,-1]);

                if(directions.length > 0) {
                    let [dx, dy] = directions[Math.floor(Math.random() * directions.length)];
                    this.grid[y + dy][x + dx] = 0;
                }
            }
        }
        //2) 
        this.startPosition = {x: 1, y:0};
        this.grid[0][1] = 0;
        
        //3 cil
        this.goalPosition = { x: this.size -2, y: this.size -2 };
        this.grid[this.goalPosition.y][this.goalPosition.x] = 0;
        console.log(`Start: X=${this.startPosition.x}, Y=${this.startPosition.y}`);
        console.log(`Cíl: X=${this.goalPosition.x}, Y=${this.goalPosition.y}`);
        //4)
        if (this.goalPosition.y + 1 < this.size) {
            this.grid[this.goalPosition.y + 1][this.goalPosition.x] = 0;
        }
   
     }

     generatePrimMaze(){
        console.log ("Generování Primova bludiště...");
       this.grid = Array.from({ length: this.size}, () => Array(this.size).fill(1));

       const startX = 1;
       const startY = 1;
       this.startPosition = { x: startX, y: startY };
       this.grid[startY][startX] = 0;

       const frontier = [];
       this.addFrontierCells(startX, startY, frontier);

       while (frontier.length > 0) {
        const randINdex = Math.floor(Math.random() * frontier.length);
        const cell = frontier.splice(randINdex, 1)[0];
        const {x,y} = cell;

        const visitedNeighbors = this. getVisitedNeighbors(x,y);

        if (visitedNeighbors.length === 0) continue;

        const neighbor = visitedNeighbors[Math.floor(Math.random() * visitedNeighbors.length)];

        const wallX = x + (neighbor.x - x) / 2;
        const wallY = y + (neighbor.y -y) /2;

        this.grid[y][x] = 0;
        this.grid[wallY][wallX] = 0;

        this.addFrontierCells(x,y,frontier);
       }

       this.goalPosition = this.findFarthestPoint(this.startPosition.x, this.startPosition.y);
       this.grid[this.goalPosition.y][this.goalPosition.x] = 0;

       console.log(`Start: X=${this.startPosition.x}, Y=${this.startPosition.y}`);
       console.log(`Cíl: X=${this.goalPosition.x}, Y=${this.goalPosition.y}`);
     }

     addFrontierCells(x,y,frontier) {
        const directions = [
            [2,0],
            [-2,0],
            [0,2],
            [0,-2]
        ];
        for (const [dx,dy] of directions) {
            const nx = x + dx;
            const ny = y + dy;

            if(this.isInsideMazeCell(nx,ny) && this.grid[ny][nx] === 1) {
                const alreadyInFrontier = frontier.some(cell => cell.x === nx && cell.y === ny);
                if(!alreadyInFrontier) {
                    frontier.push({ x: nx, y: ny});
                }
            }
        }
     }

     getVisitedNeighbors(x,y) {
         const neighbors = [];
    const directions = [
        [2, 0],
        [-2, 0],
        [0, 2],
        [0, -2]
    ];

    for (const [dx, dy] of directions) {
        const nx = x + dx;
        const ny = y + dy;

        if (this.isInsideMazeCell(nx, ny) && this.grid[ny][nx] === 0) {
            neighbors.push({ x: nx, y: ny });
        }
    }

    return neighbors;
}
     

     isInsideMazeCell(x,y) {
        return x > 0 && x < this.size - 1 && y > 0 && y < this.size - 1;
     }

     findFarthestReachablePoint(startX, startY) {
    const queue = [{ x: startX, y: startY, dist: 0 }];
    const visited = new Set([`${startX},${startY}`]);

    let farthest = { x: startX, y: startY, dist: 0 };

    const directions = [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1]
    ];

    while (queue.length > 0) {
        const current = queue.shift();

        if (current.dist > farthest.dist) {
            farthest = current;
        }

        for (const [dx, dy] of directions) {
            const nx = current.x + dx;
            const ny = current.y + dy;
            const key = `${nx},${ny}`;

            if (
                this.isInBounds(nx, ny) &&
                this.grid[ny][nx] === 0 &&
                !visited.has(key)
            ) {
                visited.add(key);
                queue.push({ x: nx, y: ny, dist: current.dist + 1 });
            }
        }
    }

    return { x: farthest.x, y: farthest.y };
}
     generateSilkRoadMaze(){
        console.log ("silkroad maze");
        //1) vytvorime prazdny grid 
        this.grid = Array.from({ length: this.size }, () => Array(this.size).fill(0));
        this.startPosition = { x: 1, y: 1 };
        this.goalPosition = { x: this.size - 2, y: this.size - 2 };
    
        const mountainCount = Math.floor(this.size / 4);
        const mountainCenters = [];
    
        // Náhodně umísti mountain centry
        while (mountainCenters.length < mountainCount) {
            const x = Math.floor(Math.random() * (this.size - 2)) + 1;
            const y = Math.floor(Math.random() * (this.size - 2)) + 1;
            if (this.grid[y][x] === 0 && !(x === this.startPosition.x && y === this.startPosition.y) && !(x === this.goalPosition.x && y === this.goalPosition.y)) {
                mountainCenters.push({ x, y });
            }
        }
    
        // Spusť chapadla z každého centra
        for (const { x, y } of mountainCenters) {
            this.spreadWallTentacles(x, y);
        }
    
        // Poté vytvoř průchozí SilkRoad path
        const silkroadPath = this.generateSilkRoad(this.startPosition, this.goalPosition);
        for (const { x, y } of silkroadPath) {
            this.grid[y][x] = 0;
        }
    
        console.log(`Silkroad Maze hotovo: Start (${this.startPosition.x}, ${this.startPosition.y}), Cíl (${this.goalPosition.x}, ${this.goalPosition.y})`);
    


     }

     spreadWallTentacles(cx,cy) {
       const tentacleCount = Math.floor(Math.random() * 4) + 3; //3-6
       const angleStep = (2* Math.PI) /tentacleCount;

       for(let i = 0; i < tentacleCount; i++) {
        let angle = i * angleStep + (Math.random() -0.5) * 0.5;
        let dx = Math.round(Math.cos(angle));
        let dy = Math.round(Math.sin(angle));

        let x = cx;
        let y = cy;
        const maxSteps = Math.floor(this.size / 2);

         for(let j = 0; j < maxSteps; j++) {
            x += dx;
            y += dy;

            if(!this.isInBounds(x,y)) break;
            if (this.grid[y][x] === 1) continue;
            this.grid[y][x] = 1;

            //šance na zatočení
            if(Math.random() < 0.3) {
                angle += (Math.random() -0.5) * (Math.PI / 6);
                dx = Math.round(Math.cos(angle));
                dy = Math.round(Math.sin(angle));
            }
         }
        } 
    }
    isInBounds(x,y) {
        return x >= 0 && x < this.size && y >= 0 && y < this.size;
    }
    

     generateSilkRoad(start, goal) {
        const visited = new Set();
    const path = [];
    const stack = [{ x: start.x, y: start.y, path: [] }];

    while (stack.length > 0) {
        const current = stack.pop();
        const key = `${current.x},${current.y}`;
        if (visited.has(key)) continue;
        visited.add(key);

        const newPath = [...current.path, { x: current.x, y: current.y }];
        if (current.x === goal.x && current.y === goal.y) return newPath;

        const dirs = [
            [1, 0], [-1, 0], [0, 1], [0, -1]
        ];

        for (const [dx, dy] of dirs) {
            const nx = current.x + dx;
            const ny = current.y + dy;
            if (this.isInBounds(nx, ny) && !visited.has(`${nx},${ny}`)) {
                stack.push({ x: nx, y: ny, path: newPath });
            }
        }
    }
    
    console.warn("Silkroad path nebyla nalezena. Vrací se přímka jako fallback.");
    return [{ x: start.x, y: start.y }, { x: goal.x, y: goal.y }];

    }


     isWall(x, z) {
    if (!this.collisionEnabled) return false;

    //přidal jsem + this.corridorSize /2 protože kolize to tvořilo od středu zdí
        const gridX = Math.floor((x - this.offsetX + this.corridorSize / 2) / this.corridorSize);
        const gridZ = Math.floor((z - this.offsetZ + this.corridorSize / 2) / this.corridorSize);

        if (gridZ < 0 || gridZ >= this.grid.length || gridX < 0 || gridX >= this.grid[0].length) {
            return true; //pokud je mimo rozsah beru ot jako zed
        }

        return this.grid[gridZ][gridX] === 1;
     }

     toggleCollisions() {
        this.collisionEnabled = !this.collisionEnabled;
        console.log(` Kolize ${this.collisionEnabled ? "zapnuty" : "vypnuty"}`);
     }

     addWalls(x,y,walls) {
        let directions = [
            [x + 2, y], [x - 2, y], [x,y + 2], [x,y -2]
        ];
        for (let [nx,ny] of directions) {
            if (this.isInBounds(nx,ny) && this.grid[ny][nx] === 1) {
                walls.push([nx,ny]); //přidání do seznamu stěn
            }
        }
     }

     canCarve(x,y) {
        let count = 0;
        let directions = [
            [x + 2, y], [x - 2,y], [x,y + 2], [x,y -2]
        ];
        for(let [nx,ny] of directions) {
            if (this.isInBounds(nx,ny) && this.grid[ny][nx] ===0) {
                count++;
            }
        }
        return count === 1; //pouze jedno otevřené sousedství
     }

    

     findFarthestPoint(sx,sy) {
        let maxDist = 0;
        let farthestPoint = { x: sx, y: sy};

        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                if (this.grid[y][x] === 0) {
                    let dist = Math.abs(x -sx) + Math.abs(y -sy);
                    if (dist > maxDist) {
                        maxDist = dist;
                        farthestPoint = { x,y };
                    }
                }
            }
        }
        if (farthestPoint.x === sx && farthestPoint.y === sy) {
            console.warn("varování nebyl nalezen žádný vzdálený bod , používám výchozí hodnotu.");

        }

        console.log(` Cíl: X=${farthestPoint.x}, Y=${farthestPoint.y}`);
        return farthestPoint;
     }



     build(scene) {
        console.log(" Stavím nové bludiště...");

        const offsetX = - (this.size * this.corridorSize) / 2;
        const offsetZ = - (this.size * this.corridorSize) / 2;

        this.walls = [];

        for(let y = 0; y < this.grid.length; y++) {
            for (let x = 0; x < this.grid[y].length; x++) {
                if (this.grid[y][x] === 1) {
                    //debug clauzule
                    if (this.debugMode) {
                        const debugGeometry = new THREE.BoxGeometry(this.corridorSize * 0.8, 0.1, this.corridorSize * 0.8);
                        const debugMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00, transparent: true, opacity: 0.2 });
                        const debugMesh = new THREE.Mesh(debugGeometry, debugMaterial);
                        debugMesh.position.set(
                            offsetX + x * this.corridorSize,
                            0.05,
                            offsetZ + y * this.corridorSize
                        );
                        scene.add(debugMesh);
                        this.walls.push(debugMesh); // přidáme ho do walls, aby šel pak odstranit
                    }
                    
                    const wallGeometry = new THREE.BoxGeometry(this.corridorSize,this.wallSize, this.corridorSize);
                    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x8B0000});
                    const wall = new THREE.Mesh(wallGeometry, wallMaterial);

                    //Korekce umístění zdí
                    wall.position.set(
                        offsetX + x * this.corridorSize,
                        this.wallSize / 2,
                         offsetZ + y* this.corridorSize
                        );
                    scene.add(wall);
                    this.walls.push(wall);
                }
            }
        }

        //Cíl 
        const goalGeometry = new THREE.BoxGeometry(this.corridorSize * 0.8, 0.2, this.corridorSize * 0.8);
        const goalMaterial = new THREE.MeshStandardMaterial({
             color: 0xFFD700,
             transparent: true,
             opacity: 0.3
             });
        this.goal = new THREE.Mesh(goalGeometry, goalMaterial);
        this.goal.position.set(
            offsetX + this.goalPosition.x * this.corridorSize, 0.1,
            offsetZ + this.goalPosition.y * this.corridorSize);
        scene.add(this.goal);

        this.offsetX = offsetX;
        this.offsetZ = offsetZ;

        //Neviditelné super zdi okolo vykreslené plochy
        const extendedSize = (this.size + 2) * this.corridorSize;
        const wallGeo = new THREE.BoxGeometry(1,5, extendedSize);
        const wallGeoZ = new THREE.BoxGeometry(extendedSize, 5,1);
        const invisibleMat = new THREE.MeshStandardMaterial({ color: 0x000000, transparent: true, opacity: 0 });

        const half = (this.size * this.corridorSize) / 2;

        //levá zed
        const wallLeft = new THREE.Mesh(wallGeo, invisibleMat);
        wallLeft.position.set(this.offsetX - this.corridorSize / 2, 2.5, 0);
        scene.add(wallLeft);

        
        // Pravá zed
        const wallRight = new THREE.Mesh(wallGeo, invisibleMat);
        wallRight.position.set(this.offsetX + (this.size + 1) * this.corridorSize + this.corridorSize / 2 - 1, 2.5, 0);
        scene.add(wallRight);

        // Horní zed
        const wallTop = new THREE.Mesh(wallGeoZ, invisibleMat);
        wallTop.position.set(0, 2.5, this.offsetZ - this.corridorSize / 2);
        scene.add(wallTop);

        // Dolní zed
        const wallBottom = new THREE.Mesh(wallGeoZ, invisibleMat);
        wallBottom.position.set(0, 2.5, this.offsetZ + (this.size + 1) * this.corridorSize + this.corridorSize / 2 -1);
        scene.add(wallBottom);

        

     }

    


     isCheckpoint(x, z) {
        /*const gridX = Math.floor(( x - this.offset) / this.wallSize);
        const gridZ = Math.floor(( z - this.offset) / this.wallSize);

        return gridX === this.goalPosition.x && gridZ === this.goalPosition.y;
        */
    
        }

    removeFromScene(scene){
           console.log("Reset bludiště...");

           if(!this.walls || this.walls.length === 0) {
            console.warn(" Varování: Není co mazat, walls je prázdné.");
            return;
           }

           this.walls.forEach(wall => scene.remove(wall));

           if(this.goal) scene.remove(this.goal);

           this.walls = [];
           this.grid = [];

           //this.maze.removeFromScene(this.scene);
           //this.maze.generateMaze();
          // this.maze.build(this.scene);

           //this.player.resetPosition();
        
            
    }

    isOutOfBounds(x, z) {
        const buffer = this.corridorSize * 3;


        const minX = this.offsetX - this.corridorSize; // o něco větší rádius
        const maxX = this.offsetX + this.size * this.corridorSize + buffer;
        const minZ = this.offsetZ - this.corridorSize;
        const maxZ = this.offsetZ + this.size * this.corridorSize + buffer;
    
        return x < minX || x > maxX || z < minZ || z > maxZ;
    }
    

    resetMaze() {
        console.log(" Reset bludiště...");

        if(this.maze) {
            this.maze.removeFromScene(this.scene);

        }else {
            console.warn("Varování this.maze neexistiju při resetu.");
        }

        this.createMaze();
        this.maze.build(this.scene);

        if(this.maze.startPosition) {
            this.player.resetPosition(this.maze.startPosition);
        } else {
            console.error(" Chyba: Nové bludiště nemá startovní pozici!");
        }
        
    }

   
toggleDebugViewMode() {
    this.debugMode = !this.debugMode;
    console.log(`Debug mód ${this.debugMode ? "zapnutý" : "vypnutý"}`);
}

}
        export default Maze;

    
