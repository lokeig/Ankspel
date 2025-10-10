import { GameLoopState } from "../../gameLoopState";
import { StateInterface } from "../../../Common/StateMachine/stateInterface";
import { GameLoopUtility } from "../../gameLoopUtility";
import { LobbyList } from "./LobbyList/lobbylist";
import { GameServer } from "../../../../Server/gameServer";


export class LobbyLoop implements StateInterface<GameLoopState> {
    private start: boolean = false;
    constructor() {
        GameServer.get().emitter.subscribe("start-game", () => { this.start = true; })
    }

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
        if (this.start) {
            return GameLoopState.playing;
        }
        return GameLoopState.lobby;
    }

    public stateDraw(): void {
        GameLoopUtility.draw();
    }

}