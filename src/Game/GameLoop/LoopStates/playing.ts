import { Countdown, IState } from "@common";
import { GameLoopState } from "../gameLoopState";
import { DuckGame } from "../game";
import { Player, PlayerManager } from "@player";

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
    }

    public stateUpdate(deltaTime: number) {
        this.game.update(deltaTime);

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
        
        if (this.startNewMap) {
            this.newMapCountdown.update(deltaTime);
            if (this.newMapCountdown.getPercentageReady() > 0.5 && !this.scoreGiven) {
                this.scoreGiven = true;
                this.lastPlayer?.givePoint();
            }
            return;
        }
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