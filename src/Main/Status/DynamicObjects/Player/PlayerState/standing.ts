import { Input } from "../../../Common/input";
import { StateInterface } from "../../../Common/stateMachine";
import { PlayerState } from "../../../Common/types";
import { PlayerBody } from "../playerBody";

export class PlayerStanding extends StateInterface<PlayerState, PlayerBody> {

    public stateChange(playerBody: PlayerBody): PlayerState {

        if (Input.keyDown(playerBody.controls.down)) {
            if (Math.abs(playerBody.dynamicObject.velocity.x) < 3) {
                return PlayerState.Crouch;
            } else {
                return PlayerState.Slide
            }
        }

        if (!playerBody.dynamicObject.grounded) {
            return PlayerState.Flying;
        }

        return PlayerState.Standing;
    }
}