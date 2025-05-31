import { Input } from "../../../Common/input";
import { Direction, Controls, getReverseDirection } from "../../../Common/types";


export class PlayerMove {

    public movespeed: number = 44;

    private direction: Direction = "left";
    private lastDirection: Direction = "left";

    public velocityBuildUp: number = 0;

    public getVelocity(deltaTime: number, currentVelocityX: number, controls: Controls): number {
        const left  = Input.keyDown(controls.left);
        const right = Input.keyDown(controls.right);

        const directionMultiplier = Number(right) - Number(left);

        if (left && right) {
            this.direction = getReverseDirection(this.lastDirection);
        } else {
            if (left) {
                this.direction = "left";
            }
            if (right) {
                this.direction = "right";
            }
            this.lastDirection = this.direction;
        }

        currentVelocityX += this.movespeed * directionMultiplier * deltaTime;
        return currentVelocityX;
    }

    public getDirection(): Direction {
        return this.direction;
    }
}