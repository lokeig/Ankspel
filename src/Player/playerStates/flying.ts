import { Input } from "../../input";
import { PlayerState } from "../../types"
import { StateInterface } from "../../stateMachine";
import { PlayerObject } from "../playerObject";

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