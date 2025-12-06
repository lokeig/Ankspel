import { Countdown, InputMode } from "@common";
import { DynamicObject } from "@core";
import { PlayerControls } from "./playerControls";

class PlayerJump {
    public isJumping: boolean = false;
    private minJump: number = 6;
    private jumpForce: number = 27;
    public jumpEnabled: boolean = true;

    private coyoteTime = new Countdown(0.15);
    private maxJumpTime = new Countdown(0.2);

    private playerCharacter: DynamicObject;
    private controls: PlayerControls;

    constructor(object: DynamicObject, controls: PlayerControls) {
        this.playerCharacter = object;
        this.controls = controls;
    }

    public update(deltaTime: number) {
        if (this.playerCharacter.grounded) {
            this.coyoteTime.reset();
        }
        this.jump(deltaTime);
    }

    
    private jump(deltaTime: number): void {
        if (this.controls.jump(InputMode.Press) && this.jumpReady() && this.jumpEnabled) {
            this.isJumping = true;
            this.playerCharacter.velocity.y = -this.minJump;
            this.maxJumpTime.reset();
            this.coyoteTime.setToReady();
        }
        
        if (this.controls.jump() && this.isJumping && this.jumpEnabled) {
            this.playerCharacter.velocity.y -= this.jumpForce * deltaTime;
            this.maxJumpTime.update(deltaTime);
        }
        
        if (!this.controls.jump() || this.maxJumpTime.isDone()) {
            this.isJumping = false;
        }
        
        this.coyoteTime.update(deltaTime);
    }
    public getJumpRemaining(): number {
        return 1 - this.maxJumpTime.getPercentageReady();
    }
    
    public getJumpForce(): number {
        return this.jumpForce;
    }

    public jumpReady(): boolean {
        return !this.coyoteTime.isDone() && !this.isJumping;
    }
}

export { PlayerJump };