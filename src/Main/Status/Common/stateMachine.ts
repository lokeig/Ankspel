export abstract class StateInterface<T, S> {
    stateUpdate(deltaTime: number, object: S): void { }
    stateEntered(object: S): void { }
    stateExited(object: S): void { }
    abstract stateChange(object: S): T;
}

export class StateMachine<T, S>  {

    private currentState: T;
    private states: Map<T, StateInterface<T, S>> = new Map();

    constructor(initialState: T) {
        this.currentState = initialState;
    }

    public addState(key: T, value: StateInterface<T, S>) {
        this.states.set(key, value);
    }

    public getState(): T {
        return this.currentState;
    }

    private changeState(newState: T, object: S): void {
        this.states.get(this.currentState)!.stateExited(object);
        this.currentState = newState;
        this.states.get(this.currentState)!.stateEntered(object);
    }

    public update(deltaTime: number, object: S): void {
        const state = this.states.get(this.currentState)!;
        state.stateUpdate(deltaTime, object);
        
        const nextState = state.stateChange(object);
        if (nextState !== this.currentState) {
            this.changeState(nextState, object);
        }
    }
}
