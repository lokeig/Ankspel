import { Input } from "../../../Common/input";
import { StateInterface } from "../../../Common/stateMachine";
import { PlayerState } from "../../../Common/types";
import { PlayerBody } from "../playerBody";
import { PlayerMove } from "../playerMove";

export class PlayerFlying extends StateInterface<PlayerState, PlayerBody> {

    private setArmOffset(object: PlayerBody): void {
        const pixelFactor = object.getPixelFactor();
        const armOffset = { 
            x: 5  * pixelFactor.x,
            y: 14 * pixelFactor.y
        };
        object.setArmOffset(object.armFront, armOffset);
    }

    public stateUpdate(deltaTime: number, object: PlayerBody): void {
        if (object.dynamicObject.velocity.y < 0) {
            object.setAnimation(object.animations.jump);
        } else {
            object.setAnimation(object.animations.fall);
        }
        this.setArmOffset(object);
        object.rotateArm(deltaTime);
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

        return PlayerState.Flying;
    }
}