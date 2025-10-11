import { Controls, Input } from "@common";
import { DynamicObject } from "@core";

class PlayerMove {

    public moveEnabled: boolean = true;
    public movespeed: number = 50;

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
            if (Input.keyPress(controls.left)) {
                playerObject.direction = "left"
            }
            if (Input.keyPress(controls.right)) {
                playerObject.direction = "right"
            }
        } else {
            if (left) {
                playerObject.direction = "left";
            }
            if (right) {
                playerObject.direction = "right";
            }
        }

        playerObject.velocity.x += this.movespeed * directionMultiplier * deltaTime;
    }

    public willTurn(dynamicObject: DynamicObject, controls: Controls): boolean {
        const willTurnLeft  = Input.keyPress(controls.left)  && dynamicObject.direction === "right";
        const willTurnRight = Input.keyPress(controls.right) && dynamicObject.direction === "left";
        return (willTurnLeft || willTurnRight) && this.moveEnabled;
    }
}

export { PlayerMove };
