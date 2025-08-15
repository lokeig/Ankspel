import { images } from "../../../Common/images";
import { SpriteSheet } from "../../../Common/Sprite/sprite";
import { StateMachine } from "../../../Common/stateMachine";
import { PlayerState } from "../../../Common/Types/playerState";
import { Controls } from "../../../Common/Types/controls";
import { Vector } from "../../../Common/Types/vector";
import { PlayerBody } from "./Body/playerBody";

import { PlayerFlap } from "./PlayerStates/playerFlap";
import { PlayerJump } from "./PlayerStates/playerJump";
import { PlayerRagdoll } from "./PlayerStates/playerRagdoll";
import { PlayerSlide } from "./PlayerStates/playerSlide";
import { PlayerStanding } from "./PlayerStates/playerStanding";

export class Player {
 
    public playerBody: PlayerBody;
    private stateMachine: StateMachine<PlayerState, PlayerBody>;

    constructor(pos: Vector, controls: Controls) {    
        const sprite = new SpriteSheet(images.playerImage, 32, 32);
        this.playerBody = new PlayerBody(pos, sprite, controls);  
        this.stateMachine = new StateMachine(PlayerState.Standing);

        this.stateMachine.addState(PlayerState.Standing, new PlayerStanding());
        this.stateMachine.addState(PlayerState.Jump, new PlayerJump());
        this.stateMachine.addState(PlayerState.Flap, new PlayerFlap());
        const isCrouch = true;
        this.stateMachine.addState(PlayerState.Slide, new PlayerSlide(!isCrouch));
        this.stateMachine.addState(PlayerState.Crouch, new PlayerSlide(isCrouch));
        this.stateMachine.addState(PlayerState.Ragdoll, new PlayerRagdoll());
    }

    update(deltaTime: number): void {
        this.stateMachine.update(deltaTime, this.playerBody);
    };

    draw() {
        this.playerBody.draw();
    }
}