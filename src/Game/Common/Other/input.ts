import { Vector } from "@math";

class Input {
    private static keysDown: Set<string> = new Set();
    private static keysPressed: Set<string> = new Set();
    private static mouseClickBool: boolean = false;
    private static mouseDownBool: boolean = false;
    private static mousePos: Vector = new Vector();

    private static onKeyFunction: Map<string, (Set<(() => void)>)> = new Map();
    private static onAnyKeyFunction: Set<((key: string) => void)> = new Set();

    public static init(): void {
        window.addEventListener('keydown', e => {
            if (document.querySelector('.modal:not(.hidden)')) {
                return;
            }
            this.onAnyKeyFunction.forEach(fn => fn(e.key));
            const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
            const onKeyFunction = this.onKeyFunction.get(key);
            if (onKeyFunction) {
                onKeyFunction.forEach(fn => fn());
            }
            if (!this.keysDown.has(key)) {
                this.keysPressed.add(key);
            }
            this.keysDown.add(key);

            if (["ArrowLeft", "ArrowRight", " ", "Shift", "CapsLock"].includes(key)) {
                e.preventDefault();
            }
        });

        window.addEventListener('keyup', e => {
            const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
            this.keysDown.delete(key);
            this.keysPressed.delete(key);
        });

        window.addEventListener("mousedown", (e) => {
            this.mouseClickBool = true;
            this.mouseDownBool = true;
            this.mousePos = new Vector(e.clientX, e.clientY);
        });

        window.addEventListener("mouseup", () => {
            this.mouseDownBool = false;
        });

        window.addEventListener("mousemove", (e) => {
            this.mousePos = new Vector(e.clientX, e.clientY);
        });
    }

    public static onKey(key: string, e: () => void): void {
        if (!this.onKeyFunction.get(key)) {
            this.onKeyFunction.set(key, new Set());
        }
        this.onKeyFunction.get(key)!.add(e);
    }

    public static onAnyKey(fn: (key: string) => void): void {
        this.onAnyKeyFunction.add(fn);
    }

    public static removeOnKey(key: string, e: () => void): void {
        if (!this.onKeyFunction.get(key)) {
            return;
        }
        this.onKeyFunction.get(key)!.delete(e);
    }

    public static onKeyOnce(key: string, e: () => void): void {
        if (!this.onKeyFunction.get(key)) {
            this.onKeyFunction.set(key, new Set());
        }
        const wrapper = () => {
            e();
            this.onKeyFunction.get(key)!.delete(wrapper);
        }

        this.onKeyFunction.get(key)!.add(wrapper);
    }

    public static keyDown(key: string): boolean {
        return this.keysDown.has(key);
    }

    public static keyPress(key: string): boolean {
        return this.keysPressed.has(key);
    }

    public static mouseDown(): boolean {
        return this.mouseDownBool;
    }

    public static mouseClick(): boolean {
        return this.mouseClickBool;
    }

    public static getMousePos(): Vector {
        return this.mousePos;
    }

    public static update(): void {
        this.mouseClickBool = false;
        this.keysPressed.clear();
    }
}

export { Input };