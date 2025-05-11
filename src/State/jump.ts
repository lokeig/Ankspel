import { Input } from "../input";
import { PlayerState, State } from "./playerState";

export class PlayerStateJump extends PlayerState {
    public stateEntered(): void {
        this.stateMachine.allowMove = true;
    }

    public stateChange(): State {
        if (Input.isKeyPressed(this.stateMachine.controls.down)) return State.Crouch;

        if (this.stateMachine.jumpJustPressed && !this.stateMachine.isJumping) return State.Flap;

        if (this.stateMachine.grounded) return State.Idle;
        
        return State.None;
    }
}