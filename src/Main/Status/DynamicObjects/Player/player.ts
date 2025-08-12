import { images } from "../../../images";
import { SpriteSheet } from "../../Common/sprite";
import { StateMachine } from "../../Common/stateMachine";
import { PlayerState, Vector, Controls } from "../../Common/types";
import { PlayerBody } from "./playerBody";

import { PlayerFlap } from "./PlayerState/flap";
import { PlayerJump } from "./PlayerState/jump";
import { PlayerRagdoll } from "./PlayerState/ragdoll";
import { PlayerSlide } from "./PlayerState/slide";
import { PlayerStanding } from "./PlayerState/standing";

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
        this.stateMachine.addState(PlayerState.Slide, new PlayerSlide());
        this.stateMachine.addState(PlayerState.Crouch, new PlayerSlide(true));
        this.stateMachine.addState(PlayerState.Ragdoll, new PlayerRagdoll());
    }

    update(deltaTime: number): void {
        this.stateMachine.update(deltaTime, this.playerBody);
        this.playerBody.update(deltaTime);
    };

    draw() {
        this.playerBody.draw();
    }
}