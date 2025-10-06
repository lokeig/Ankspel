import { GameLoopState } from "../../gameLoopState";
import { Input } from "../../../Common/input";
import { StateInterface } from "../../../Common/StateMachine/stateInterface";
import { GameServer } from "../../../../Server/server";
import { StartGameMessage } from "../../../../Server/MessageTypes/messageType";
import { GameLoopUtility } from "../../gameLoopUtility";
import { TileType } from "../../../Objects/StaticObjects/tileType";
import { PlayerManager } from "../../../Objects/DynamicObjects/Player/playerManager";

export class LobbyLoop implements StateInterface<GameLoopState> {
    private startGame: boolean = false;
    private isHost: boolean = false;

    private p1Pos = { x: 10, y: 12 };
    private p2Pos = { x: 23, y: 12 };
    private p3Pos = { x: 10, y: 24 };
    private p4Pos = { x: 23, y: 24 };


    public stateEntered(): void {
        this.startGame = false;
        GameLoopUtility.fillArea({ x: 4, y: 12 }, 26, 1, TileType.Ice);
        GameLoopUtility.fillArea({ x: 4, y: 0 }, 26, 1, TileType.Ice);
        GameLoopUtility.fillArea({ x: 4, y: 24 }, 26, 1, TileType.Ice);

        GameLoopUtility.fillArea({ x: 4, y: 0 }, 1, 25, TileType.Ice);
        GameLoopUtility.fillArea({ x: 17, y: 0 }, 1, 25, TileType.Ice);
        GameLoopUtility.fillArea({ x: 30, y: 0 }, 1, 25, TileType.Ice);

        PlayerManager.addPlayer(this.p1Pos, true);
        PlayerManager.addPlayer(this.p2Pos, false);
        PlayerManager.addPlayer(this.p3Pos, false);
        PlayerManager.addPlayer(this.p4Pos, false);

    }

    public stateUpdate(deltaTime: number): void {
        GameLoopUtility.update(deltaTime);
    }

    public stateExited(): void {
        
    }

    public stateChange(): GameLoopState {
        if (Input.keyPress("p") && this.isHost) {
            const msg: StartGameMessage = { type: "startGame" }
            GameServer.get().sendMessage(msg);
        }
        return GameLoopState.lobby;
    }

    public stateDraw(): void {
        GameLoopUtility.draw();
    }
}