import { Controls, Input, InputMode } from "@common";

class PlayerControls {
    private controls: Controls;

    constructor(controls: Controls) {
        this.controls = controls;
    }

    public left(inputMode: InputMode = InputMode.Hold): boolean {
        if (inputMode === InputMode.Press) {
            return Input.keyPress(this.controls.left);
        }
        return Input.keyDown(this.controls.left);
    }

    public right(inputMode: InputMode = InputMode.Hold): boolean {
        if (inputMode === InputMode.Press) {
            return Input.keyPress(this.controls.right);
        }
        return Input.keyDown(this.controls.right);
    }

    public getMoveDirection(): number {
        return Number(this.right()) - Number(this.left());
    }

    public ragdoll(): boolean {
        return Input.keyPress(this.controls.ragdoll);
    }

    public down(inputMode: InputMode = InputMode.Hold): boolean {
        if (inputMode === InputMode.Press) {
            return Input.keyPress(this.controls.down);
        }
        return Input.keyDown(this.controls.down);
    }

    public jump(inputMode: InputMode = InputMode.Hold): boolean {
        if (inputMode === InputMode.Press) {
            return Input.keyPress(this.controls.jump);
        }
        return Input.keyDown(this.controls.jump);
    }

    public up(inputMode: InputMode = InputMode.Hold): boolean {
        if (inputMode === InputMode.Press) {
            return Input.keyPress(this.controls.up);
        }
        return Input.keyDown(this.controls.up);
    }

    public shoot(inputMode: InputMode = InputMode.Hold): boolean {
        if (inputMode === InputMode.Press) {
            return Input.keyPress(this.controls.shoot);
        }
        return Input.keyDown(this.controls.shoot);
    }

    public pickup(inputMode: InputMode = InputMode.Hold): boolean {
        if (inputMode === InputMode.Press) {
            return Input.keyPress(this.controls.pickup);
        }
        return Input.keyDown(this.controls.pickup);
    }
}

export { PlayerControls };