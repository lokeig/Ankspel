import { Cooldown } from "../../../Common/cooldown";
import { Input } from "../../../Common/input";
import { StateInterface } from "../../../Common/stateMachine";
import { PlayerState } from "../../../Common/types";
import { PlayerObject } from "../PlayerObject/playerObject";


export class PlayerSlide extends StateInterface<PlayerState, PlayerObject> {

    private platformIgnoreTime = new Cooldown(0.15);
    private newHeight: number;
    private crouch: boolean;

    constructor(crouch: boolean = false) {
        super();
        this.crouch = crouch;

        this.newHeight = 20;
    }
    public stateEntered(playerObject: PlayerObject): void {
        this.platformIgnoreTime.setToReady();

        playerObject.friction = playerObject.slideFriction;
        playerObject.moveEnabled = false;
        playerObject.height = this.newHeight;
        playerObject.pos.y += playerObject.idleHeight - playerObject.height;
    }

    public stateUpdate(deltaTime: number, playerObject: PlayerObject): void {    

        playerObject.jumpEnabled = true;
        
        if (Input.keyPress(playerObject.controls.jump)) { 
            this.platformIgnoreTime.reset();
            
            if (playerObject.onPlatform()) {
                playerObject.jumpEnabled = false;
            }

            if (playerObject.grounded && playerObject.idleCollision()) {
                playerObject.velocity.x = 7 * playerObject.getDirectionMultiplier();
                playerObject.jumpEnabled = false;
            }
        }

        playerObject.ignorePlatforms = !this.platformIgnoreTime.isReady();
        this.platformIgnoreTime.update(deltaTime);
    }

    public stateChange(playerObject: PlayerObject): PlayerState {
        if (Input.keyDown(playerObject.controls.down) || playerObject.idleCollision()) {
            if (this.crouch && (!playerObject.grounded || Math.abs(playerObject.velocity.x) < 3 || playerObject.idleCollision())) {
                return PlayerState.Crouch;
            }
            return PlayerState.Slide;
        }
        if (playerObject.grounded) {
            return PlayerState.Standing;
        }
        return PlayerState.Flying;
    }

    public stateExited(playerObject: PlayerObject): void {
        playerObject.pos.y -= playerObject.idleHeight - playerObject.height;
        playerObject.height = playerObject.idleHeight;
        
        playerObject.ignorePlatforms = false;

        playerObject.jumpEnabled = true;
        playerObject.moveEnabled = true;

        playerObject.friction = playerObject.standardFriction;
    }
}