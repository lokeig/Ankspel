import { Input } from "../input";
import { Cooldown } from "./cooldown";
import { PlayerState, State } from "./playerState";

const crouchHeight = 20;

export class PlayerStateCrouch extends PlayerState {

    private prevFriction: number = this.stateMachine.friction;

    platformIgnoreTime = new Cooldown(0.15);

    public stateEntered(): void {
        this.platformIgnoreTime.setToReady();

        this.stateMachine.allowMove = false;
        this.stateMachine.friction *= 0.5;
        this.stateMachine.height = crouchHeight;
        this.stateMachine.pos.y += this.stateMachine.idleHeight - this.stateMachine.height;
    }

    public stateUpdate(deltaTime: number): void {
        this.platformIgnoreTime.update(deltaTime);
        
        this.stateMachine.jumpEnabled = true;
        if (this.stateMachine.jumpJustPressed) { 

            this.platformIgnoreTime.reset();

            if (this.stateMachine.blockAboveIdle()) {
                const directionMultiplier = this.stateMachine.direction === "right" ? 1 : -1
                this.stateMachine.velocity.x += 5 * directionMultiplier;
                this.stateMachine.jumpEnabled = false;
            }

            if (this.stateMachine.onPlatform) {
                this.stateMachine.jumpEnabled = false;
            }
        }
        this.stateMachine.ignorePlatforms = !this.platformIgnoreTime.isReady();
   
    }

    public stateChange(): State {
        if (Input.isKeyPressed(this.stateMachine.controls.down) || this.stateMachine.blockAboveIdle()) return State.None 
        if (this.stateMachine.grounded) return State.Idle
        return State.Jump;
    }
    public stateExited(): void {
        this.stateMachine.friction = this.prevFriction;
        this.stateMachine.pos.y -= this.stateMachine.idleHeight - this.stateMachine.height;
        this.stateMachine.height = this.stateMachine.idleHeight;
        this.stateMachine.ignorePlatforms = false;
    }
}