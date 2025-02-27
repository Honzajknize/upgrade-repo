let video;
let stream = null;

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