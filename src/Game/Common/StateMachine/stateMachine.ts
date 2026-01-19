import { IState } from "./IState";

class StateMachine<T, S extends IState<T> = IState<T>>  {

    private currentState: T;
    private states: Map<T, S> = new Map();

    constructor(initialState: T) {
        this.currentState = initialState;
    }

    private getIState(): S {
        return this.states.get(this.currentState)!;
    }

    public getInstance(state: T): S {
        return this.states.get(state)!;
    }

    public addState(key: T, value: S) {
        this.states.set(key, value);
    }

    public getCurrentState(): T {
        return this.currentState;
    }

    public forceState(state: T): void {
        this.changeState(state);
    }

    private changeState(newState: T): void {
        this.getIState().stateExited();
        const prevstate = this.currentState;
        this.currentState = newState;
        this.getIState().stateEntered(prevstate);
    }

    public enterState(from?: T): void {
        this.getIState().stateEntered(from);
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