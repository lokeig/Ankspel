import { Input } from "../../../Common/input";
import { StateInterface } from "../../../Common/stateMachine";
import { PlayerState } from "../../../Common/types";
import { PlayerObject } from "../PlayerObject/playerObject";


export class PlayerStanding extends StateInterface<PlayerState, PlayerObject> {

    public stateChange(playerObject: PlayerObject): PlayerState {

        if (Input.keyDown(playerObject.controls.down)) {
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