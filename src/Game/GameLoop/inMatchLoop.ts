import { IState } from "@common";
import { GameLoopState } from "./gameLoopState";
import { GameLoopUtility } from "./gameLoopUtility";

class InMatchLoop implements IState<GameLoopState> {

    public stateEntered(): void {

    }

    public stateUpdate(deltaTime: number) {
        GameLoopUtility.update(deltaTime);
    }

    public stateChange(): GameLoopState {
        return GameLoopState.playing;
    }

    public stateExited(): void {

    }

    public draw() {
        GameLoopUtility.draw();
    }
}

export { InMatchLoop };