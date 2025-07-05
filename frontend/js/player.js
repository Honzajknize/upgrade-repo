import * as THREE from '../../knihovny/threejs/three.module.js';

export class Player {
constructor(game, scene, maze, wallSize, corridorSize) {
    if (!scene || !(scene instanceof THREE.Scene)) {
        console.error("Chyba: scene není správný THREE.Scene objekt!", scene);
        return;
    }
    
    
    this.game = game;
    this.scene = scene;
    this.maze = maze;
    this.wallSize = wallSize;
    this.corridorSize = corridorSize;
    this.moveSpeed = 0.05;
    //this.geometry = new THREE.SphereGeometry(0.5, 32,32);
    this.trails = [];
    this.lastTrailTime = 0;

    window.player = this; //Globální přístu pro face-detections.js -umožnuje posílat pohyb

    //kulička
    this.geometry = new THREE.SphereGeometry(0.25,32,32);

    //TEST SHADERU
    /*this.loadShaders("../shadery/SpaceSpore.vs", "../shadery/SpaceSpore.fs").then(material => {
        this.mesh = new THREE.Mesh(this.geometry, material);
        scene.add(this.mesh);
        if (this.mesh) {
            this.setStartPosition();
        } else {
            console.error(" Chyba: this.mesh není vytvořen!");
        } 
    })
    .catch(error => console.error("Chyba při načítání shaderů:", error));
*/
   // this.initControls();
    //this.setStartPosition();

    this.material = new THREE.MeshStandardMaterial({ color: 0x00ffd5});
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);
    
    //časovač na mizení efektů
    this.trailTimer = 0;
    this.trailInterval = 10; //po kolika update cyklech se vytvoří stopa
    this.trails = []; // pole pro uložení stop

  

   // this.player = new Player(this, this.scene, this.maze, this.wallSize, 2);
    

   
    
    
    this.initControls();
    this.setStartPosition();
}

async loadShaders(vertexPath,fragmentPath) {
    try {
        console.log(`Načítám vertex shader z: ${vertexPath}`);
        console.log(`Načítám frag. shader z: ${fragmentPath}`);
        const vertexShader = await fetch(vertexPath).then(res => res.text());
        const fragmentShader = await fetch(fragmentPath).then(res => res.text());

        if (!vertexShader || !fragmentShader) {
            console.error("Shader nebyl načten! Soubor je prázdný nebo neexistuje.");
            return new THREE.MeshStandardMaterial({ color: 0xff0000 });
        }

        console.log(" Vertex shader načten:\n", vertexShader.substring(0, 100) + "..."); // Zkrácený výpis
        console.log(" Fragment shader načten:\n", fragmentShader.substring(0, 100) + "...");



    //vytvoření materiálu
        return new THREE.ShaderMaterial({
            uniforms: { time: { value: 0.0 } },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
        
        });

    } catch (error) {
        console.error(" Chyba při načítání shaderů:", error);
        return new THREE.MeshStandardMaterial({ color: 0xff0000 });
    }
    
}




initControls(){
    this.keys = {}; //objekt pro sledování stisknutých kláves

     // Uchovám reference pro možnost odstranění
     this._handleKeyDown = (event) => {
        this.keys[event.key.toLowerCase()] = true;
    };

    this._handleKeyUp = (event) => {
        this.keys[event.key.toLowerCase()] = false;
    };

    document.addEventListener('keydown', this._handleKeyDown);
    document.addEventListener('keyup', this._handleKeyUp);
}
   
    /* document.addEventListener('keydown',
         (event) => {
            this.keys[event.key.toLowerCase()] = true;
         });

     document.addEventListener('keyup',
         (event) => {
            this.keys[event.key.toLowerCase()] = false;
        });  
         
}
        */

setStartPosition(){
    if(!this.mesh || !this.maze.startPosition) {
        console.error(" Chyba: `startPosition` není definována v bludišti.");
        return;
    }
    
    const offsetX = this.maze.offsetX || 0;
    const offsetZ = this.maze.offsetZ || 0;


   this.mesh.position.set(
        offsetX + this.maze.startPosition.x * this.wallSize,
        0.5,
        offsetZ + this.maze.startPosition.y * this.wallSize
   );

   console.log(` Hráč se spawnul na start X=${this.mesh.position.x}, Z=${this.mesh.position.z}`);

}

destroy() {
   // Odstranění posluchačů událostí
   document.removeEventListener('keydown', this._handleKeyDown);
   document.removeEventListener('keyup', this._handleKeyUp);

   // Odstranění objektu hráče
   if (this.mesh && this.scene) {
       this.scene.remove(this.mesh);
   }

   // Odstranění trailů
   this.trails.forEach(trail => this.scene.remove(trail));
   this.trails = [];
}



update(deltaTime) {
   
    let moveX = this.moveX || 0;
    let moveZ = this.moveZ || 0;

     //kontrola stisknutých kláves
     if(this.keys['s']) moveZ -= 1;
     if(this.keys['w']) moveZ += 1;
     if(this.keys['d']) moveX -= 1;
     if(this.keys['a']) moveX += 1;

    // tweaking rychlosti (diagonální pohyb aby nebyl 2x)
    const length = Math.sqrt(moveX * moveX + moveZ * moveZ);
    if(length > 0){
        moveX = (moveX / length)* this.moveSpeed;
        moveZ = (moveZ / length) * this.moveSpeed;

        //posun hráče +kolize


       const newX = this.mesh.position.x + moveX;
       const newZ = this.mesh.position.z + moveZ;

       const futureX = newX + Math.sign(moveX) * 0.3;//maly offset pro lepsi detekci
       const futureZ = newZ + Math.sign(moveZ) * 0.3;

       //outOfBounds zdi

        const isOut = this.maze.isOutOfBounds(newX, newZ);

        
       
        if (!this.maze.isWall(futureX,futureZ) && !isOut) {
            this.mesh.position.set(newX, this.mesh.position.y, newZ);
            
        }
            
            

        //this.mesh.position.x += newX;
        //this.mesh.position.z += newZ;
        
       

        //hrac dojel docile
       if (this.maze.isCheckpoint(this.mesh.position.x, this.mesh.position.z)) {
            this.game.showWinMenu();
        }

        //pokud hrac zmenil pozici pridej trail 
        if (Date.now() - this.lastTrailTime > 400) { // Přidává stopu každou vteřinu
            this.addTrail();
            this.lastTrailTime = Date.now();
        }

        for (let i = this.trails.length - 1; i >= 0; i--) {
            const trail = this.trails[i];
            trail.material.opacity -= 0.02; // Snižujeme opacitu trailu
            if (trail.material.opacity <= 0) {
                this.scene.remove(trail); //  Odstraníme trail ze scény
                this.trails.splice(i, 1); //  Odstraníme ho i z pole
                console.log(" Trail odstraněn, zbývá:", this.trails.length);
            }
        }
//  Animace shaderu (pokud podporuje čas)
/*if (this.mesh && this.mesh.material.uniforms.time) {
    this.mesh.material.uniforms.time.value += deltaTime;
}
*/
    }

    }

    addTrail() {
        
        const trailGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const trailMaterial = new THREE.MeshStandardMaterial({
            color: 0x00ffd5,
            transparent: true,
            opacity: 0.8
        });
    
        const trail = new THREE.Mesh(trailGeometry, trailMaterial);
        trail.position.copy(this.mesh.position);

        if (!this.scene) {
            
            return;
        }
    
        this.scene.add(trail); // Přidání do hlavní scény
        this.trails.push(trail);
        
    }
    


resetPosition() {
  
    this.setStartPosition();
}


}
export default Player;