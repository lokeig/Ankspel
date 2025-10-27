import { StateInterface } from "./stateInterface";

class StateMachine<T>  {

    private currentState: T;
    private states: Map<T, StateInterface<T>> = new Map();

    constructor(initialState: T) {
        this.currentState = initialState;
    }

    public getStateInterface(): StateInterface<T> {
        return this.states.get(this.currentState)!
    }

    public addState(key: T, value: StateInterface<T>) {
        this.states.set(key, value);
    }

    public getState(): T {
        return this.currentState;
    }

    public forceState(state: T): void {
        this.changeState(state);
    }

    private changeState(newState: T): void {
        this.getStateInterface().stateExited();
        this.currentState = newState;
        this.getStateInterface().stateEntered();
    }

    public enterState(): void {
        this.getStateInterface().stateEntered();
    }

    public update(deltaTime: number): void {
        const state = this.getStateInterface();
        state.stateUpdate(deltaTime);
        
        const nextState = state.stateChange();
        if (nextState !== this.currentState) {
            this.changeState(nextState);
        }
    }

    public draw(): void {
        this.getStateInterface().stateDraw()
    }
}

export { StateMachine };