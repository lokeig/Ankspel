import { StateMachine, Controls, Vector, SpriteSheet, images } from "@common";
import { PlayerDataMessage, GameServer } from "@server";
import { PlayerBody } from "./Body/playerBody";
import { PlayerState, PlayerStandard, PlayerFlap, PlayerSlide, PlayerRagdoll } from "./PlayerStates";

class Player {

    public playerBody: PlayerBody;
    private stateMachine: StateMachine<PlayerState>;
    private local: boolean;
    private controls: Controls = {
        jump: " ",
        left: "a",
        right: "d",
        down: "s",
        up: "w",

        shoot: "ArrowLeft",
        pickup: "ArrowUp",
        ragdoll: "e",
        strafe: "l",
        menu: "esc"
    }
    constructor(pos: Vector, local: boolean) {

        const sprite = new SpriteSheet(images.playerImage, 32, 32);
        this.playerBody = new PlayerBody(pos, sprite, this.controls);
        this.local = local;

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
        if (!this.local) {
            return;
        }
        this.stateMachine.update(deltaTime);
       // this.sendPlayerInfo();
        
    };

    private sendPlayerInfo() {
        const msg: PlayerDataMessage = {
            type: "playerData",
            xPos: this.playerBody.dynamicObject.pos.x,
            yPos: this.playerBody.dynamicObject.pos.y,
            state: this.stateMachine.getState()
        };
        GameServer.get().sendMessage(msg);
    }

    public draw() {
        this.stateMachine.draw();
    }
}

export { Player };