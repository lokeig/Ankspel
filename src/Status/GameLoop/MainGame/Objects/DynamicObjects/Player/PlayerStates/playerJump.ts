import { Input } from "../../../../Common/input";
import { StateInterface } from "../../../../Common/stateMachine";
import { PlayerState } from "../../../../Common/Types/playerState";
import { PlayerBody } from "../Body/playerBody";


export class PlayerJump extends StateInterface<PlayerState, PlayerBody> {

    public stateEntered(playerBody: PlayerBody): void {
        const armOffset = { x: 10, y: 28 };
        playerBody.setArmOffset(armOffset);
    }

    public stateUpdate(deltaTime: number, playerBody: PlayerBody): void {
        if (playerBody.dynamicObject.velocity.y < 0) {
            playerBody.setAnimation(playerBody.animations.jump);
        } else {
            playerBody.setAnimation(playerBody.animations.fall);
        }
        playerBody.rotateArm(deltaTime);
        playerBody.update(deltaTime);
    }
    
    public stateChange(playerBody: PlayerBody): PlayerState {

        if (Input.keyDown(playerBody.controls.down)) {
            return PlayerState.Crouch;
        }

        if (Input.keyPress(playerBody.controls.jump) && !playerBody.playerJump.jumpReady()) {
            return PlayerState.Flap
        }

        if (playerBody.dynamicObject.grounded) {
            return PlayerState.Standing;
        }

        return PlayerState.Jump;
    }
}