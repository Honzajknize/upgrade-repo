export class MiniMap {
    constructor() {
        this.button = document.getElementById("toggleMiniMap");
        this.container = document.getElementById("gameMiniMap");
        this.canvas = document.getElementById("miniMapCanvas");

        if (!this.button || !this.container || !this.canvas) {
            console.error("MiniMap elements not found", {
                button: this.button,
                container: this.container,
                canvas: this.canvas
            });
            return;
        }
        this.ctx = this.canvas.getContext("2d");
        this.currentData = null;

        this.initEvents();
    }

    initEvents() {
        this.button.addEventListener("click", () => {
            this.toggle();
        });

        document.addEventListener("keydown", (e) => {
            if (e.key.toLowerCase() === "m") {
                this.toggle();
            }
        });
    }

    toggle() {
        const isHidden = getComputedStyle(this.container).display === "none";
        this.container.style.display = isHidden ? "block" : "none";

        if(isHidden && this.currentData) {
            this.render(this.currentData);
        }
    }

    render(data) {
        if (!data || !data.grid || !Array.isArray(data.grid)) {
            console.error("Invalid minimapdata:", data);
            return;
        }

        this.currentData = data;

        const { grid, start, goal } = data;
        const rows = grid.length;
        const cols = grid[0].length;

        this.canvas.width = 220;
        this.canvas.height = 220;

        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const cellSize = Math.min(
            this.canvas.width / cols,
            this.canvas.height / rows
        );

        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const value = grid[y][x];

                if (value === 1) {
                    ctx.fillStyle = "black";
                } else {
                    ctx.fillStyle = "white";
                }

                ctx.fillRect(
                    x * cellSize,
                    y * cellSize,
                    cellSize,
                    cellSize
                );
            }
        }

        if (start) {
            ctx.fillStyle = "lime";
            ctx.fillRect(
                start.x * cellSize,
                start.y * cellSize,
                cellSize,
                cellSize
            );
        }

        if (goal) {
            ctx.fillStyle = "red";
            ctx.fillRect(
                goal.x * cellSize,
                goal.y * cellSize,
                cellSize,
                cellSize
            );
        }
    }
}
