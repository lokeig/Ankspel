import { GameLoopState } from "../gameLoopState";
import { Input } from "./Common/input";
import { StateInterface } from "./Common/StateMachine/stateInterface";

export class LobbyLoop implements StateInterface<GameLoopState> {
    private startGame: boolean = false;
    public stateUpdate(deltaTime: number): void {

    }

    public stateEntered(): void {
        this.startGame = false;
    }

    public stateExited(): void {
    }

    public stateChange(): GameLoopState {
        if (Input.keyPress("p")) {
            return GameLoopState.playing;
        }
        return GameLoopState.lobby;
    }

    public stateDraw(): void {
        
    }


}