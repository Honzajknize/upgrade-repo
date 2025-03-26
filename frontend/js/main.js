import { Game } from './game.js';

document.addEventListener("DOMContentLoaded", () => {
    console.log("Dom plně načten!");
    const game = new Game();
    console.log("Game uspešně vytvorena");

    const panel = document.getElementById("mazeSettings");
    const toggleBtn = document.getElementById("toggleSettings");
    if(toggleBtn && panel) {
        toggleBtn.addEventListener("click", () => {
            panel.classList.toggle("open");
        });
    } else {
        console.warn("Panel nebo tlačítko pro nastavení nebylo nalezeno.");
    }

    const resetButton = document.getElementById("resetMaze");
    if (resetButton) {
        resetButton.addEventListener("click", () => game.resetMaze());
    } else {
        console.warn("Reset tlačítko nebylo nalezeno.");
    }
    
});

    
    



//new Game();

