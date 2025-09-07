import { images } from "../../../Common/images";
import { SpriteSheet } from "../../../Common/Sprite/sprite";
import { StateMachine } from "../../../Common/StateMachine/stateMachine";
import { PlayerState } from "./PlayerStates/playerState";
import { Controls } from "../../../Common/Types/controls";
import { Vector } from "../../../Common/Types/vector";
import { PlayerBody } from "./Body/playerBody";

import { PlayerFlap } from "./PlayerStates/playerFlap";
import { PlayerRagdoll } from "./PlayerStates/playerRagdoll";
import { PlayerSlide } from "./PlayerStates/playerSlide";
import { PlayerStandard } from "./PlayerStates/playerStandard";
import { GameServer } from "../../../../Server/Common/server";
import { PlayerDataMessage } from "../../../../Server/Common/MessageTypes/messageType";

export class Player {

    public readonly id: string;
    public playerBody: PlayerBody;
    private stateMachine: StateMachine<PlayerState>;

    constructor(pos: Vector, controls: Controls, id: string) {
        this.id = id;
        const sprite = new SpriteSheet(images.playerImage, 32, 32);

        this.playerBody = new PlayerBody(pos, sprite, controls);

        this.stateMachine = new StateMachine(PlayerState.Standard);

        this.stateMachine.addState(PlayerState.Standard, new PlayerStandard(this.playerBody));
        this.stateMachine.addState(PlayerState.Flap, new PlayerFlap(this.playerBody));
        const isCrouch = true;
        this.stateMachine.addState(PlayerState.Slide, new PlayerSlide(this.playerBody, !isCrouch));
        this.stateMachine.addState(PlayerState.Crouch, new PlayerSlide(this.playerBody, isCrouch));
        this.stateMachine.addState(PlayerState.Ragdoll, new PlayerRagdoll(this.playerBody));
        this.stateMachine.enterState();
    }

    public update(deltaTime: number): void {
        this.stateMachine.update(deltaTime);
        if (GameServer.get().getID() === this.id) {
            this.sendPlayerInfo();
        }
    };

    public sendPlayerInfo() {
        const msg: PlayerDataMessage = {
            type: "playerData",
            xPos: this.playerBody.dynamicObject.pos.x,
            yPos: this.playerBody.dynamicObject.pos.y,
            id: this.id,
            state: this.stateMachine.getState()
        };
        GameServer.get().sendMessage(msg);
    }

    public draw() {
        this.stateMachine.draw();
    }
}