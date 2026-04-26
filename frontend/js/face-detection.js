
const USE_SMOOTHING = false;
const DRAW_EVERY_N = 2;
let USE_TINY_LANDMARKS = true;
const INPUT_SIZE = 160;

let video = document.getElementById('cameraFeed');
let stream = null;
let detecting = false;
let detectCameraLoop = null;

let hasFace = false;
let headEnabled = false; //true jen když běží kamera a smyčka detekce
let smX = 0, smZ = 0; //vyhlazené hodnoty pro player
const ema = 0.25; //vyšší = víc vyhlazené
const maxStep = 0.08; //max změna za frame (slew limit)
const friction = 0.90; //dohasínání když není face


//věci pro vizuální prvky
const videoContainer = document.getElementById('cameraContainer');
    //Canvas pro kreslení rámečku
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 240;
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.pointerEvents = 'none';
    videoContainer.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    //text pro detekci pohybu
    const movementText = document.createElement('div');
    movementText.style.position = 'absolute';
    movementText.style.top = '5px';
    movementText.style.left = '5px';
    movementText.style.color = 'red';
    movementText.style.fontSize = '16px';
    movementText.style.fontWeight = 'bold';
    videoContainer.appendChild(movementText);

 

const button = document.getElementById('toggleCamera');

button.addEventListener('click', async () => {
    if (!stream) {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: {
                width: {ideal: 320},
                height: {ideal: 240},
                frameRate: { ideal: 30}
            }
         });
            video.srcObject = stream;
            await video.play();
            button.innerText = "Vypnout kameru";
            console.log("Kamera zapnuta");

            //po zapnutí se spustí knihovna face-api.js
            await loadModels();
            detecting = true;
            headEnabled = true;
            
            startDetectFaceLoop();

        } catch (err) {
            console.error("Chyba při přístupu ke kameře:", err);
        }
    } else {
        //Vypnout kameru
        console.log("Vypínám kameru...");

        //1) stop detekce
        detecting =false;
        headEnabled = false;
        if(detectCameraLoop) {
            cancelAnimationFrame(detectCameraLoop);
            detectCameraLoop = null;
        }
        //2) vynulování vyhlazovače i hráče
        neutralizeHeadInput();
       
        //3) korektně vypnout stream
        if(stream) {
            stream.getTracks().forEach(t => t.stop());
            stream = null;
        }
        video.pause();
        video.srcObject = null;

        //4) UI
        button.innerText = "Zapnout kameru";
        ctx.clearRect(0,0, canvas.width, canvas.height);
        movementText.innerText = "Bez pohybu";
        //stream.getTracks().forEach(track => track.stop());
        
        
    }
});


//fce pro načtení modelů face-api.js
async function loadModels() {
    console.log("Načítám modely...");
try {
console.log("TF backend před:", tf.getBackend());
await tf.setBackend('webgl'); // pokus o GPU zpracování
await tf.ready();
console.log("TF backend po:", tf.getBackend());
} catch (e) {
    console.warn("Nepodařilo se nastavit WebGL backend, bežím na:", tf.getBackend());
}


    // tiny face detektor
    const MODEL_URL = "../../knihovny/faceapijs/models";
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    try {
        await faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL);
        USE_TINY_LANDMARKS = true;
    console.log("Použity tiny landmarks");

    } catch {
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        USE_TINY_LANDMARKS = false;
        console.log("Tiny landmarks nedostupné, použití full landmarks");
    }
   
    console.log("Modely načteny!");
}

function syncOverlayToVideo() {
    //video se může měnit s layoutem -> čtení reálné velikosti
    canvas.style.width = video.clientWidth + 'px';
    canvas.style.height = video.clientHeight + 'px';

    //pokud video není přesně nahoře v containeru:
    const v = video.getBoundingClientRect();
    const c = videoContainer.getBoundingClientRect();
    canvas.style.left = (v.left - c.left) + 'px';
    canvas.style.top = (v.top - c.top) + 'px';
}
   //zarovnání video canvasu s obličejem
    video.addEventListener('loadedmetadata', () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        syncOverlayToVideo();
    });

    window.addEventListener('resize', syncOverlayToVideo);


//Detekce obličeje každých 100ms
function startDetectFaceLoop() {
    if (detectCameraLoop) return; //check jestli už neběží loop
  const options = new faceapi.TinyFaceDetectorOptions({
    inputSize: 160,
    scoreThreshold: 0.4
  });
  let drawCounter = 0;

  const loop = async () => {
    if (!detecting) return;

    // ochrana: když vypadne stream na chvíli
    if (video.readyState >= 2) {
      const detections = await faceapi
        .detectSingleFace(video, options)
        .withFaceLandmarks(USE_TINY_LANDMARKS);
        //defaulty pro obě větve
        let outX = smX, outZ = smZ;


      

      if (detections) {
        //cíl z obličeje
        const {moveX, moveZ } = processFacePosition(detections);

        //vyhlazení + slew limit
        let outX, outZ;
        if(USE_SMOOTHING) {
          let nextX = smX + ema *(moveX - smX);
          let nextZ = smZ + ema * (moveZ - smZ);
          const step = (current, next) =>
             Math.abs(next - current) > maxStep ? current + Math.sign(next - current) * maxStep : next;
          smX = step(smX, nextX);
          smZ = step(smZ, nextZ);
          outX = smX; outZ = smZ;  
        }else {
            outX = moveX; outZ = moveZ;
            smX = moveX; smZ = moveZ;
        }
        
      
        //kreslení boxu premapování souřadnic na aktuálně zobrazenou velikost videa
       if (++drawCounter % 2 === 0) { //kreslí každý 2 frame pro úsporu
         ctx.clearRect(0, 0, canvas.width, canvas.height);
         const displaySize = {width: video.clientWidth, height: video.clientHeight };
         faceapi.matchDimensions(canvas, displaySize);
         const resized = faceapi.resizeResults(detections, displaySize);
         //přesné vykreslení
         faceapi.draw.drawDetections(canvas, resized);
       }

    }else {
        //žádná detekce -> plynule dohasínat k nule
        smX *= friction;
        smZ *= friction;
        if (Math.abs(smX) < 0.001) smX = 0;
        if (Math.abs(smZ) < 0.001) smZ = 0;
        movementText.innerText = "Bez pohybu";
        outX = smX; outZ = smZ;
    }
    //zapsání do playera jen když je hlava aktivní
    if (window.player) {
        window.player.moveX = headEnabled ? outX : 0;
        window.player.moveZ = headEnabled ? outZ : 0;
    }
}
    detectCameraLoop = requestAnimationFrame(loop);
  };

 detectCameraLoop = requestAnimationFrame(loop);
}


//Získání pozice obličeje a výpočet směru pohybu
function processFacePosition(detections) {
    const nose = detections.landmarks.getNose()[3];
    const faceCenterX = video.videoWidth / 2;
    const faceCenterY = video.videoHeight / 2;

    const offsetX = nose.x - faceCenterX; //vodorovný pohyb
    const offsetY = nose.y -faceCenterY;  //svislý pohyb


    const threshold = 3; //min pohyb k pohybu kuličky
    const maxSpeed = 0.8; //cap
    const sensitivity = 0.05; //intenzita reakce na pohyb

    let moveX = 0;
    let moveZ = 0;

    //horizontal. pohyb (<- - ->)
    if(Math.abs(offsetX) > threshold) {
        const adjustedSpeedX = Math.min(Math.abs(offsetX) * sensitivity, maxSpeed);
        moveX = offsetX > 0 ? +adjustedSpeedX : -adjustedSpeedX;
    }

    // Vertikal pohyb ()
    if(Math.abs(offsetY) > threshold) {
        const adjustedSpeedZ = Math.min(Math.abs(offsetY) * sensitivity, maxSpeed);
        moveZ = offsetY > 0 ? -adjustedSpeedZ : +adjustedSpeedZ;
    }

    //Kombinace směrů
   /* if (window.player) {
        window.player.moveX = moveX;
        window.player.moveZ = moveZ;
    }*/

    // Aktualizace textu pohybu
    if (moveX > 0 && moveZ < 0) {
        movementText.innerText = "↗ Pohyb: vpravo nahoru";
    } else if (moveX > 0 && moveZ > 0) {
        movementText.innerText = "↘ Pohyb: vpravo dolů";
    } else if (moveX < 0 && moveZ < 0) {
        movementText.innerText = "↖ Pohyb: vlevo nahoru";
    } else if (moveX < 0 && moveZ > 0) {
        movementText.innerText = "↙ Pohyb: vlevo dolů";
    } else if (moveX > 0) {
        movementText.innerText = " Pohyb: vpravo";
    } else if (moveX < 0) {
        movementText.innerText = " Pohyb: vlevo";
    } else if (moveZ < 0) {
        movementText.innerText = " Pohyb: nahoru";
    } else if (moveZ > 0) {
        movementText.innerText = " Pohyb: dolů";
    } else {
        movementText.innerText = " Bez pohybu";
    }

    return {moveX, moveZ};
 
}

function neutralizeHeadInput() {
    smX = 0; smZ = 0;
    if (window.player) {
        window.player.moveX = 0;
        window.player.moveZ = 0;

    }
    movementText.innerText = "Bez pohybu";
    ctx.clearRect(0,0, canvas.width, canvas.height);
}

