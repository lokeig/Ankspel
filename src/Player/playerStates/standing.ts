import { Input } from "../../input";
import { PlayerState } from "../../types"
import { StateInterface } from "../../stateMachine";
import { PlayerObject } from "../playerObject";

export class PlayerStanding extends StateInterface<PlayerState, PlayerObject> {
    public stateEntered(playerObject: PlayerObject): void {
        playerObject.allowMove = true;
    }

    public stateChange(playerObject: PlayerObject): PlayerState {

        if (Input.isKeyPressed(playerObject.controls.down)) {
            if (Math.abs(playerObject.velocity.x) < 3) {
                return PlayerState.Crouch;
            } else {
                return PlayerState.Slide
            }
        }

        if (!playerObject.grounded) {
            return PlayerState.Flying;
        }

        return PlayerState.Standing;
    }
}