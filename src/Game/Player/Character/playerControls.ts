import { Controls, Input } from "@common";

const click = true;

class PlayerControls {
    private controls: Controls;

    constructor(controls: Controls) {
        this.controls = controls;
    }

    public left(press?: boolean): boolean {
        if (press) {
            return Input.keyPress(this.controls.left);
        }
        return Input.keyDown(this.controls.left);
    }

    public right(press?: boolean): boolean {
        if (press) {
            return Input.keyPress(this.controls.right);
        }
        return Input.keyDown(this.controls.right);
    }

    public getMoveDirection(): number {
        return  Number(this.right()) - Number(this.left());
    }

    public ragdoll(): boolean {
        return Input.keyPress(this.controls.ragdoll);
    }

    public down(press?: boolean): boolean {
        if (press) {
            return Input.keyPress(this.controls.down);
        }
        return Input.keyDown(this.controls.down);
    }

    public jump(press?: boolean): boolean {
        if (press) {
            return Input.keyPress(this.controls.jump);
        }
        return Input.keyDown(this.controls.jump);
    }

    public up(press?: boolean): boolean {
        if (press) {
            return Input.keyPress(this.controls.up);
        }
        return Input.keyDown(this.controls.up);
    }

    public shoot(press?: boolean): boolean {
        if (press) {
            return Input.keyPress(this.controls.shoot);
        }
        return Input.keyPress(this.controls.shoot);
    }

    public pickup(press?: boolean): boolean {
        if (press) {
            return Input.keyPress(this.controls.pickup);
        }
        return Input.keyPress(this.controls.pickup);
    }
}

export { click };
export { PlayerControls };