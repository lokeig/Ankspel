import { Input } from "../../Common/input";
import { Controls, Direction, getReverseDirection } from "../../Common/types";
import { DynamicObject } from "../Common/dynamicObject";

export class PlayerMove {

    public moveEnabled: boolean = false;
    public movespeed: number = 44;
    private lastDirection: Direction = "left"; 
    public velocityBuildUp: number = 0;

    public update(deltaTime: number, playerObject: DynamicObject, controls: Controls): void {
        if (this.moveEnabled) {
            this.move(deltaTime, playerObject, controls);
        }
    }

    public move(deltaTime: number, playerObject: DynamicObject, controls: Controls): void {
        const left  = Input.keyDown(controls.left);
        const right = Input.keyDown(controls.right);
        const directionMultiplier = Number(right) - Number(left);

        if (left && right) {
            playerObject.direction = getReverseDirection(this.lastDirection);
        } else {
            if (left) {
                playerObject.direction = "left";
            }
            if (right) {
                playerObject.direction = "right";
            }
            this.lastDirection = playerObject.direction;
        }

        playerObject.velocity.x += this.movespeed * directionMultiplier * deltaTime;
    }
}
