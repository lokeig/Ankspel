import { Countdown, GameLoopState, IState } from "@common";
import { DuckGame } from "../game";
import { Player, PlayerManager } from "@player";
import { Connection, GameMessage } from "@server";

class Playing implements IState<GameLoopState> {
    private newMapCountdown = new Countdown(4);
    private startNewMap: boolean = false;
    private game: DuckGame;

    private lastPlayer: Player | null = null;
    private scoreGiven = false;

    public constructor(game: DuckGame) {
        this.game = game;
    }

    public stateEntered(): void {
        this.startNewMap = false;
        this.lastPlayer = null;
        this.scoreGiven = false;
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
        if (remaining.length < 2 && !this.startNewMap) {
            this.startNewMap = true;
            this.newMapCountdown.reset();
        }
        if (!this.startNewMap) {
            return;
        }
        this.newMapCountdown.update(deltaTime);
        if (this.scoreGiven || this.newMapCountdown.getPercentageReady() < 0.5) {
            return;
        }
        if (!this.lastPlayer && remaining.length === 1) {
            this.lastPlayer = remaining[0];
        } else {
            return;
        }
        this.scoreGiven = true;

        this.lastPlayer.givePoint();
        const id = this.lastPlayer.getId();
        const score = this.lastPlayer.getScore();
        Connection.get().sendGameMessage(GameMessage.PlayerScore, { id, score });
    }

    public stateChange(): GameLoopState {
        if (!this.startNewMap || !this.newMapCountdown.isDone()) {
            return GameLoopState.Playing;
        }
        if (this.game.isFinalRound()) {
            if (!this.lastPlayer) {
                return GameLoopState.LoadingMap;
            }
            return GameLoopState.TrophiesScreen;
        }
        const maxRounds = 15;
        if (this.game.getRoundsPlayed() === maxRounds) {
            return GameLoopState.ScoreScreen;
        }
        return GameLoopState.LoadingMap;
    }
    

    public stateExited(): void {
        
    }

    public draw() {
        this.game.draw();
    }
}

export { Playing };