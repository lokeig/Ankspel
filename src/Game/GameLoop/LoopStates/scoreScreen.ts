import { GameLoopState, IState } from "@common";
import { DuckGame } from "../game";
import { PlayerManager } from "@player";
import { Connection, GameMessage } from "@server";

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
        });
        if (!Connection.get().isHost()) {
            return;
        }
        Connection.get().sendGameMessage(GameMessage.GameState, { state: GameLoopState.ScoreScreen });

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