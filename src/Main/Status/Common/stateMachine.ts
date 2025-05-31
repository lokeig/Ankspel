export abstract class StateInterface<T, S> {
    stateUpdate(deltaTime: number, object: S): void { }
    stateEntered(object: S): void { }
    stateExited(object: S): void { }
    abstract stateChange(object: S): T;
}

export class StateMachine<T, S>  {

    private currentState: T;
    private states: Map<T, StateInterface<T, S>> = new Map();
    private object: S;

    constructor(initialState: T, object: S) {
        this.currentState = initialState;
        this.object = object;
    }

    public addState(key: T, value: StateInterface<T, S>) {
        this.states.set(key, value);
    }

    public getState(): T {
        return this.currentState;
    }

    private changeState(newState: T): void {
        this.states.get(this.currentState)!.stateExited(this.object);
        this.currentState = newState;
        this.states.get(this.currentState)!.stateEntered(this.object);
    }

    public update(deltaTime: number): void {
        const state = this.states.get(this.currentState)!;
        state.stateUpdate(deltaTime, this.object);
        
        const nextState = state.stateChange(this.object);
        if (nextState !== this.currentState) {
            this.changeState(nextState);
        }
    }
}
