interface IState<T> {
    stateUpdate(deltaTime: number): void;
    stateEntered(): void;
    stateExited(): void;
    stateChange(): T;
    draw(): void;
}

export type { IState };