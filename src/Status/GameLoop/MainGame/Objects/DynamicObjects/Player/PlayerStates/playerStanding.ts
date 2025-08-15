import { Input } from "../../../../Common/input";
import { StateInterface } from "../../../../Common/stateMachine";
import { PlayerState } from "../../../../Common/Types/playerState";
import { PlayerBody } from "../Body/playerBody";

export class PlayerStanding extends StateInterface<PlayerState, PlayerBody> {

    public stateEntered(playerBody: PlayerBody): void {
        const armOffset = { x: 10, y: 28 };
        playerBody.setArmOffset(armOffset);    
    }

    public stateUpdate(deltaTime: number, playerBody: PlayerBody): void {
        const left = Input.keyDown(playerBody.controls.left);
        const right = Input.keyDown(playerBody.controls.right);

        if ((left && playerBody.dynamicObject.velocity.x > 0.3) || right && playerBody.dynamicObject.velocity.x < -0.3) {
            playerBody.setAnimation(playerBody.animations.turn);
        } else if (Math.abs(playerBody.dynamicObject.velocity.x) > 0.3) {
            playerBody.setAnimation(playerBody.animations.walk);
        } else {
            playerBody.setAnimation(playerBody.animations.idle);
        };

        playerBody.rotateArm(deltaTime);
        playerBody.update(deltaTime);
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

