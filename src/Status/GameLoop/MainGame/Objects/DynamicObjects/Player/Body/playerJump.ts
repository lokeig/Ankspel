import { Countdown } from "../../../../Common/cooldown";
import { Input } from "../../../../Common/input";
import { Controls } from "../../../../Common/Types/controls";
import { DynamicObject } from "../../Common/dynamicObject";

export class PlayerJump {
    public isJumping: boolean = false;
    private minJump: number = 6;
    private jumpForce: number = 27;
    public jumpEnabled: boolean = true;

    private coyoteTime = new Countdown(0.15);
    private maxJumpTime = new Countdown(0.2);

    public update(deltaTime: number, playerObject: DynamicObject, controls: Controls) {
        if (playerObject.grounded) {
            this.coyoteTime.reset();
        }
        this.jump(deltaTime, playerObject, controls);
    }

    
    private jump(deltaTime: number, playerObject: DynamicObject, controls: Controls): void {
        if (Input.keyPress(controls.jump) && this.jumpReady() && this.jumpEnabled) {
            this.isJumping = true;
            playerObject.velocity.y = -this.minJump;
            this.maxJumpTime.reset();
            this.coyoteTime.setToReady();
        }
        
        if (Input.keyDown(controls.jump) && this.isJumping && this.jumpEnabled) {
            playerObject.velocity.y -= this.jumpForce * deltaTime;
            this.maxJumpTime.update(deltaTime);
        }
        
        if (!Input.keyDown(controls.jump) || this.maxJumpTime.isDone()) {
            this.isJumping = false;
        }
        
        this.coyoteTime.update(deltaTime);
    }
    public getJumpRemainig(): number {
        return 1 - this.maxJumpTime.getPercentageReady();
    }
    
    public getJumpForce(): number {
        return this.jumpForce;
    }

    public jumpReady(): boolean {
        return !this.coyoteTime.isDone() && !this.isJumping;
    }
}