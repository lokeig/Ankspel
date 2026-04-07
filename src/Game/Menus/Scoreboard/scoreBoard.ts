import { IScoreBoard } from "./IScoreBoard";

class ScoreBoard {
    private static current: IScoreBoard;

    public static set(lobbylistInterface: IScoreBoard): void {
        this.current = lobbylistInterface;
    }

    public static get(): IScoreBoard {
        return this.current;
    }
}

export { ScoreBoard };