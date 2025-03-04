import { Game } from './game.js';

document.addEventListener("DOMContentLoaded", () => {
    const game = new Game();
    const resetButton = document.getElementById("resetMaze");
    resetButton.addEventListener("click", () => game.resetMaze());
});

//new Game();

