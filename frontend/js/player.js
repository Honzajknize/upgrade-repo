import * as THREE from '../../knihovny/threejs/three.module.js';
export class Player {
constructor(scene, maze, wallSize, corridorSize) {
    this.scene = scene;
    this.lastTrailTime = 0;
    this.wallSize = wallSize;
    this.corridorSize = corridorSize;
    this.maze = maze;
    window.player = this; //Globální přístu pro face-detections.js
    this.geometry = new THREE.SphereGeometry(0.5,32,32);
    this.material = new THREE.MeshStandardMaterial({ color: 0x00ffd5});
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    
    //časovač na mizení efektů
    this.trailTimer = 0;
    this.trailInterval = 10; //po kolika update cyklech se vytvoří stopa
    this.trails = []; // pole pro uložení stop
   // this.setStartPosition();

   
    
    scene.add(this.mesh);

    this.moveSpeed = 0.1;
    this.initControls();
}


initControls(){
    this.keys = {}; //objekt pro sledování stisknutých kláves
   
     document.addEventListener('keydown',
         (event) => {
            this.keys[event.key.toLowerCase()] = true;
         });

     document.addEventListener('keyup',
         (event) => {
            this.keys[event.key.toLowerCase()] = false;
        });   
}

update() {
   
   // let moveX = 0;
    //let moveZ = 0;

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

        //posun hráče

        if (!this.moveX) this.moveX = 0;
        if (!this.moveZ) this.moveZ = 0;
        this.mesh.position.x += moveX;
        this.mesh.position.z += moveZ;
        console.log(`🕹 Kulička se pohybuje: X=${this.mesh.position.x}, moveX=${this.moveX}, Z=${this.mesh.position.z}`);

       
        //pokud hrac zmenil pozici pridej trail 
        if (Date.now() - this.lastTrailTime > 400) { // ⏳ Přidává stopu každou vteřinu
            this.addTrail();
            this.lastTrailTime = Date.now();
        }

        for (let i = this.trails.length - 1; i >= 0; i--) {
            const trail = this.trails[i];
            trail.material.opacity -= 0.02; // Snižujeme průhlednost
            if (trail.material.opacity <= 0) {
                this.scene.remove(trail); //  Odstraníme trail ze scény
                this.trails.splice(i, 1); //  Odstraníme ho i z pole
                console.log(" Trail odstraněn, zbývá:", this.trails.length);
            }
        }
        

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
        console.log("✅ Stopa úspěšně přidána!");
    }
    


resetPosition() {
   
    this.setStartPosition();
}


}
export default Player;