import { Input } from "./input";
import { Cooldown } from "./State/cooldown";
import { PlayerStateMachine } from "./State/playerStateMachine";

export class Jump {

    private object: PlayerStateMachine;
    public jumpEnabled: boolean = true;
    public isJumping: boolean = false;
    private minJump: number = 6;
    private jumpForce: number = 27;
    private jumpTime: number = 0;
    private jumpMaxTime: number = 0.2;
    public ignoreGravity: boolean = false;

    constructor(object: PlayerStateMachine) {
        this.object = object;
    }

    public handleJump(deltaTime: number): void {
        if (this.jumpEnabled && this.jumpJustPressed && !this.coyoteTime.isReady() && !this.isJumping) {
            this.isJumping = true;
            this.object.velocity.y = -this.minJump;
            this.jumpTime = 0;
        }

        if (!Input.isKeyPressed(this.object.controls.jump) || (this.jumpTime > this.jumpMaxTime)) {
            this.isJumping = false;
        }

        if (Input.isKeyPressed(this.object.controls.jump) && this.isJumping) {
            this.object.velocity.y -= this.jumpForce * deltaTime
            this.jumpTime += deltaTime;
        }
    }

}