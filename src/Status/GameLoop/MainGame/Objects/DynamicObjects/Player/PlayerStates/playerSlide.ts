import { Countdown } from "../../../../Common/cooldown";
import { Input } from "../../../../Common/input";
import { StateInterface } from "../../../../Common/stateMachine";
import { PlayerState } from "../../../../Common/Types/playerState";
import { ThrowType } from "../Body/throwType";
import { PlayerBody } from "../Body/playerBody";

export class PlayerSlide extends StateInterface<PlayerState, PlayerBody> {

    private platformIgnoreTime = new Countdown(0.15);
    private newHeight: number;
    private crouch: boolean;
    private frictionIgnoreTime = new Countdown(0.2);
    private unstuckSpeed: number = 7;

    constructor(crouch: boolean) {
        super();
        this.crouch = crouch;
        this.newHeight = 20;
    }

    public stateEntered(playerBody: PlayerBody): void {
        this.platformIgnoreTime.setToReady();
        this.frictionIgnoreTime.reset();
        playerBody.playerMove.moveEnabled = false;
        playerBody.dynamicObject.height = this.newHeight;
        playerBody.dynamicObject.pos.y += playerBody.idleHeight - playerBody.dynamicObject.height;
        
        playerBody.playerItem.forcedThrowType = ThrowType.drop;

        let armOffset = { x: 16, y: 42 };

        if (this.crouch) {
            armOffset = { x: 8, y: 34 };
        }

        playerBody.setArmOffset(armOffset);
    }

    public stateUpdate(deltaTime: number, playerBody: PlayerBody): void {    
        const animation = this.crouch ? playerBody.animations.crouch : playerBody.animations.slide;
        playerBody.setAnimation(animation);
        
        playerBody.playerJump.jumpEnabled = true;
        if (Input.keyPress(playerBody.controls.jump)) { 
            this.platformIgnoreTime.reset();
            
            if (playerBody.dynamicObject.onPlatform()) {
                playerBody.playerJump.jumpEnabled = false;
            }

            if (playerBody.dynamicObject.grounded && playerBody.idleCollision()) {
                playerBody.dynamicObject.velocity.x = this.unstuckSpeed * playerBody.dynamicObject.getDirectionMultiplier();
                playerBody.playerJump.jumpEnabled = false;
            }
        }

        playerBody.dynamicObject.ignorePlatforms = !this.platformIgnoreTime.isDone();
        playerBody.dynamicObject.ignoreFriction = !this.frictionIgnoreTime.isDone();
        this.platformIgnoreTime.update(deltaTime);
        this.frictionIgnoreTime.update(deltaTime);


        playerBody.rotateArm(deltaTime);
        playerBody.update(deltaTime);
    }

    public stateChange(playerBody: PlayerBody): PlayerState {
        if (Input.keyDown(playerBody.controls.down) || playerBody.idleCollision()) {
            const maxCrouchSpeed = 3;
            const validCrouch = !playerBody.dynamicObject.grounded || Math.abs(playerBody.dynamicObject.velocity.x) < maxCrouchSpeed || playerBody.idleCollision()
            if (this.crouch && validCrouch) {
                return PlayerState.Crouch;
            }
            return PlayerState.Slide;
        }
        if (playerBody.dynamicObject.grounded) {
            return PlayerState.Standing;
        }
        return PlayerState.Jump;
    }

    public stateExited(playerBody: PlayerBody): void {
        playerBody.dynamicObject.pos.y -= playerBody.idleHeight - playerBody.dynamicObject.height;
        playerBody.dynamicObject.height = playerBody.idleHeight;
        
        playerBody.dynamicObject.ignorePlatforms = false;
        playerBody.dynamicObject.ignoreFriction = false;

        playerBody.playerJump.jumpEnabled = true;
        playerBody.playerMove.moveEnabled = true;

        playerBody.playerItem.forcedThrowType = null;
    }
}