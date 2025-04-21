export class Input {
    private static keys: Set<string> = new Set();

    static init(){
        window.addEventListener('keydown', e => this.keys.add(e.key));
        window.addEventListener('keyup', e => this.keys.delete(e.key));
    }

    static isKeyPressed(key: string): boolean {
        return this.keys.has(key);
    }
}