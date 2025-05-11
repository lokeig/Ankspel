import { PlayerStateMachine } from "./playerStateMachine";

export abstract class PlayerState {
    stateMachine: PlayerStateMachine;

    constructor(stateMachine: PlayerStateMachine) {
        this.stateMachine = stateMachine;
    }
  
    public stateUpdate(deltaTime: number): void { }
    public stateChange(): State { return State.None; }
    public stateEntered(): void { }
    public stateExited(): void { }
}

export enum State {
    None,
    Idle,
    Move,
    Jump,
    Flap,
    Crouch,
    Slide
}

