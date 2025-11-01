import { StateInterface } from "@common";
import { GameLoopState } from "./gameLoopState";
import { GameLoopUtility } from "./gameLoopUtility";

class InMatchLoop implements StateInterface<GameLoopState> {

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

    public stateDraw() {
        GameLoopUtility.draw();
    }
}

export { InMatchLoop };