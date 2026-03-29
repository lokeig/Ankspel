import { Countdown, GameLoopState, IState } from "@common";
import { DuckGame } from "../game";
import { Player, PlayerManager } from "@player";
import { Connection, GameMessage } from "@server";

class Playing implements IState<GameLoopState> {
    private newMapCountdown = new Countdown(5);
    private startNewMap: boolean = false;
    private game: DuckGame;

    private lastPlayer: Player | null = null;
    private scoreGiven = false;

    public constructor(game: DuckGame) {
        this.game = game;
    }

    public stateEntered(): void {
        this.startNewMap = false;
        if (Connection.get().isHost()) {
            Connection.get().sendGameMessage(GameMessage.GameState, { state: GameLoopState.Playing });
        }
    }

    public stateUpdate(deltaTime: number) {
        this.game.update(deltaTime);
        if (!Connection.get().isHost()) {
            return;
        }

        const remaining = PlayerManager.getPlayers().filter(player => !player.character.isDead());
        if (remaining.length === 0) {
            this.lastPlayer = null;
        }

        if (remaining.length === 1) {
            this.lastPlayer = remaining[0];
        }

        if (remaining.length === 0 || remaining.length === 1) {
            if (!this.startNewMap) {
                this.startNewMap = true;
                this.newMapCountdown.reset();
            }
        }

        if (!this.startNewMap) {
            return;
        }

        this.newMapCountdown.update(deltaTime);
        if (this.newMapCountdown.getPercentageReady() > 0.5 && !this.scoreGiven) {
            this.scoreGiven = true;

            if (this.lastPlayer) {
                this.lastPlayer.givePoint();
                const id = this.lastPlayer.getId();
                const score = this.lastPlayer.getScore();
                Connection.get().sendGameMessage(GameMessage.PlayerScore, { id, score });
            }
        }
        return;

    }

    public stateChange(): GameLoopState {
        const maxRounds = 10;
        if (this.startNewMap && this.newMapCountdown.isDone() && this.game.getRoundsPlayed() > maxRounds) {
            return GameLoopState.ScoreScreen;
        }
        if (this.startNewMap && this.newMapCountdown.isDone()) {
            return GameLoopState.LoadingMap;
        }
        return GameLoopState.Playing;
    }


    public stateExited(): void {
        this.lastPlayer = null;
        this.scoreGiven = false;
    }

    public draw() {
        this.game.draw();
    }
}

export { Playing };