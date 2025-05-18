import { Input } from "../../input";
import { PlayerState } from "../../types"
import { StateInterface } from "../../stateMachine";
import { PlayerObject } from "../playerObject";

export class PlayerFlap extends StateInterface<PlayerState, PlayerObject>{

    private flapSpeed: number = 2;

    public stateEntered(object: PlayerObject): void {
        object.allowMove = true;
    }

    public stateUpdate(deltaTime: number, playerObject: PlayerObject): void {
        if (playerObject.velocity.y > this.flapSpeed) {
            playerObject.ignoreGravity = true;
            playerObject.velocity.y = this.flapSpeed;
        }
    }

    public stateChange(playerObject: PlayerObject): PlayerState {

        if (Input.isKeyPressed(playerObject.controls.down)) {
            return PlayerState.Crouch;
        }

        if (playerObject.grounded) {
            return PlayerState.Standing;
        }

        if (Input.isKeyPressed(playerObject.controls.jump)) {
            return PlayerState.Flap
        }

        return PlayerState.Flying;
    }

    public stateExited(playerObject: PlayerObject): void {
        playerObject.ignoreGravity = false;
    }
}