import { Controls, StateMachine, Vector } from "@common";
import { PlayerCharacter } from "./Character/playerCharacter";
import { PlayerState, PlayerStandard, PlayerFlap, PlayerSlide, PlayerRagdoll } from "./PlayerStates";

class Player {
    public character!: PlayerCharacter;
    private stateMachine: StateMachine<PlayerState>;
    private local: boolean;

    constructor(local: boolean) {
        this.local = local;
        this.stateMachine = new StateMachine(PlayerState.Standard);
    }

    public setCharacter(pos: Vector): void {
        this.character = new PlayerCharacter({ ...pos });
        this.setupStateMachine();
    }

    public setControls(controls: Controls) {
        this.character.setControls(controls);
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
        if (this.local) {
            this.localUpdate(deltaTime);
        } else {
            this.onlineUpdate(deltaTime);
        }
    };

    private onlineUpdate(deltaTime: number): void {
        this.character.body.update(deltaTime);
    }

    private localUpdate(deltaTime: number): void {
        this.stateMachine.update(deltaTime);
    }

    public isLocal(): boolean {
        return this.isLocal();
    }

    public draw(): void {
        this.stateMachine.draw();
    }
}

export { Player };