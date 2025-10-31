import { Controls, Input, Side } from "@common";
import { DynamicObject } from "@core";

class PlayerMove {

    public moveEnabled: boolean = true;
    public movespeed: number = 50;
    private playerObject: DynamicObject;

    constructor(object: DynamicObject) {
        this.playerObject = object;
    }

    public update(deltaTime: number, controls: Controls): void {
        if (this.moveEnabled) {
            this.move(deltaTime, controls);
        }
    }

    public move(deltaTime: number, controls: Controls): void {
        const left = Input.keyDown(controls.left);
        const right = Input.keyDown(controls.right);
        const directionMultiplier = Number(right) - Number(left);

        if (left && right) {
            if (Input.keyPress(controls.left)) {
                this.playerObject.direction = Side.left;
            }
            if (Input.keyPress(controls.right)) {
                this.playerObject.direction = Side.right;
            }
        } else {
            if (left) {
                this.playerObject.direction = Side.left;
            }
            if (right) {
                this.playerObject.direction = Side.right;
            }
        }

        this.playerObject.velocity.x += this.movespeed * directionMultiplier * deltaTime;
    }

    public willTurn(controls: Controls): boolean {
        const willTurnRight = Input.keyPress(controls.right) && this.playerObject.isFlip();
        const willTurnLeft = Input.keyPress(controls.left) && !this.playerObject.isFlip();
        return (willTurnLeft || willTurnRight) && this.moveEnabled;
    }
}

export { PlayerMove };
