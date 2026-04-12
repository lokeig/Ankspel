interface IScoreBoard {
    show(): void;
    hide(): void;
    refresh(scores: { name: string; score: number, color: string }[]): void;
    setOpacity(opac: number): void,
}

export type { IScoreBoard };