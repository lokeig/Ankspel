import { Input } from "../../../Common/input";
import { StateInterface } from "../../../Common/stateMachine";
import { PlayerState } from "../../../Common/types";
import { PlayerBody } from "../playerBody";

export class PlayerFlap extends StateInterface<PlayerState, PlayerBody>{

    private flapSpeed: number = 1.5;

    private setArmOffset(object: PlayerBody): void {
        const armOffset = { 
            x: 10,
            y: 28
        };
        object.setArmOffset(object.armFront, armOffset);
    }

    public stateUpdate(deltaTime: number, playerBody: PlayerBody): void {
        playerBody.dynamicObject.velocity.y = Math.min(playerBody.dynamicObject.velocity.y, this.flapSpeed);
        playerBody.setAnimation(playerBody.animations.flap);
        
        if (playerBody.playerMove.willTurn(playerBody.dynamicObject, playerBody.controls)) {
            playerBody.armFront.angle = Math.PI / 2;
        }
        if (playerBody.playerItem.holding) {
            playerBody.armFront.rotateArmUp(deltaTime);
        } else {
            playerBody.armFront.angle = 0;
        }

        this.setArmOffset(playerBody);
    }

    public stateChange(playerBody: PlayerBody): PlayerState {

        if (Input.keyDown(playerBody.controls.down)) {
            return PlayerState.Crouch;
        }

        if (playerBody.dynamicObject.grounded) {
            return PlayerState.Standing;
        }

        if (Input.keyDown(playerBody.controls.jump)) {
            return PlayerState.Flap
        }

        return PlayerState.Jump;
    }
}