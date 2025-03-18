let video;
let stream = null;
let detecting = false;



//věci pro vizuální prvky
const videoContainer = document.createElement('div');
    videoContainer.style.position = 'absolute';
    videoContainer.style.top = '10px';
    videoContainer.style.left = '10px';
    videoContainer.style.width = '320px';
    videoContainer.style.height = '240px';
    videoContainer.style.border = '2px solid white';
    videoContainer.style.overflow = 'hidden';
    document.body.appendChild(videoContainer);

    //video prvek
    video = document.createElement('video');
    video.style.width = '100%';
    video.style.height = '100%';
    video.autoplay = true;
    videoContainer.appendChild(video);

    //Canvas pro kreslení rámečku
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 240;
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
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
        //Zapnutí kamery
      
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: {} });
            video.srcObject = stream;
            button.innerText = "Vypnout kameru";
            console.log("Kamera zapnuta");

            //po zapnutí se spustí knihovna face-api.js
            await loadModels();
            detecting = true;
            detectFace();

        } catch (err) {
            console.error("Chyba při přístupu ke kameře:", err);
        }
    } else {
        //Vypnout kameru
        console.log("Vypínám kameru...");
        stream.getTracks().forEach(track => track.stop());
        video.remove();
        stream = null;
        button.innerText = "Zapnout kameru";
    }
});

//fce pro načtení modelů face-api.js
async function loadModels() {
    console.log("Načítám modely...");
    await faceapi.nets.tinyFaceDetector.loadFromUri('/knihovny/faceapijs/models');
    await faceapi.nets.faceLandmark68Net.loadFromUri('/knihovny/faceapijs/models');
    console.log("Modely načteny!");
}

let lastBox ={ x:0, y:0, width: 0, height: 0};


//Detekce obličeje každých 100ms
async function detectFace() {
    if (!detecting) return;

    const options = new faceapi.TinyFaceDetectorOptions();
    setInterval(async () => {
        const detections = await faceapi.detectSingleFace(video, options).withFaceLandmarks();

        ctx.clearRect(0,0, canvas.width, canvas.height);

        if(detections) {
            processFacePosition(detections);

            //rámeček na obličej
            const box = detections.detection.box;
            const scaleX = canvas.width / video.videoWidth;
            const scaleY = canvas.height / video.videoHeight;

            //tolerace na pohyb
            const tolerance = 5;
            if (
                Math.abs(box.x - lastBox.x) > tolerance ||
                Math.abs(box.y - lastBox.y) > tolerance
                ) {
                lastBox = { x: box.x, y: box.y, width: box.width, height: box.height };
                }

            ctx.strokeStyle = "red";
            ctx.lineWidth = 2;
            ctx.strokeRect(
                lastBox.x * scaleX,
                lastBox.y * scaleY,
                lastBox.width * scaleX,
                lastBox.height * scaleY
            );

            //přidání textu na obličej
            ctx.fillStyle = "red";
            ctx.font = "16px Arial";
            ctx.fillText(
                "Obličej detekován",
                 lastBox.x * scaleX,
                 lastBox.y * scaleY- 10
                );
       }
    }, 100);
}

//Získání pozice obličeje a výpočet směru pohybu
function processFacePosition(detections) {
    const nose = detections.landmarks.getNose()[3];
    const faceCenterX = video.videoWidth / 2;
    const faceCenterY = video.videoHeight / 2;

    

    const offsetX = nose.x - faceCenterX; //vodorovný pohyb
    const offsetY = nose.y -faceCenterY;  //svislý pohyb


    const threshold = 7; //min pohyb k pohybu kuličky
    const sensitivity = 0.05; //intenzita reakce na pohyb

    

    //horizontal. pohyb (<- - ->)
    if(Math.abs(offsetX) > threshold) {
        const adjustedSpeedX = Math.min(Math.abs(offsetX) * 0.005, 0.5);
        moveX = offsetX > 0 ? adjustedSpeedX : -adjustedSpeedX;
    }

    // Vertikal pohyb ()
    if(Math.abs(offsetY) > threshold) {
        const adjustedSpeedZ = Math.min(Math.abs(offsetY) * 0.005, 0.5);
        moveZ = offsetY > 0 ? adjustedSpeedZ : -adjustedSpeedZ;
    }

    //Kombinace směrů
    if (window.player) {
        window.player.moveX = moveX;
        window.player.moveZ = moveZ;
    }

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




    /*if (Math.abs(offsetX) > threshold) {
        const adjustedSpeed = Math.min(Math.abs(offsetX) * 0.005,0.5); //Dynamická rychlost
        if (offsetX > 0) {
                window.player.moveX = adjustedSpeed;
                movementText.innerText = " Pohyb: vpravo";
            
        } else {
                window.player.moveX = -adjustedSpeed; // Nastavení moveX
                movementText.innerText = "Pohyb: vlevo";
            
        }
    }
    else {
        
            window.player.moveX = 0; // Pokud je hlava skoro uprostřed, zastavíme kuličku
            movementText.innerText = " bez pohybu";
    
    }*/

   
}