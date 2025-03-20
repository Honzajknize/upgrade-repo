  import * as THREE from '../../knihovny/threejs/three.module.js';
 // v Současné době Primův alogritmus
 export class Maze {
     constructor(size, wallSize, corridorSize, algorithm = "binaryTree") {
         this.size = size;
         this.wallSize = wallSize;
         this.corridorSize = corridorSize;
         this.algorithm = algorithm;
         this.grid = Array.from({ length: size }, () => Array(size).fill(1));
         this.walls = [];
         this.generatePrimMaze();
         this.collisionEnabled = true;
         
        if(this.algorithm === "binaryTree") {
            this.generateBinaryTree();
        } else if (this.algorithm === "prim") {
            this.generatePrim();
        } else {
            console.error("Neznámý algoritmus!");
        }
     }

     generateBinaryTree() {
        console.log("Generování bludiště pomocí Binary Tree Maze...");
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
        this.startPosition = {x: 1, y:1};
        this.goalPosition = { x: this.size -2, y: this.size -2 };
        console.log(`Start: X=${this.startPosition.x}, Y=${this.startPosition.y}`);
        console.log(`Cíl: X=${this.goalPosition.x}, Y=${this.goalPosition.y}`);
   
     }

     generatePrimMaze(){
        console.log ("Generování Primova bludiště...");
        let startX = 1, startY = 1; // Startovní bod
        this.grid[startY][startX] = 0;
        this.startPosition = { x: startX, y: startY };
        let walls = [];

        //přidání počátečních stěn do seznamu
        this.addWalls(startX, startY, walls);

        while(walls.length > 0) {
            let randIndex = Math.floor(Math.random() * walls.length);
            let [wx, wy] = walls[randIndex]; // randoms wall
            walls.splice(randIndex, 1); // odstraníme z seznamu

            //Kontrola jestli můžem zbourat
            if(this.canCarve(wx,wy)) {
                this.grid[wy][wx] = 0; // Prorazíme stěnu
                this.addWalls(wx,wy, walls);
            }
        }

        //Nalezení konečného bodu bludiště (nejdál od startu)
        this.goalPosition = this.findFarthestPoint(startX, startY);
        if(!this.goalPosition){
            console.error("chyba: nebyl nalezen žádný cíl");
            this.goalPosition = { x: this.size - 2, y: this.size - 2};
        }
        this.grid[this.goalPosition.y][this.goalPosition.x] = 0;


        console.log(`startovní pozica : X=${this.startPosition.x}, Y=${this.startPosition.y}`);
        console.log(`Cíl: X=${this.goalPosition.x}, Y=${this.goalPosition.y}`);

        if (!this.startPosition) {
            console.error(" Chyba: `startPosition` nebyla správně nastavena!");
        } else {
            console.log(` Startovní pozice správně nastavena: X=${this.startPosition.x}, Y=${this.startPosition.y}`);
        }
        
     }

     isWall(x, z) {
    if (!this.collisionEnabled) return false;

        const gridX = Math.floor(x / this.corridorSize);
        const gridZ = Math.floor(z / this.corridorSize);

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

     isInBounds(x,y) {
        return x > 0 && y > 0 && x < this.size - 1 && y <this.size - 1;
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

        this.walls = [];

        for(let y = 0; y < this.grid.length; y++) {
            for (let x = 0; x < this.grid[y].length; x++) {
                if (this.grid[y][x] === 1) {
                    const wallGeometry = new THREE.BoxGeometry(this.wallSize,this.wallSize, this.wallSize);
                    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x8B0000});
                    const wall = new THREE.Mesh(wallGeometry, wallMaterial);

                    //Korekce umístění zdí
                    wall.position.set(
                        x * this.corridorSize,
                        this.wallSize / 2,
                        y* this.corridorSize
                        );
                    scene.add(wall);
                    this.walls.push(wall);
                }
            }
        }

        //Cíl 
        const goalGeometry = new THREE.BoxGeometry(this.corridorSize * 0.8, 0.2, this.corridorSize * 0.8);
        const goalMaterial = new THREE.MeshStandardMaterial({ color: 0xFFD700 });
        this.goal = new THREE.Mesh(goalGeometry, goalMaterial);
        this.goal.position.set(this.goalPosition.x * this.wallSize, 0.1, this.goalPosition.y * this.wallSize);
        scene.add(this.goal);

     }

     isCheckpoint(x, z) {
        const gridX = Math.floor(x / this.wallSize);
        const gridZ = Math.floor(z / this.wallSize);

        return gridX === this.goalPosition.x && gridZ === this.goalPosition.y;
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

}
        export default Maze;

     /*
     generateMaze(size) {
         let maze = Array.from({ length: size }, () => Array(size).fill(1));

         function carvePath(x, y) {
             let directions = [[0, -2], [0, 2], [-2, 0], [2, 0]];
             directions = directions.sort(() => Math.random() - 0.5);

             for (let [dx, dy] of directions) {
                 let nx = x + dx, ny = y + dy;
                 if (ny > 0 &&
                      ny < size - 1 &&
                       nx > 0 &&
                        nx < size - 1 &&
                         maze[ny][nx] === 1) {
                     maze[ny][nx] = 0;
                     maze[y + dy / 2][x + dx / 2] = 0;
                     carvePath(nx, ny);
                 }
             }
         }

     let startX = 1, startY = 1;
     maze[startY][startX] = 0;
     carvePath(startX, startY);

     this.startPosition = {x: startX, y: startY};

 //poslední otevřený node v bludišti
 let endX = size - 2;
 let endY = size - 2;
 while (maze[endY][endX] === 1) {
     endX--;
     if(endX <= 1){
         endX = size -2;
         endY--;
     }
 }
 maze[endY][endX] = 0;
 this.goalPosition = { x: endX, y: endY };


     //otevření vchodu
     //maze[0][1] = 0;
     //maze[1][1] = 0;
    
   

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
    if(this.goal) {
        scene.remove(this.goal);
    }

    const goalGeometry = new THREE.BoxGeometry(this.corridorSize * 0.8, 0.2, this.corridorSize * 0.8);
    const goalMaterial = new THREE.MeshStandardMaterial({
        color: 0xFFD700 
    });
    this.goal = new THREE.Mesh(goalGeometry, goalMaterial);
    this.goal.position.set(
        (this.size - 2) * this.corridorSize, 0.1,
        (this.size - 2) * this.corridorSize);
    scene.add(this.goal);
}


isWall(x,z){
   /*const buffer = this.corridorSize / 2;
    const gridX = Math.floor((x + buffer) / this.corridorSize);
    const gridZ = Math.floor((z + buffer) / this.corridorSize);

     // **Kontrola, zda nejsme mimo pole**
     if (gridZ < 0 || gridZ >= this.grid.length || gridX < 0 || gridX >= this.grid[0].length) {
        return true;
    }
   const gridX = Math.floor(x / this.wallSize);
   const gridZ = Math.floor(z / this.wallSize);

   if (gridZ < 0 || gridZ >= this.grid.length || gridX >= this.grid[0].length) {
    return true;

   }

   const isWall = this.grid[gridZ][gridX] ===1;

   if (isWall) {
    const debugCube = new THREE.BoxGeometry(this.wallSize * 0.5, 0.2, this.wallSize * 0.5);
    const debugMaterial = new THREE.MeshBasicMaterial({ color: 0xff00ff,transparent: true, opacity: 0.5});
    const debugMesh = new THREE.Mesh(debugCube, debugMaterial);
    debugMesh.position.set(gridX * this.wallSize, 0.1, gridZ * this.wallSize);
    this.scene.add(debugMesh);
   }
   
   return isWall;
   //return this.grid[gridZ][gridX] === 1;
}

isCheckpoint(x,z) {
    const buffer = this.corridorSize / 2;
    const gridX = Math.floor((x + buffer) / this.corridorSize);
    const gridZ = Math.floor((z + buffer) / this.corridorSize);

    return gridX === this.goalPosition.x && gridZ === this.goalPosition.y;
}

removeFromScene(scene){
    this.walls.forEach(wall => scene.remove(wall));
        if (this.goal) scene.remove(this.goal);
this.walls = [];
this.grid = [];
    
}
 

*/
