import { InputMode, Side } from "@common";
import { DynamicObject } from "@core";
import { PlayerControls } from "./playerControls";

class PlayerMove {
    public moveEnabled: boolean = true;
    private movespeed: number = 50;
    private playerCharacter: DynamicObject;
    private controls: PlayerControls;

    constructor(object: DynamicObject, controls: PlayerControls) {
        this.playerCharacter = object;
        this.controls = controls;
    }

    public update(deltaTime: number): void {
        if (this.moveEnabled) {
            this.move(deltaTime);
        }
    }

    public move(deltaTime: number): void {
        const left = this.controls.left();
        const right = this.controls.right();
       
        if (left && right) {
            this.playerCharacter.direction = this.controls.left(InputMode.Press) ? Side.left : Side.right;
        } else if (left) {
            this.playerCharacter.direction = Side.left;
        } else if (right) {
            this.playerCharacter.direction = Side.right;
        }

        this.playerCharacter.velocity.x += this.movespeed * this.controls.getMoveDirection() * deltaTime;
    }

    public willTurn(): boolean {
        const willTurnLeft = this.controls.left() && !this.playerCharacter.isFlip();
        const willTurnRight = this.controls.right() && this.playerCharacter.isFlip();
        return (willTurnLeft || willTurnRight) && this.moveEnabled;
    }
}

export { PlayerMove };
