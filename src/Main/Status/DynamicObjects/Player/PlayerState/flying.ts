import { Input } from "../../../Common/input";
import { StateInterface } from "../../../Common/stateMachine";
import { PlayerState } from "../../../Common/types";
import { PlayerBody } from "../playerBody";

export class PlayerFlying extends StateInterface<PlayerState, PlayerBody> {

    public stateChange(playerBody: PlayerBody): PlayerState {

        if (Input.keyDown(playerBody.controls.down)) {
            return PlayerState.Crouch;
        }

        if (Input.keyPress(playerBody.controls.jump)) {
            return PlayerState.Flap
        }

        if (playerBody.dynamicObject.grounded) {
            return PlayerState.Standing;
        }

        return PlayerState.Flying;
    }
}