import { GameLoopState } from "../../gameLoopState";
import { StateInterface } from "../../../Common/StateMachine/stateInterface";
import { GameLoopUtility } from "../../gameLoopUtility";
import { LobbyList } from "./LobbyList/lobbylist";


export class LobbyLoop implements StateInterface<GameLoopState> {
    public stateEntered(): void {
        LobbyList.get().show();
    }

    public stateUpdate(deltaTime: number): void {
        GameLoopUtility.update(deltaTime);
    }

    public stateExited(): void {
        LobbyList.get().hide();
    }

    public stateChange(): GameLoopState {
        // Maybe if we get a message from the server that lobby is ready to start?

        return GameLoopState.lobby;
    }

    public stateDraw(): void {
        GameLoopUtility.draw();
    }

}