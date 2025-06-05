import { Cooldown } from "../../../Common/cooldown";
import { Input } from "../../../Common/input";
import { StateInterface } from "../../../Common/stateMachine";
import { PlayerState } from "../../../Common/types";
import { PlayerBody } from "../playerBody";

export class PlayerSlide extends StateInterface<PlayerState, PlayerBody> {

    private platformIgnoreTime = new Cooldown(0.15);
    private newHeight: number;
    private crouch: boolean;

    constructor(crouch: boolean = false) {
        super();
        this.crouch = crouch;

        this.newHeight = 20;
    }
    public stateEntered(playerBody: PlayerBody): void {
        this.platformIgnoreTime.setToReady();

        playerBody.dynamicObject.friction = playerBody.slideFriction;
        playerBody.playerMove.moveEnabled = false;
        playerBody.dynamicObject.height = this.newHeight;
        playerBody.dynamicObject.pos.y += playerBody.idleHeight - playerBody.dynamicObject.height;
    }

    public stateUpdate(deltaTime: number, playerBody: PlayerBody): void {    

        playerBody.playerJump.jumpEnabled = true;
        
        if (Input.keyPress(playerBody.controls.jump)) { 
            this.platformIgnoreTime.reset();
            
            if (playerBody.onPlatform()) {
                playerBody.playerJump.jumpEnabled = false;
            }

            if (playerBody.dynamicObject.grounded && playerBody.idleCollision()) {
                playerBody.dynamicObject.velocity.x = 7 * playerBody.dynamicObject.getDirectionMultiplier();
                playerBody.playerJump.jumpEnabled = false;
            }
        }

        playerBody.dynamicObject.ignorePlatforms = !this.platformIgnoreTime.isReady();
        this.platformIgnoreTime.update(deltaTime);
    }

    public stateChange(playerBody: PlayerBody): PlayerState {
        if (Input.keyDown(playerBody.controls.down) || playerBody.idleCollision()) {
            if (this.crouch && (!playerBody.dynamicObject.grounded || Math.abs(playerBody.dynamicObject.velocity.x) < 3 || playerBody.idleCollision())) {
                return PlayerState.Crouch;
            }
            return PlayerState.Slide;
        }
        if (playerBody.dynamicObject.grounded) {
            return PlayerState.Standing;
        }
        return PlayerState.Flying;
    }

    public stateExited(playerBody: PlayerBody): void {
        playerBody.dynamicObject.pos.y -= playerBody.idleHeight - playerBody.dynamicObject.height;
        playerBody.dynamicObject.height = playerBody.idleHeight;
        
        playerBody.dynamicObject.ignorePlatforms = false;
        playerBody.dynamicObject.friction = playerBody.standardFriction;

        playerBody.playerJump.jumpEnabled = true;
        playerBody.playerMove.moveEnabled = true;

    }
}