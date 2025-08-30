import { Input } from "../../../../Common/input";
import { StateInterface } from "../../../../Common/StateMachine/stateInterface";
import { PlayerState } from "./playerState";
import { PlayerBody } from "../Body/playerBody";

export class PlayerStanding implements StateInterface<PlayerState> {

    private playerBody: PlayerBody;

    constructor(playerBody: PlayerBody) {
        this.playerBody = playerBody;
    }

    public stateEntered(): void {
        const armOffset = { x: 10, y: 28 };
        this.playerBody.setArmOffset(armOffset);    
    }

    public stateUpdate(deltaTime: number): void {
        const left = Input.keyDown(this.playerBody.controls.left);
        const right = Input.keyDown(this.playerBody.controls.right);

        if ((left && this.playerBody.dynamicObject.velocity.x > 0.3) || right && this.playerBody.dynamicObject.velocity.x < -0.3) {
            this.playerBody.setAnimation(this.playerBody.animations.turn);
        } else if (Math.abs(this.playerBody.dynamicObject.velocity.x) > 0.3) {
            this.playerBody.setAnimation(this.playerBody.animations.walk);
        } else {
            this.playerBody.setAnimation(this.playerBody.animations.idle);
        };

        this.playerBody.rotateArm(deltaTime);
        this.playerBody.update(deltaTime);
    }

    public stateChange(): PlayerState {

        if (Input.keyPress(this.playerBody.controls.ragdoll)) {
            return PlayerState.Ragdoll;
        }
        
        if (Input.keyDown(this.playerBody.controls.down)) {
            if (Math.abs(this.playerBody.dynamicObject.velocity.x) < 3) {
                return PlayerState.Crouch;
            } else {
                return PlayerState.Slide
            }
        }

        if (!this.playerBody.dynamicObject.grounded) {
            return PlayerState.Jump;
        }

        return PlayerState.Standing;
    }

    public stateExited(): void {
        
    }

    public stateDraw(): void {
        this.playerBody.draw();
    }
}

