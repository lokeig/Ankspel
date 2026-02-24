import { Countdown, IState } from "@common";
import { GameLoopState } from "../gameLoopState";
import { DuckGame } from "../game";
import { PlayerManager } from "@player";

class Playing implements IState<GameLoopState> {
    private newMapCountdown = new Countdown(3);
    private startNewMap: boolean = false;
    private game: DuckGame;

    public constructor(game: DuckGame) {
        this.game = game;
    }

    public stateEntered(): void {
        this.startNewMap = false;
    }

    public stateUpdate(deltaTime: number) {
        this.game.update(deltaTime);
        if (this.startNewMap) {
            this.newMapCountdown.update(deltaTime);
            return;
        }
        if (PlayerManager.getPlayers().filter(player => !player.character.isDead()).length <= 1) {
            if (PlayerManager.getPlayers().length === 1) {
                return;
            }
            this.startNewMap = true;
            this.newMapCountdown.reset();
        }
    }

    public stateChange(): GameLoopState {
        if (this.startNewMap && this.newMapCountdown.isDone()) {
            return GameLoopState.LoadingMap;
        }
        return GameLoopState.Playing;
    }

    public stateExited(): void {

    }

    public draw() {
        this.game.draw();
    }
}

export { Playing };