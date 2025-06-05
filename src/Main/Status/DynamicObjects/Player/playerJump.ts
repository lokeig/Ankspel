import { Cooldown } from "../../Common/cooldown";
import { Input } from "../../Common/input";
import { Controls } from "../../Common/types";
import { DynamicObject } from "../Common/dynamicObject";

export class PlayerJump {
    public isJumping: boolean = false;
    private minJump: number = 6;
    private jumpForce: number = 27;
    public jumpEnabled: boolean = true;

    private coyoteTime = new Cooldown(0.08);
    private maxJumpTime = new Cooldown(0.2);

    public jumpVelocity: number = 0;

    update(deltaTime: number, playerObject: DynamicObject, controls: Controls) {
        if (playerObject.grounded) {
            this.coyoteTime.reset();
        }

        this.jump(deltaTime, playerObject, controls);
    }

    public jump(deltaTime: number, playerObject: DynamicObject, controls: Controls): void {
        if (Input.keyPress(controls.jump) && this.jumpReady() && this.jumpEnabled) {
            this.isJumping = true;
            playerObject.velocity.y = -this.minJump;
            this.maxJumpTime.reset();
        }

        if (Input.keyDown(controls.jump) && this.isJumping && this.jumpEnabled) {
            playerObject.velocity.y -= this.jumpForce * deltaTime;
            this.maxJumpTime.update(deltaTime);
        }

        if (!Input.keyDown(controls.jump) || this.maxJumpTime.isReady()) {
            this.isJumping = false;
        }

        this.coyoteTime.update(deltaTime);
    }

    public jumpReady(): boolean {
        return !this.coyoteTime.isReady() && !this.isJumping;
    }
}