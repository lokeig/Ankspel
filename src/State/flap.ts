import { Input } from "../input";
import { PlayerState, State } from "./playerState";

export class PlayerStateFlap extends PlayerState{
    public stateEntered(): void {
        this.stateMachine.allowMove = true;
    }
    private flapSpeed: number = 2;
    public stateUpdate(deltaTime: number): void {
        
        if (this.stateMachine.velocity.y > this.flapSpeed) {
            this.stateMachine.ignoreGravity = true;
            this.stateMachine.velocity.y = this.flapSpeed;
        }
    }
    public stateChange(): State {
        if (Input.isKeyPressed(this.stateMachine.controls.down)) return State.Crouch

        if (this.stateMachine.grounded) return State.Idle;
        if (Input.isKeyPressed(this.stateMachine.controls.jump)) { return State.None }
        return State.Jump;
    }

    public stateExited(): void {
        this.stateMachine.ignoreGravity = false;
    }
}