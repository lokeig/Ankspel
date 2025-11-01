import { Controls, Input, Side } from "@common";
import { DynamicObject } from "@core";

class PlayerMove {

    public moveEnabled: boolean = true;
    public movespeed: number = 50;
    private playerCharacter: DynamicObject;

    constructor(object: DynamicObject) {
        this.playerCharacter = object;
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
                this.playerCharacter.direction = Side.left;
            }
            if (Input.keyPress(controls.right)) {
                this.playerCharacter.direction = Side.right;
            }
        } else {
            if (left) {
                this.playerCharacter.direction = Side.left;
            }
            if (right) {
                this.playerCharacter.direction = Side.right;
            }
        }

        this.playerCharacter.velocity.x += this.movespeed * directionMultiplier * deltaTime;
    }

    public willTurn(controls: Controls): boolean {
        const willTurnRight = Input.keyPress(controls.right) && this.playerCharacter.isFlip();
        const willTurnLeft = Input.keyPress(controls.left) && !this.playerCharacter.isFlip();
        return (willTurnLeft || willTurnRight) && this.moveEnabled;
    }
}

export { PlayerMove };
