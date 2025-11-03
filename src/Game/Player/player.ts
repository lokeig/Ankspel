import { StateMachine, Controls, Vector, SpriteSheet, images } from "@common";
import { PlayerCharacter } from "./Character/playerCharacter";
import { PlayerState, PlayerStandard, PlayerFlap, PlayerSlide, PlayerRagdoll } from "./PlayerStates";

class Player {
    public character!: PlayerCharacter;
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

    constructor(local: boolean) {
        this.local = local;
        this.stateMachine = new StateMachine(PlayerState.Standard);
        if (!local) {
            
        }
    }

    public setCharacter(pos: Vector): void {
        const sprite = new SpriteSheet(images.playerImage, 32, 32);
        this.character = new PlayerCharacter({ ...pos }, this.controls);
        this.setupStateMachine();
    }

    private setupStateMachine(): void {
        this.stateMachine.addState(PlayerState.Standard, new PlayerStandard(this.character));
        this.stateMachine.addState(PlayerState.Flap, new PlayerFlap(this.character));
        const isCrouch = true;
        this.stateMachine.addState(PlayerState.Slide, new PlayerSlide(this.character, !isCrouch));
        this.stateMachine.addState(PlayerState.Crouch, new PlayerSlide(this.character, isCrouch));
        this.stateMachine.addState(PlayerState.Ragdoll, new PlayerRagdoll(this.character));
        this.stateMachine.enterState();
    }

    public setState(state: PlayerState): void {
        this.stateMachine.forceState(state);
    }

    public getState(): PlayerState {
        return this.stateMachine.getState();
    }

    public update(deltaTime: number): void {
        if (!this.local) {
            return;
        }
        this.stateMachine.update(deltaTime);
    };

    public draw(): void {
        this.stateMachine.draw();
    }
}

export { Player };