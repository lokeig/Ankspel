import { GameLoopState } from "../gameLoopState";
import { Input } from "./Common/input";
import { StateInterface } from "./Common/StateMachine/stateInterface";

export class LobbyLoop implements StateInterface<GameLoopState> {
    public stateUpdate(deltaTime: number): void {
    }

    public stateEntered(): void {
    }

    public stateExited(): void {
    }

    public stateChange(): GameLoopState {
        if (Input.keyPress(" ")) {
            return GameLoopState.playing;
        }
    }

    public stateDraw(): void {
    }


}