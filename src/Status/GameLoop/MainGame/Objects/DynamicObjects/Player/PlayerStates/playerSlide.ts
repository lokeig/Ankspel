import { Countdown } from "../../../../Common/cooldown";
import { Input } from "../../../../Common/input";
import { StateInterface } from "../../../../Common/StateMachine/stateInterface";
import { PlayerState } from "./playerState";
import { ThrowType } from "../Body/throwType";
import { PlayerBody } from "../Body/playerBody";

export class PlayerSlide implements StateInterface<PlayerState> {
    
    private playerBody: PlayerBody;
    private platformIgnoreTime = new Countdown(0.15);
    private newHeight: number;
    private crouch: boolean;
    private frictionIgnoreTime = new Countdown(0.2);
    private unstuckSpeed: number = 7;

    constructor(playerBody: PlayerBody, crouch: boolean) {
        this.playerBody = playerBody;
        this.crouch = crouch;
        this.newHeight = 20;
    }

    public stateEntered(): void {
        this.platformIgnoreTime.setToReady();
        this.frictionIgnoreTime.reset();
        this.playerBody.playerMove.moveEnabled = false;
        this.playerBody.dynamicObject.height = this.newHeight;
        this.playerBody.dynamicObject.pos.y += this.playerBody.idleHeight - this.playerBody.dynamicObject.height;
        
        this.playerBody.playerItem.forcedThrowType = ThrowType.drop;

        let armOffset = { x: 16, y: 42 };

        if (this.crouch) {
            armOffset = { x: 8, y: 34 };
        }

        this.playerBody.setArmOffset(armOffset);
    }

    public stateUpdate(deltaTime: number): void {    
        const animation = this.crouch ? this.playerBody.animations.crouch : this.playerBody.animations.slide;
        this.playerBody.setAnimation(animation);
        
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
        this.playerBody.dynamicObject.ignoreFriction = !this.frictionIgnoreTime.isDone();
        this.platformIgnoreTime.update(deltaTime);
        this.frictionIgnoreTime.update(deltaTime);


        this.playerBody.rotateArm(deltaTime);
        this.playerBody.update(deltaTime);
    }

    public stateChange(): PlayerState {
        if (Input.keyDown(this.playerBody.controls.down) || this.playerBody.idleCollision()) {
            const maxCrouchSpeed = 3;
            const validCrouch = !this.playerBody.dynamicObject.grounded || Math.abs(this.playerBody.dynamicObject.velocity.x) < maxCrouchSpeed || this.playerBody.idleCollision()
            if (this.crouch && validCrouch) {
                return PlayerState.Crouch;
            }
            return PlayerState.Slide;
        }
        if (this.playerBody.dynamicObject.grounded) {
            return PlayerState.Standing;
        }
        return PlayerState.Jump;
    }

    public stateExited(): void {
        this.playerBody.dynamicObject.pos.y -= this.playerBody.idleHeight - this.playerBody.dynamicObject.height;
        this.playerBody.dynamicObject.height = this.playerBody.idleHeight;
        
        this.playerBody.dynamicObject.ignorePlatforms = false;
        this.playerBody.dynamicObject.ignoreFriction = false;

        this.playerBody.playerJump.jumpEnabled = true;
        this.playerBody.playerMove.moveEnabled = true;

        this.playerBody.playerItem.forcedThrowType = null;
    }

    public stateDraw(): void {
        this.playerBody.draw();
    }
}