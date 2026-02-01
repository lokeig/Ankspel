import { Countdown, IState } from "@common";
import { GameLoopState } from "../gameLoopState";
import { GameLoopUtility } from "../gameLoopUtility";
import { PlayerManager } from "@player";

class Playing implements IState<GameLoopState> {
    private newMapCountdown = new Countdown(3);
    private startNewMap: boolean = false;

    public stateEntered(): void {
        this.startNewMap = false;
    }

    public stateUpdate(deltaTime: number) {
        if (this.startNewMap) {
            this.newMapCountdown.update(deltaTime);
        }
        GameLoopUtility.update(deltaTime);
        if (!this.startNewMap && PlayerManager.getPlayers().filter(player => !player.character.isDead()).length <= 1) {
            if (PlayerManager.getPlayers().length === 1) {
                return;
            }
            console.log("round over")
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
        GameLoopUtility.draw();
    }
}

export { Playing };