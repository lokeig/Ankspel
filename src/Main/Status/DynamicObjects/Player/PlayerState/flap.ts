import { Input } from "../../../Common/input";
import { StateInterface } from "../../../Common/stateMachine";
import { PlayerState } from "../../../Common/types";
import { PlayerBody } from "../playerBody";

export class PlayerFlap extends StateInterface<PlayerState, PlayerBody>{

    private flapSpeed: number = 1.5;

    public stateUpdate(deltaTime: number, playerBody: PlayerBody): void {
        playerBody.dynamicObject.velocity.y = Math.min(playerBody.dynamicObject.velocity.y, this.flapSpeed);
    }

    public stateChange(playerBody: PlayerBody): PlayerState {

        if (Input.keyDown(playerBody.controls.down)) {
            return PlayerState.Crouch;
        }

        if (playerBody.dynamicObject.grounded) {
            return PlayerState.Standing;
        }

        if (Input.keyDown(playerBody.controls.jump)) {
            return PlayerState.Flap
        }

        return PlayerState.Flying;
    }
}