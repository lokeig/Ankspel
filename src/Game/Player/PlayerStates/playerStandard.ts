import { StateInterface, Input } from "@common";
import { PlayerBody } from "../Body/playerBody";
import { PlayerState } from "./playerState";

class PlayerStandard implements StateInterface<PlayerState> {

    private playerBody: PlayerBody;

    constructor(playerBody: PlayerBody) {
        this.playerBody = playerBody;
    }

    public stateEntered(): void {
        const armOffset = { x: 10, y: 28 };
        this.playerBody.setArmOffset(armOffset);
    }

    public stateUpdate(deltaTime: number): void {
        this.setAnimation();    
        this.playerBody.rotateArm(deltaTime);
        this.playerBody.update(deltaTime);
    }

    private setAnimation() {

        if (!this.playerBody.dynamicObject.grounded) {

            if (this.playerBody.dynamicObject.velocity.y < 0) {
                this.playerBody.setAnimation(this.playerBody.animations.jump);
            } else {
                this.playerBody.setAnimation(this.playerBody.animations.fall);
            }
            return;
        }

        const left = Input.keyDown(this.playerBody.controls.left);
        const right = Input.keyDown(this.playerBody.controls.right);

        if ((left && this.playerBody.dynamicObject.velocity.x > 0.3) || right && this.playerBody.dynamicObject.velocity.x < -0.3) {
            this.playerBody.setAnimation(this.playerBody.animations.turn);
        } else if (Math.abs(this.playerBody.dynamicObject.velocity.x) > 0.3) {
            this.playerBody.setAnimation(this.playerBody.animations.walk);
        } else {
            this.playerBody.setAnimation(this.playerBody.animations.idle);
        };
    }

    public stateChange(): PlayerState {

        if (Input.keyPress(this.playerBody.controls.ragdoll)) {
            return PlayerState.Ragdoll;
        }

        if (Input.keyPress(this.playerBody.controls.jump) && !this.playerBody.dynamicObject.grounded && !this.playerBody.playerJump.isJumping) {
            return PlayerState.Flap;
        }

        if (Input.keyDown(this.playerBody.controls.down)) {
            if (Math.abs(this.playerBody.dynamicObject.velocity.x) < 3 || !this.playerBody.dynamicObject.grounded) {
                return PlayerState.Crouch;
            } else {
                return PlayerState.Slide
            }
        }

        return PlayerState.Standard;
    }

    public stateExited(): void {

    }

    public stateDraw(): void {
        this.playerBody.draw();
    }
}

export { PlayerStandard };