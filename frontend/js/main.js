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
    } else {
        console.warn("Panel nebo tlačítko pro nastavení nebylo nalezeno.");
    }

//reset button
    const resetButton = document.getElementById("resetMaze");
    if (resetButton) {
        resetButton.addEventListener("click", () => game.resetMaze());
    } else {
        console.warn("Reset tlačítko nebylo nalezeno.");
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


        });
    } else {
        console.warn("Tlačítko pro generování bludiště nebylo nalezeno.");
    }   
});

    
    



//new Game();

