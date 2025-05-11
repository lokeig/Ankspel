import { Input } from "../input";
import { PlayerState, State } from "./playerState";

export class PlayerStateIdle extends PlayerState {
    public stateEntered(): void {
        this.stateMachine.allowMove = true;
    }

    public stateChange(): State {
        if (Input.isKeyPressed(this.stateMachine.controls.down)) return State.Crouch

        if (!this.stateMachine.grounded) return State.Jump

        const left = Input.isKeyPressed(this.stateMachine.controls.left);
        const right = Input.isKeyPressed(this.stateMachine.controls.right);

        if ((right || left) && !(left && right)) { 
            return State.Move
        }

        return State.None;
    }
}