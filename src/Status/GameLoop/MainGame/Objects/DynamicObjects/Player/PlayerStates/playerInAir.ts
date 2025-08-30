import { Input } from "../../../../Common/input";
import { StateInterface } from "../../../../Common/StateMachine/stateInterface";
import { PlayerState } from "./playerState";
import { PlayerBody } from "../Body/playerBody";


export class PlayerInAir implements StateInterface<PlayerState> {

    private playerBody: PlayerBody;

    constructor(playerBody: PlayerBody) {
        this.playerBody = playerBody;
    }
    public stateEntered(): void {
        const armOffset = { x: 10, y: 28 };
        this.playerBody.setArmOffset(armOffset);
    }

    public stateUpdate(deltaTime: number): void {
        if (this.playerBody.dynamicObject.velocity.y < 0) {
            this.playerBody.setAnimation(this.playerBody.animations.jump);
        } else {
            this.playerBody.setAnimation(this.playerBody.animations.fall);
        }
        this.playerBody.rotateArm(deltaTime);
        this.playerBody.update(deltaTime);
    }
    
    public stateChange(): PlayerState {
        if (Input.keyPress(this.playerBody.controls.ragdoll)) {
            return PlayerState.Ragdoll;
        }

        if (Input.keyDown(this.playerBody.controls.down)) {
            return PlayerState.Crouch;
        }

        if (Input.keyPress(this.playerBody.controls.jump) && !this.playerBody.playerJump.isJumping) {
            return PlayerState.Flap
        }

        if (this.playerBody.dynamicObject.grounded) {
            return PlayerState.Standing;
        }

        return PlayerState.Jump;
    }

    public stateExited(): void {
        
    }
    
    public stateDraw(): void {
        this.playerBody.draw();
    }
}