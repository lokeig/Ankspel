import { IScoreBoard } from "./IScoreBoard";

class ScoreBoard {
    private static currentScores: IScoreBoard;
    private static currentWins: IScoreBoard;


    public static setScore(scoreBoard: IScoreBoard): void {
        this.currentScores = scoreBoard;
    }

    public static getScore(): IScoreBoard {
        return this.currentScores;
    }

    public static setWins(scoreBoard: IScoreBoard): void {
        this.currentWins = scoreBoard;
    }

    public static getWins(): IScoreBoard {
        return this.currentWins;
    }
}

export { ScoreBoard };