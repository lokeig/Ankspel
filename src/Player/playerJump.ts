import { Cooldown } from "../cooldown";

export class PlayerJump {
    public jumpEnabled: boolean = true;
    public isJumping: boolean = false;
    private minJump: number = 6;
    private jumpForce: number = 27;
    private jumpTime: number = 0;
    private jumpMaxTime: number = 0.2;
    private coyoteTime = new Cooldown(0.08);

    private currentJumpCharge;

    startJump() {
        this.isJumping = true;
        this.currentJumpCharge = -this.minJump;
        this.jumpTime = 0;
    }

    stopJump() {
        this.isJumping = false;
    }

    continueJump() {
        this.velocity.y -= this.jumpForce * deltaTime
        this.jumpTime += deltaTime;
    }
}