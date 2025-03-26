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
         //this.generatePrimMaze();
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

    
