interface IState<T> {
    stateUpdate(deltaTime: number): void;
    stateEntered(from?: T): void;
    stateExited(): void;
    stateChange(): T;
    draw(): void;
}

export type { IState };