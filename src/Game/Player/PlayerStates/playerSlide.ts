import { StateInterface, Countdown, Input } from "@common";
import { PlayerBody } from "../Body/playerBody";
import { ThrowType } from "../Body/throwType";
import { PlayerState } from "./playerState";

class PlayerSlide implements StateInterface<PlayerState> {
    
    private playerBody: PlayerBody;
    private platformIgnoreTime = new Countdown(0.15);
    private newHeight: number;
    private crouch: boolean;
    private unstuckSpeed: number = 7;

    constructor(playerBody: PlayerBody, crouch: boolean) {
        this.playerBody = playerBody;
        this.crouch = crouch;
        this.newHeight = 20;
    }

    public stateEntered(): void {
        this.platformIgnoreTime.setToReady();
        this.playerBody.playerMove.moveEnabled = false;
        this.playerBody.dynamicObject.height = this.newHeight;
        this.playerBody.dynamicObject.pos.y += PlayerBody.standardHeight - this.playerBody.dynamicObject.height;
        
        this.playerBody.playerItem.forcedThrowType = ThrowType.drop;

        let armOffset = { x: 16, y: 42 };

        if (this.crouch) {
            armOffset = { x: 10, y: 34 };
        }

        this.playerBody.setArmOffset(armOffset);
    }
    
    public stateUpdate(deltaTime: number): void {    
        
        const animation = this.crouch ? this.playerBody.animations.crouch : this.playerBody.animations.slide;
        this.playerBody.setAnimation(animation);

        if (!this.playerBody.dynamicObject.grounded) {
            this.playerBody.dynamicObject.frictionMultiplier = 0.5;
        } else if (Math.abs(this.playerBody.dynamicObject.velocity.x) > 1.8) {
            this.playerBody.dynamicObject.frictionMultiplier = 1 / 5;
        } else {
            this.playerBody.dynamicObject.frictionMultiplier = 1;
        }
        
        this.playerBody.playerJump.jumpEnabled = true;
        if (Input.keyPress(this.playerBody.controls.jump)) { 
            this.platformIgnoreTime.reset();
            
            if (this.playerBody.dynamicObject.onPlatform()) {
                this.playerBody.playerJump.jumpEnabled = false;
            }
            
            if (this.playerBody.dynamicObject.grounded && this.playerBody.idleCollision()) {
                this.playerBody.dynamicObject.velocity.x = this.unstuckSpeed * this.playerBody.dynamicObject.getDirectionMultiplier();
                this.playerBody.playerJump.jumpEnabled = false;
            }
        }
        
        this.playerBody.dynamicObject.ignorePlatforms = !this.platformIgnoreTime.isDone();
        this.platformIgnoreTime.update(deltaTime);

        this.playerBody.rotateArm(deltaTime);
        this.playerBody.update(deltaTime);
    }

    public stateChange(): PlayerState {
        if (Input.keyPress(this.playerBody.controls.ragdoll) && !this.playerBody.idleCollision()) {
            return PlayerState.Ragdoll;
        }
        if (Input.keyDown(this.playerBody.controls.down) || this.playerBody.idleCollision()) {
            const maxCrouchSpeed = 3;
            const validCrouch = !this.playerBody.dynamicObject.grounded || Math.abs(this.playerBody.dynamicObject.velocity.x) < maxCrouchSpeed || this.playerBody.idleCollision()
            if (this.crouch && validCrouch) {
                return PlayerState.Crouch;
            }
            return PlayerState.Slide;
        }

        return PlayerState.Standard;
    }

    public stateExited(): void {
        this.playerBody.dynamicObject.pos.y -= PlayerBody.standardHeight - this.playerBody.dynamicObject.height;
        this.playerBody.dynamicObject.height = PlayerBody.standardHeight;
        
        this.platformIgnoreTime.reset();
        this.playerBody.dynamicObject.ignorePlatforms = false;
        this.playerBody.playerJump.jumpEnabled = true;
        this.playerBody.playerMove.moveEnabled = true;

        this.playerBody.playerItem.forcedThrowType = null;
        this.playerBody.dynamicObject.frictionMultiplier = 1;
    }

    public stateDraw(): void {
        this.playerBody.draw();
    }
}

export { PlayerSlide };