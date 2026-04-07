import { Controls, Input, InputMode } from "@common";

class PlayerControls {
    private controls: Controls;
    private locks: Set<string> = new Set();

    constructor(controls: Controls) {
        this.controls = controls;
    }

    public addLock(reason: string): void {
        this.locks.add(reason);
    }

    public removeLock(reason: string): void {
        this.locks.delete(reason);
    }

    private getKey(key: string, inputMode: InputMode): boolean {
        if (this.locks.size !== 0) {
            return false;
        }

        return inputMode === InputMode.Press
            ? Input.keyPress(key)
            : Input.keyDown(key);
    }

    public left(inputMode: InputMode = InputMode.Hold): boolean {
        return this.getKey(this.controls.left, inputMode);
    }

    public right(inputMode: InputMode = InputMode.Hold): boolean {
        return this.getKey(this.controls.right, inputMode);
    }

    public getMoveDirection(): number {
        return Number(this.right()) - Number(this.left());
    }

    public ragdoll(inputMode: InputMode = InputMode.Press): boolean {
        return this.getKey(this.controls.ragdoll, inputMode);
    }

    public down(inputMode: InputMode = InputMode.Hold): boolean {
        return this.getKey(this.controls.down, inputMode);
    }

    public jump(inputMode: InputMode = InputMode.Hold): boolean {
        return this.getKey(this.controls.jump, inputMode);
    }

    public up(inputMode: InputMode = InputMode.Hold): boolean {
        return this.getKey(this.controls.up, inputMode);
    }

    public shoot(inputMode: InputMode = InputMode.Hold): boolean {
        return this.getKey(this.controls.shoot, inputMode);
    }

    public pickup(inputMode: InputMode = InputMode.Hold): boolean {
        return this.getKey(this.controls.pickup, inputMode);
    }

    public strafe(inputMode: InputMode = InputMode.Hold): boolean {
        return this.getKey(this.controls.strafe, inputMode);
    }

    public quack(inputMode: InputMode = InputMode.Hold): boolean {
        return this.getKey(this.controls.quack, inputMode);
    }
}

export { PlayerControls };