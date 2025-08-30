import { images } from "../../../Common/images";
import { SpriteSheet } from "../../../Common/Sprite/sprite";
import { StateMachine } from "../../../Common/StateMachine/stateMachine";
import { PlayerState } from "./PlayerStates/playerState";
import { Controls } from "../../../Common/Types/controls";
import { Vector } from "../../../Common/Types/vector";
import { PlayerBody } from "./Body/playerBody";

import { PlayerFlap } from "./PlayerStates/playerFlap";
import { PlayerInAir } from "./PlayerStates/playerInAir";
import { PlayerRagdoll } from "./PlayerStates/playerRagdoll";
import { PlayerSlide } from "./PlayerStates/playerSlide";
import { PlayerStanding } from "./PlayerStates/playerStanding";

export class Player {
 
    private id: string;
    public playerBody: PlayerBody;
    private stateMachine: StateMachine<PlayerState>;

    constructor(pos: Vector, controls: Controls, id: string) { 
        this.id = id;   
        const sprite = new SpriteSheet(images.playerImage, 32, 32);

        this.playerBody = new PlayerBody(pos, sprite, controls);  

        this.stateMachine = new StateMachine(PlayerState.Standing);

        this.stateMachine.addState(PlayerState.Standing, new PlayerStanding(this.playerBody));
        this.stateMachine.addState(PlayerState.Jump, new PlayerInAir(this.playerBody));
        this.stateMachine.addState(PlayerState.Flap, new PlayerFlap(this.playerBody));
        const isCrouch = true;
        this.stateMachine.addState(PlayerState.Slide, new PlayerSlide(this.playerBody, !isCrouch));
        this.stateMachine.addState(PlayerState.Crouch, new PlayerSlide(this.playerBody, isCrouch));
        this.stateMachine.addState(PlayerState.Ragdoll, new PlayerRagdoll(this.playerBody));
    }

    update(deltaTime: number): void {
        this.stateMachine.update(deltaTime);
    };

    draw() {
        this.stateMachine.draw();
    }
}