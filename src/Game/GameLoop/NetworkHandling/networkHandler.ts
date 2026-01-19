import { PlayerManager } from "@player";
import { Connection, GameMessage } from "@game/Server";
import { Countdown, IDManager } from "@common";
import { ServerMessage } from "@shared";
import { PlayerMessageHandler } from "./playerMessageHandler";
import { ItemMessageHandler } from "./itemMessageHandler";
import { MapMessageHandler } from "./mapMessageHandler";
import { ProjectileMessageHandler } from "./projectileMessageHandler";

class NetworkHandler {
    private static readyCount: number = 0;
    private static messageTimer = new Countdown(0.05);
    static init() {
        PlayerMessageHandler.init();
        ItemMessageHandler.init();
        MapMessageHandler.init();
        ProjectileMessageHandler.init();

        Connection.get().serverEvent.subscribe(ServerMessage.startGame, ({ userID }) => {
            IDManager.setBaseOffset(userID * (2 << 16));
            PlayerManager.create();
            Connection.get().sendGameMessage(GameMessage.ReadyToPlay, {});
            if (Connection.get().connectionCount() === 0) {
                const mapName = "defaultMap";
                MapMessageHandler.startNewMap(mapName);
            }
        });

        const gameEvent = Connection.get().gameEvent;

        gameEvent.subscribe(GameMessage.ReadyToPlay, () => {
            this.readyCount++;
            if (Connection.get().isHost() && this.readyCount === Connection.get().connectionCount()) {
                this.readyCount = 0;
                const mapName = "defaultMap";
                MapMessageHandler.startNewMap(mapName);
                Connection.get().sendGameMessage(GameMessage.LoadMap, { name: mapName });
            }
        });

        gameEvent.subscribe(GameMessage.DataDone, () => {
            Connection.get().sendGameMessage(GameMessage.ReadyForMap, {});
        });
    }

    public static onMapLoad(e: (t: number) => void) {
        MapMessageHandler.setStart(e);
    }

    public static update(deltaTime: number): void {
        this.messageTimer.update(deltaTime);
        if (this.messageTimer.isDone()) {
            PlayerMessageHandler.sendLocalPlayersInfo();
            this.messageTimer.reset();
        }
    }
}
export { NetworkHandler };