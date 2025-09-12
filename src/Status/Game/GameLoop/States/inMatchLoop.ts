import { ItemManager } from "../../Objects/DynamicObjects/Items/Manager/itemManager";
import { PlayerManager } from "../../Objects/DynamicObjects/Player/playerManager";
import { TileType as TileType } from "../../Objects/StaticObjects/tileType";
import { Shotgun } from "../../Objects/DynamicObjects/Items/Implementations/shotgun";
import { Glock } from "../../Objects/DynamicObjects/Items/Implementations/glock";
import { Grenade } from "../../Objects/DynamicObjects/Items/Implementations/grenade";
import { StateInterface } from "../../Common/StateMachine/stateInterface";
import { GameLoopState } from "../gameLoopState";
import { GameServer } from "../../../Server/Common/server";
import { GameLoopUtility } from "../gameLoopUtility";

export class InMatchLoop implements StateInterface<GameLoopState> {

    public stateEntered(): void {
        GameLoopUtility.fillArea({ x: 5, y: 14 }, 25, 2, TileType.Ice);
        GameLoopUtility.fillArea({ x: 23, y: 5 }, 6, 8, TileType.Ice);
        GameLoopUtility.fillArea({ x: 3, y: 8 }, 2, 8, TileType.Ice);
        GameLoopUtility.fillArea({ x: 9, y: 11 }, 2, 4, TileType.Ice);
        GameLoopUtility.fillArea({ x: 9, y: 5 }, 2, 4, TileType.Ice);
        GameLoopUtility.fillArea({ x: 15, y: 7 }, 3, 3, TileType.Ice);

        GameLoopUtility.createTile({ x: 15, y: 6 }, TileType.Ice);

        ItemManager.addItem({ x: 10, y: 2 }, Shotgun);
        ItemManager.addItem({ x: 20, y: 14 }, Shotgun);
        ItemManager.addItem({ x: 21, y: 12 }, Glock);
        ItemManager.addItem({ x: 19, y: 12 }, Grenade);
    }

    public stateUpdate(deltaTime: number) {
           
        const messages = GameServer.get().getReceivedMessages();
        for (const message of messages) {
            if (message.type === "playerData") {
                let player = PlayerManager.getPlayerFromID(message.id!)!;

                player.playerBody.dynamicObject.pos = {
                    x: message.xPos,
                    y: message.yPos
                };
            }
        }

        GameLoopUtility.update(deltaTime);
        GameServer.get().update();
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