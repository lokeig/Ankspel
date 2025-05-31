import { Input } from "../../../Common/input";
import { StateInterface } from "../../../Common/stateMachine";
import { PlayerState } from "../../../Common/types";
import { PlayerObject } from "../PlayerObject/playerObject";


export class PlayerFlying extends StateInterface<PlayerState, PlayerObject> {

    public stateChange(playerObject: PlayerObject): PlayerState {

        if (Input.keyDown(playerObject.controls.down)) {
            return PlayerState.Crouch;
        }

        if (Input.keyPress(playerObject.controls.jump) && !playerObject.jumpReady()) {
            return PlayerState.Flap
        }

        if (playerObject.grounded) {
            return PlayerState.Standing;
        }

        return PlayerState.Flying;
    }
}