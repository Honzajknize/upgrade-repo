import { Game } from './game.js';

document.addEventListener("DOMContentLoaded", () => {
    console.log("Dom plně načten!");
    const game = new Game();
    console.log("Game uspešně vytvorena");
    const resetButton = document.getElementById("resetMaze");
    resetButton.addEventListener("click", () => game.resetMaze());
});

//new Game();

