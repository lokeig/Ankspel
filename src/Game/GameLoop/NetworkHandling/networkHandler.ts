import { PlayerManager } from "@player";
import { Connection, GameMessage } from "@game/Server";
import { Countdown, IDManager } from "@common";
import { ServerMessage } from "@shared";
import { PlayerNetworkHandler } from "./playerNetworkHandler";
import { ItemMessageHandler } from "./itemNetworkHandler";
import { MapNetworkHandler } from "./mapNetworkHandler";
import { MapManager } from "@game/Map";

class NetworkHandler {
    private static readyCount: number = 0;
    private static messageTimer = new Countdown(0.05);
    static init() {
        PlayerNetworkHandler.init();
        ItemMessageHandler.init();
        MapNetworkHandler.init();

        Connection.get().serverEvent.subscribe(ServerMessage.StartGame, ({ userID }) => {
            IDManager.setBaseOffset(userID * (2 << 16));
            PlayerManager.create();
            Connection.get().sendGameMessage(GameMessage.ReadyToPlay, {});
            
            if (Connection.get().connectionCount() === 0) {
                this.startRandomMap();
            }
        });

        const gameEvent = Connection.get().gameEvent;

        gameEvent.subscribe(GameMessage.ReadyToPlay, () => {
            if (!Connection.get().isHost()) {
                return;
            }
            this.readyCount++;
            if (this.readyCount !== Connection.get().connectionCount()) {
                return;
            }
            this.readyCount = 0;
            this.startRandomMap();
        });
    }

    private static startRandomMap(): void {
        const map = MapManager.getRandomMap();
        MapNetworkHandler.startNewMap(map[1]);
        Connection.get().sendGameMessage(GameMessage.LoadMap, { name: map[0] });
    }

    public static onMapLoad(e: (t: number) => void) {
        MapNetworkHandler.setStart(e);
    }

    public static update(deltaTime: number): void {
        this.messageTimer.update(deltaTime);
        if (this.messageTimer.isDone()) {
            PlayerNetworkHandler.sendLocalPlayersInfo();
            this.messageTimer.reset();
        }
    }
}
export { NetworkHandler };