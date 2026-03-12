import { IState } from "@common";
import { GameLoopState } from "../gameLoopState";
import { DuckGame } from "../game";
import { PlayerManager } from "@player";

class ScoreScreen implements IState<GameLoopState> {
    private game: DuckGame;

    public constructor(game: DuckGame) {
        this.game = game;
    }
    
    public stateEntered(): void {
        PlayerManager.getPlayers().forEach(player => {
            const id = player.getId();
            const score = player.getScore();
    
            console.log("ID: " + id + ", " + score + " points!")
        })
    }

    public stateUpdate(_deltaTime: number) {

    }

    public stateChange(): GameLoopState {
        return GameLoopState.ScoreScreen;
    }

    public stateExited(): void {

    }

    public draw() {
        this.game.draw();
    }
}

export { ScoreScreen };