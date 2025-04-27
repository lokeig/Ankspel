export class Input {
    private static keys: Set<string> = new Set();
    private static justPressedKeys: Set<string> = new Set();


    static init() {
        window.addEventListener('keydown', e => {
            if (!this.keys.has(e.key)) {
                this.justPressedKeys.add(e.key);
            }
            this.keys.add(e.key);
        });
        window.addEventListener('keyup', e => {
            this.keys.delete(e.key);
            this.justPressedKeys.delete(e.key);
        });
    }

    static isKeyPressed(key: string): boolean {
        return this.keys.has(key);
    }

    static isKeyJustPressed(key: string): boolean {
        if (this.justPressedKeys.has(key)) {
            this.justPressedKeys.delete(key);
            return true;
        }
        return false;
    }
}