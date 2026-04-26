import * as THREE from "../../knihovny/threejs/three.module.js";

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
    //this.trails = [];
    this.trailPoints = [];
    this.trailLines = [];
    this.maxTrailPoints = 80;
    this.lastTrailTime = 0;

    window.player = this; //Globální přístu pro face-detections.js -umožnuje posílat pohyb

    //kulička
    this.geometry = new THREE.SphereGeometry(0.25, 32, 32);

    this.material = new THREE.MeshStandardMaterial({ color: 0x00ffd5 });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);

    //časovač na mizení efektů
    //this.trailTimer = 0;
    this.trailInterval = 10; //po kolika update cyklech se vytvoří stopa
    this.trails = []; // pole pro uložení stop

    this.initControls();
    this.setStartPosition();
  }

  async loadShaders(vertexPath, fragmentPath) {
    try {
      console.log(`Načítám vertex shader z: ${vertexPath}`);
      console.log(`Načítám frag. shader z: ${fragmentPath}`);
      const vertexShader = await fetch(vertexPath).then((res) => res.text());
      const fragmentShader = await fetch(fragmentPath).then((res) =>
        res.text(),
      );

      if (!vertexShader || !fragmentShader) {
        console.error(
          "Shader nebyl načten! Soubor je prázdný nebo neexistuje.",
        );
        return new THREE.MeshStandardMaterial({ color: 0xff0000 });
      }

      console.log(
        " Vertex shader načten:\n",
        vertexShader.substring(0, 100) + "...",
      ); // Zkrácený výpis
      console.log(
        " Fragment shader načten:\n",
        fragmentShader.substring(0, 100) + "...",
      );

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

  initControls() {
    this.keys = {}; //objekt pro sledování stisknutých kláves

    // Uchovám reference pro možnost odstranění
    this._handleKeyDown = (event) => {
      this.keys[event.key.toLowerCase()] = true;
    };

    this._handleKeyUp = (event) => {
      this.keys[event.key.toLowerCase()] = false;
    };

    document.addEventListener("keydown", this._handleKeyDown);
    document.addEventListener("keyup", this._handleKeyUp);
  }

  setStartPosition() {
    if (!this.mesh || !this.maze.startPosition) {
      console.error(" Chyba: `startPosition` není definována v bludišti.");
      return;
    }

    const offsetX = this.maze.offsetX || 0;
    const offsetZ = this.maze.offsetZ || 0;

    this.mesh.position.set(
      offsetX + this.maze.startPosition.x * this.maze.corridorSize,
      0.5,
      offsetZ + this.maze.startPosition.y * this.maze.corridorSize,
    );

    console.log(
      ` Hráč se spawnul na start X=${this.mesh.position.x}, Z=${this.mesh.position.z}`,
    );
  }

  destroy() {
    // Odstranění posluchačů událostí
    document.removeEventListener("keydown", this._handleKeyDown);
    document.removeEventListener("keyup", this._handleKeyUp);

    // Odstranění objektu hráče
    if (this.mesh && this.scene) {
      this.scene.remove(this.mesh);
    }

    // Odstranění trailů
    //this.trails.forEach(trail => this.scene.remove(trail));
    //this.trails = [];

    for (const line of this.trailLines) {
      this.scene.remove(line);
      line.geometry.dispose();
      line.material.dispose();
    }
    this.trailLines = [];
  }

  freeze() {
    this.frozen = true;
  }
  unfreeze() {
    this.frozen = false;
  }

  update(deltaTime) {
    if (this.frozen) return;

    let moveX = this.moveX || 0;
    let moveZ = this.moveZ || 0;

    //kontrola stisknutých kláves
    if (this.keys["s"]) moveZ -= 1;
    if (this.keys["w"]) moveZ += 1;
    if (this.keys["d"]) moveX -= 1;
    if (this.keys["a"]) moveX += 1;

    // tweaking rychlosti (diagonální pohyb aby nebyl 2x)
    const length = Math.sqrt(moveX * moveX + moveZ * moveZ);
    if (length > 0) {
      moveX = (moveX / length) * this.moveSpeed;
      moveZ = (moveZ / length) * this.moveSpeed;

      //posun hráče +kolize

      const newX = this.mesh.position.x + moveX;
      const newZ = this.mesh.position.z + moveZ;

      const futureX = newX + Math.sign(moveX) * 0.3; //maly offset pro lepsi detekci
      const futureZ = newZ + Math.sign(moveZ) * 0.3;

      //outOfBounds zdi

      const isOut = this.maze.isOutOfBounds(newX, newZ);

      //wall sliding
      if (!this.maze.isWall(futureX, futureZ) && !isOut) {
        this.mesh.position.set(newX, this.mesh.position.y, newZ);
      } else {
        let slid = false;

        //test jen ve smeru x (vodorovně)
        const tryX = this.mesh.position.x + moveX;
        const futureOnlyX = tryX + Math.sign(moveX) * 0.3;

        if (
          !this.maze.isWall(futureOnlyX, this.mesh.position.z) &&
          !this.maze.isOutOfBounds(tryX, this.mesh.position.z)
        ) {
          this.mesh.position.x = tryX;
          slid = true;
        }

        //Zkus jen ve směru Z (svisle)
        const tryZ = this.mesh.position.z + moveZ;
        const futureOnlyZ = tryZ + Math.sign(moveZ) * 0.3;
        if (
          !this.maze.isWall(this.mesh.position.x, futureOnlyZ) &&
          !this.maze.isOutOfBounds(this.mesh.position.x, tryZ)
        ) {
          this.mesh.position.z = tryZ;
          slid = true;
        }
        // if (slid){}
      }

      //hrac dojel docile

      const goal = this.maze.goalPosition;
      const threshold = 0.5;

      if (this.maze.goal) {
        const distance = this.mesh.position.distanceTo(this.maze.goal.position);
        if (distance < 0.5) {
          this.game.triggerWin();
        }
      }

      //pokud hrac zmenil pozici pridej trail
      //if (Date.now() - this.lastTrailTime > 400) { // Přidává stopu každou vteřinu
      //this.addTrail();
      // this.lastTrailTime = Date.now();
      //}
      this.updateLineTrail();
    }
   
    
    
    
  }

  addTrail() {
    const trailGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const trailMaterial = new THREE.MeshStandardMaterial({
      color: 0x00ffd5,
      transparent: true,
      opacity: 0.8,
    });

    const trail = new THREE.Mesh(trailGeometry, trailMaterial);
    trail.position.copy(this.mesh.position);

    if (!this.scene) {
      return;
    }

    this.scene.add(trail); // Přidání do hlavní scény
    this.trails.push(trail);
  }

  updateLineTrail() {
    if (
      this.trailPoints.length === 0 ||
      this.mesh.position.distanceTo(
        this.trailPoints[this.trailPoints.length - 1],
      ) > 0.05
    ) {
      this.trailPoints.push(this.mesh.position.clone());
    }

    if (this.trailPoints.length > this.maxTrailPoints) {
      this.trailPoints.shift();
    }
    

   // if (this.trailPoints.length > this.maxTrailPoints) {
    //  this.trailPoints.shift();
   // }
    for (const line of this.trailLines) {
      this.scene.remove(line);
      line.geometry.dispose();
      line.material.dispose();
    }
    this.trailLines = [];

    const offsets = [
      { x: 0, z: 0, y: 0.0, color: 0x00ffff, opacity: 0.85 },
      { x: 0.12, z: 0.04, y: 0.03, color: 0x66ccff, opacity: 0.55 },
      { x: -0.12, z: -0.04, y: 0.03, color: 0x0099ff, opacity: 0.55 },
      { x: 0.06, z: -0.1, y: 0.06, color: 0xff55ff, opacity: 0.45 },
      { x: -0.06, z: 0.1, y: 0.06, color: 0x8844ff, opacity: 0.45 },
    ];
    for (const o of offsets) {
      const shiftedPoints = this.trailPoints.map(
        (p) => new THREE.Vector3(p.x + o.x, p.y + o.y, p.z + o.z),
      );

      if (shiftedPoints.length < 2) continue;

      const curve = new THREE.CatmullRomCurve3(shiftedPoints);

      const geometry = new THREE.TubeGeometry(curve, 24, 0.12, 6, false);

      const material = new THREE.MeshBasicMaterial({
        color: o.color,
        transparent: true,
        opacity: o.opacity,
        depthWrite: false,
      });

      const trailMesh = new THREE.Mesh(geometry, material);

      this.scene.add(trailMesh);
      this.trailLines.push(trailMesh);
    }
  }

  resetPosition() {
    this.setStartPosition();
  }
}
export default Player;
