interface StateInterface<T> {
    stateUpdate(deltaTime: number): void;
    stateEntered(): void;
    stateExited(): void;
    stateChange(): T;
    stateDraw(): void;
}

export type { StateInterface };