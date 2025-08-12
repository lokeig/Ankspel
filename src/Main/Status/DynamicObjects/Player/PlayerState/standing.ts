import { Input } from "../../../Common/input";
import { StateInterface } from "../../../Common/stateMachine";
import { PlayerState } from "../../../Common/types";
import { PlayerBody } from "../playerBody";

export class PlayerStanding extends StateInterface<PlayerState, PlayerBody> {

    private setArmOffset(object: PlayerBody): void {
        const armOffset = { 
            x: 10,
            y: 28
        };
        object.setArmOffset(object.armFront, armOffset);
    }

    public stateUpdate(deltaTime: number, object: PlayerBody): void {
        const left = Input.keyDown(object.controls.left);
        const right = Input.keyDown(object.controls.right);

        if ((left && object.dynamicObject.velocity.x > 0.3) || right && object.dynamicObject.velocity.x < -0.3) {
            object.setAnimation(object.animations.turn);
        } else if (Math.abs(object.dynamicObject.velocity.x) > 0.3) {
            object.setAnimation(object.animations.walk);
        } else {
            object.setAnimation(object.animations.idle);
        };

        this.setArmOffset(object);
        object.rotateArm(deltaTime);

        if (Input.keyPress("e")) {
            object.dynamicObject.velocity.x += 150 * object.dynamicObject.getDirectionMultiplier();
        }
    }

    public stateChange(playerBody: PlayerBody): PlayerState {

        if (Input.keyDown(playerBody.controls.down)) {
            if (Math.abs(playerBody.dynamicObject.velocity.x) < 3) {
                return PlayerState.Crouch;
            } else {
                return PlayerState.Slide
            }
        }

        if (!playerBody.dynamicObject.grounded) {
            return PlayerState.Jump;
        }

        return PlayerState.Standing;
    }

}

