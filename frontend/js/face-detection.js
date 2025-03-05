

let video;
let stream = null;
let detecting = false;

const button = document.getElementById('toggleCamera');

button.addEventListener('click', async () => {
    if (!stream) {
        //Zapnutí kamery
        console.log("Spouštím kameru...");
        video = document.createElement('video');
        video.style.position = 'absolute';
        video.style.top = '10px';
        video.style.left = '10px';
        video.style.width = '320px';
        video.style.height = '240px';
        video.autoplay = true;
        document.body.appendChild(video);

        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: {} });
            video.srcObject = stream;
            button.innerText = "Vypnout kameru";
            console.log("Kamera zapnuta");

            //po zapnutí spustíme knihovnu face-api.js
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

//Detekce obličeje každých 100ms
async function detectFace() {
    if (!detecting) return;

    const options = new faceapi.TinyFaceDetectorOptions();
    setInterval(async () => {
        const detections = await faceapi.detectSingleFace(video, options).withFaceLandmarks();
        if(detections) {
            processFacePosition(detections);
        }
    }, 100);
}

//Získání pozice obličeje a výpočet směru pohybu
function processFacePosition(detections) {
    const nose = detections.landmarks.getNose()[3];
    const faceCenterX = video.videoWidth / 2;
    const faceCenterY = video.videoHeight / 2;

    const offsetX = nose.x -faceCenterX;
    const offsetY = nose.y -faceCenterY;

    const sensitivity = 0.005; //intensita reakce na pohyb

    console.log(`📡 Zaznamenaná pozice hlavy: X=${offsetX}, Y=${offsetY}`);

    if(window.player) {
        window.player.moveX = offsetX * sensitivity;
        window.player.moveZ = offsetY * sensitivity;
        console.log(`🎮 Předávám pohyb hráči: moveX=${window.player.moveX}, moveZ=${window.player.moveZ}`);

    }
    else {
        console.error("❌ Hráč není dostupný! `window.player` je undefined.");

    }

}