import { Controls, StateMachine, Vector } from "@common";
import { PlayerCharacter } from "./Character/playerCharacter";
import { PlayerState, PlayerStandard, PlayerFlap, PlayerSlide, PlayerRagdoll } from "./PlayerStates";
import { IPlayerState } from "./IPlayerState";

class Player {
    public character!: PlayerCharacter;
    private stateMachine: StateMachine<PlayerState, IPlayerState>;
    private local: boolean;

    constructor(local: boolean) {
        this.local = local;
        this.stateMachine = new StateMachine<PlayerState, IPlayerState>(PlayerState.Standard);
        this.setCharacter({ x: 0, y: 0 });
    }

    private setCharacter(pos: Vector): void {
        this.character = new PlayerCharacter({ ...pos });
        this.setupStateMachine();
    }

    public setControls(controls: Controls) {
        this.character.setControls(controls);
    }

    private setupStateMachine(): void {
        this.stateMachine.addState(PlayerState.Standard, new PlayerStandard(this.character));
        this.stateMachine.addState(PlayerState.Flap, new PlayerFlap(this.character));
        const crouch = true;
        this.stateMachine.addState(PlayerState.Crouch, new PlayerSlide(this.character, crouch));
        this.stateMachine.addState(PlayerState.Slide, new PlayerSlide(this.character, !crouch));
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
        if (this.local) {
            this.stateMachine.update(deltaTime);
        } else {
            this.stateMachine.getIState().offlineUpdate(deltaTime);
        }
    };

    public draw(): void {
        this.stateMachine.getIState().draw();
    }
}

export { Player };