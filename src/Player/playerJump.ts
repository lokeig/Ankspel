import { Cooldown } from "../cooldown";
import { Input } from "../input";
import { Controls } from "../types";

export class PlayerJump {
    public isJumping: boolean = false;
    private minJump: number = 6;
    private jumpForce: number = 27;

    private coyoteTime = new Cooldown(0.08);
    private maxJumpTime = new Cooldown(0.2);

    public jumpVelocity: number = 0;

    public resetCoyote(): void {
        this.coyoteTime.reset();
    }

    public getVelocity(deltaTime: number, currentVelocityY: number, controls: Controls): number {
        if (Input.keyPress(controls.jump) && this.jumpReady()) {
            this.isJumping = true;
            currentVelocityY = -this.minJump;
            this.maxJumpTime.reset();
        }

        if (Input.keyDown(controls.jump) && this.isJumping) {
            currentVelocityY -= this.jumpForce * deltaTime;
            this.maxJumpTime.update(deltaTime);
        }

        if (!Input.keyDown(controls.jump) || this.maxJumpTime.isReady()) {
            this.jumpVelocity = 0;
            this.isJumping = false;
        }

        this.coyoteTime.update(deltaTime);
        return currentVelocityY;
    }

    public jumpReady(): boolean {
        return !this.coyoteTime.isReady() && !this.isJumping;
    }
}