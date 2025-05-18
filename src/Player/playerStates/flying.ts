import { Input } from "../../input";
import { PlayerState } from "../../types"
import { StateInterface } from "../../stateMachine";
import { PlayerObject } from "../playerObject";

export class PlayerFlying extends StateInterface<PlayerState, PlayerObject> {
    public stateEntered(playerObject: PlayerObject): void {
        playerObject.allowMove = true;
    }

    public stateChange(playerObject: PlayerObject): PlayerState {

        if (Input.isKeyPressed(playerObject.controls.down)) {
            return PlayerState.Crouch;
        }

        if (playerObject.jumpJustPressed && !playerObject.isJumping) {
            return PlayerState.Flap
        }

        if (playerObject.grounded) {
            return PlayerState.Standing;
        }

        return PlayerState.Flying;
    }
}