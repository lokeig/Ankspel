import { StateInterface } from "@common";
import { TileType } from "@game/StaticObjects/Tiles";
import { Shotgun, Glock, Grenade } from "@impl/Items";
import { ItemManager } from "@game/Item";
import { PlayerManager } from "@game/Player";
import { GameServer } from "@server";
import { GameLoopState } from "../gameLoopState";
import { GameLoopUtility } from "../gameLoopUtility";

class InMatchLoop implements StateInterface<GameLoopState> {

    public stateEntered(): void {
        GameLoopUtility.fillArea({ x: 5, y: 14 }, 25, 2, TileType.Ice);
        GameLoopUtility.fillArea({ x: 23, y: 5 }, 6, 8, TileType.Ice);
        GameLoopUtility.fillArea({ x: 3, y: 8 }, 2, 8, TileType.Ice);
        GameLoopUtility.fillArea({ x: 9, y: 11 }, 2, 4, TileType.Ice);
        GameLoopUtility.fillArea({ x: 9, y: 5 }, 2, 4, TileType.Ice);
        GameLoopUtility.fillArea({ x: 15, y: 7 }, 3, 3, TileType.Ice);
        GameLoopUtility.createTile({ x: 15, y: 6 }, TileType.Ice);

        const local = true;
        PlayerManager.addPlayer({ x: 15, y: 12 }, local);

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
        GameServer.get().clearMessages();
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