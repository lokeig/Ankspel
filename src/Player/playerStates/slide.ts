import { Input } from "../../input";
import { PlayerState } from "../../types"
import { StateInterface } from "../../stateMachine";
import { PlayerObject } from "../playerObject";
import { Cooldown } from "../../cooldown";

export class PlayerSlide extends StateInterface<PlayerState, PlayerObject> {

    private platformIgnoreTime = new Cooldown(0.15);
    private newHeight: number;
    private frictionIncrease: number;
    private crouch: boolean;

    constructor(crouch: boolean = false) {
        super();
        this.crouch = crouch;

        this.newHeight = 30;
        if (crouch) {
            this.newHeight = 15;
        }
        this.frictionIncrease = 1.2;
    }
    public stateEntered(playerObject: PlayerObject): void {
        this.platformIgnoreTime.setToReady();

        playerObject.allowMove = false;
        playerObject.height = this.newHeight;
        playerObject.pos.y += playerObject.idleHeight - playerObject.height;
    }

    public stateUpdate(deltaTime: number, playerObject: PlayerObject): void {    

        playerObject.jumpEnabled = false;

        if (playerObject.jumpJustPressed) { 
            this.platformIgnoreTime.reset();
            
            if (playerObject.grounded && playerObject.idleCollision()) {
                const directionMultiplier = playerObject.direction === "right" ? 1 : -1
                playerObject.velocity.x = 5 * directionMultiplier;
                playerObject.jumpEnabled = false;
            }

            if (playerObject.onPlatform()) {
                playerObject.jumpEnabled = false;
            }
        }

        playerObject.jumpEnabled = true;


        playerObject.ignorePlatforms = !this.platformIgnoreTime.isReady();
        this.platformIgnoreTime.update(deltaTime);
    }

    public stateChange(playerObject: PlayerObject): PlayerState {
        if (Input.isKeyPressed(playerObject.controls.down) || playerObject.idleCollision()) {
            return this.crouch ? PlayerState.Crouch : PlayerState.Slide; 
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
    }
}