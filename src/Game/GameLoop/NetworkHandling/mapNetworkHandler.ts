import { PlayerManager } from "@player";
import { Connection, GameMessage } from "@server";

class MapNetworkHandler {
    private static readyCount: number = 0;

    private static onMapLoad: (mapId: number, seed: number) => void;
    private static onMapStart: () => void;

    public static init() {
        const connection = Connection.get();
        const gameEvent = connection.gameEvent;

        gameEvent.subscribe(GameMessage.LoadMap, ({ id, seed }) => {
            this.onMapLoad(id, seed);
            connection.sendGameMessage(GameMessage.MapLoaded, {});
        });

        gameEvent.subscribe(GameMessage.MapLoaded, () => {
            if (!connection.isHost()) {
                return;
            }
            this.readyCount++;
            this.checkReadyToStart();
        });
        gameEvent.subscribe(GameMessage.StartMap, ({ }) => { this.onMapStart() });
    }

    public static hostInitializeMap(id: number, seed: number): void {
        this.readyCount = 0;

        Connection.get().sendGameMessage(GameMessage.LoadMap, { id, seed });
        this.onMapLoad(id, seed);

        this.checkReadyToStart();
    }

    private static checkReadyToStart(): void {
        if (PlayerManager.getPlayers().length === PlayerManager.getLocal().length) {
            this.onMapStart();
        }
        const totalPlayers = PlayerManager.getPlayers().length;

        if (this.readyCount !== totalPlayers - 1) {
            return;
        }
        this.readyCount = 0;

        Connection.get().sendGameMessage(GameMessage.StartMap, {});
        this.onMapStart();
    }

    public static setMapLoad(callback: (mapId: number, seed: number) => void): void {
        this.onMapLoad = callback;
    }

    public static setMapStart(callback: () => void): void {
        this.onMapStart = callback;
    }
}

export { MapNetworkHandler };