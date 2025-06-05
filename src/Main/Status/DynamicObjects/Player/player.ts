import { images } from "../../../images";
import { SpriteSheet } from "../../Common/sprite";
import { StateMachine } from "../../Common/stateMachine";
import { PlayerState, Vector, Controls } from "../../Common/types";
import { PlayerBody } from "./playerBody";

import { PlayerFlap } from "./PlayerState/flap";
import { PlayerFlying } from "./PlayerState/flying";
import { PlayerSlide } from "./PlayerState/slide";
import { PlayerStanding } from "./PlayerState/standing";

export class Player {
 
    public playerBody: PlayerBody;
    private stateMachine: StateMachine<PlayerState, PlayerBody>;

    constructor(pos: Vector, controls: Controls) {    
        const sprite = new SpriteSheet(images.playerImage, 32);
        this.playerBody = new PlayerBody(pos, sprite, controls);  
        this.stateMachine = new StateMachine(PlayerState.Standing);

        this.stateMachine.addState(PlayerState.Standing, new PlayerStanding());
        this.stateMachine.addState(PlayerState.Flying, new PlayerFlying());
        this.stateMachine.addState(PlayerState.Flap, new PlayerFlap());
        this.stateMachine.addState(PlayerState.Slide, new PlayerSlide());
        this.stateMachine.addState(PlayerState.Crouch, new PlayerSlide(true));
    }

    update(deltaTime: number): void {
        this.stateMachine.update(deltaTime, this.playerBody);
        this.playerBody.update(deltaTime);
        this.playerBody.setAnimation(this.stateMachine.getState());
    };
}