import { IState } from "./IState";

class StateMachine<T, S extends IState<T> = IState<T>>  {

    private currentState: T;
    private states: Map<T, S> = new Map();

    constructor(initialState: T) {
        this.currentState = initialState;
    }

    public getIState(): S {
        return this.states.get(this.currentState)!
    }

    public addState(key: T, value: S) {
        this.states.set(key, value);
    }

    public getState(): T {
        return this.currentState;
    }

    public forceState(state: T): void {
        this.changeState(state);
    }

    private changeState(newState: T): void {
        this.getIState().stateExited();
        this.currentState = newState;
        this.getIState().stateEntered();
    }

    public enterState(): void {
        this.getIState().stateEntered();
    }

    public update(deltaTime: number, noStateChange: boolean = false): void {
        const state = this.getIState();
        state.stateUpdate(deltaTime);
        
        if (noStateChange) {
            return;
        }
        
        const nextState = state.stateChange();
        if (nextState !== this.currentState) {
            this.changeState(nextState);
        }
    }

    public draw(): void {
        this.getIState().draw();
    }
}

export { StateMachine };