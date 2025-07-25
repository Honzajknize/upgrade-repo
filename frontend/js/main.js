import { Game } from './game.js';

document.addEventListener("DOMContentLoaded", () => {
    console.log("Dom plně načten!");
    const game = new Game();
    console.log("Game uspešně vytvorena");

//rozbalovací panel
    const panel = document.getElementById("mazeSettings");
    const toggleBtn = document.getElementById("toggleSettings");
    if(toggleBtn && panel) {
        toggleBtn.addEventListener("click", () => {
            panel.classList.toggle("closed");
        });
    }

//reset button
    const resetButton = document.getElementById("resetMaze");
    if (resetButton) {
        resetButton.addEventListener("click", () => game.resetMaze());
    }

    //Napojení na nastavení a generování
    const generateButton = document.getElementById("generateMaze");
    if (generateButton) {
        generateButton.addEventListener("click", () => {
            const shape = document.getElementById("mazeShape").value;
            const size = parseInt(document.getElementById("mazeSize").value);
            const difficulty = parseInt(document.getElementById("mazeDifficulty").value);
            const algorithm = document.getElementById("mazeAlgo").value;
            

            console.log(`Generování s: shape=${shape}, size=${size}, difficulty=${difficulty}, algo=${algorithm}`);

            game.selectedAlgorithm = algorithm;
            game.mazeSize = size;


            game.resetMaze();
// Resize fce pro canvas
const container = document.getElementById("gameContainer");
function resizeCanvas() {
    const width = container.clientWidth;
    const height = container.clientHeight;

    if (game.renderer && game.camera) {
        game.renderer.setSize(width, height,false);
        game.renderer.setPixelRatio(window.devicePixelRatio);
        game.camera.aspect = width / height;
        game.camera.updateProjectionMatrix();
    }
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);


        });
    }  
});

  //Fullscreen toggle
  const fullscreenBtn = document.getElementById("fullscreenBtn");
  const appContainer = document.getElementById("appContainer");
  
  if(fullscreenBtn && appContainer) {
    fullscreenBtn.addEventListener("click", () => {
        if(!document.fullscreenElement) {
            appContainer.requestFullscreen().catch(err => console.error("Fullscreen error:", err));
        } else {
            document.exitFullscreen();
        }
    });
  }
    




