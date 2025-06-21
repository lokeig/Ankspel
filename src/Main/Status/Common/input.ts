import { Vector } from "./types";

export class Input {
    private static keysDown: Set<string> = new Set();
    private static keysPressed: Set<string> = new Set();
    private static mouseClickBool: boolean = false;
    private static mouseDownBool: boolean = false;
    private static mousePos: Vector = { x: 0, y: 0 }

    static init() {

        window.addEventListener('keydown', e => {
            if (!this.keysDown.has(e.key)) {
                this.keysPressed.add(e.key);
            }
            this.keysDown.add(e.key);
            if (e.key === " " || e.key === "ArrowLeft" || e.key === "ArrowUp") {
                e.preventDefault();
            }
        });

        window.addEventListener('keyup', e => {
            this.keysDown.delete(e.key);
            this.keysPressed.delete(e.key);
        });

        window.addEventListener("mousedown", (e) => {
            this.mouseClickBool = true;
            this.mouseDownBool = true;
            this.mousePos = { x: e.clientX, y: e.clientY };
        });

        window.addEventListener("mouseup", () => {
            this.mouseDownBool = false;
        });

        window.addEventListener("mousemove", (e) => {
            this.mousePos = { x: e.clientX, y: e.clientY }
        });
    }

    static keyDown(key: string): boolean {
        return this.keysDown.has(key);
    }

    static keyPress(key: string): boolean {
        return this.keysPressed.has(key);
    }

    static mouseDown(): boolean {
        return this.mouseDownBool;
    }

    static mouseClick(): boolean {
        return this.mouseClickBool;
    }

    static getMousePos(): Vector {
        return this.mousePos;
    }

    static update() {
        this.mouseClickBool = false;
        this.keysPressed.clear();
    }
}