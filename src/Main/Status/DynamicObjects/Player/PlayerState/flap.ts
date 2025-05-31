import { Input } from "../../../Common/input";
import { StateInterface } from "../../../Common/stateMachine";
import { PlayerState } from "../../../Common/types";
import { PlayerObject } from "../PlayerObject/playerObject";


export class PlayerFlap extends StateInterface<PlayerState, PlayerObject>{

    private flapSpeed: number = 1.5;

    public stateUpdate(deltaTime: number, playerObject: PlayerObject): void {
        playerObject.velocity.y = Math.min(playerObject.velocity.y, this.flapSpeed);
    }

    public stateChange(playerObject: PlayerObject): PlayerState {

        if (Input.keyDown(playerObject.controls.down)) {
            return PlayerState.Crouch;
        }

        if (playerObject.grounded) {
            return PlayerState.Standing;
        }

        if (Input.keyDown(playerObject.controls.jump)) {
            return PlayerState.Flap
        }

        return PlayerState.Flying;
    }
}