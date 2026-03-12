import { PlayerManager } from "@player";
import { Connection, GameMessage } from "@server";

class MapNetworkHandler {
    private static readyCount: number = 0;

    private static onMapLoad: (mapId: number) => void;
    private static onMapStart: () => void;

    public static init() {
        const gameEvent = Connection.get().gameEvent;

        gameEvent.subscribe(GameMessage.LoadMap, ({ id }) => {
            this.onMapLoad(id);
            Connection.get().sendGameMessage(GameMessage.MapLoaded, {});
        });

        gameEvent.subscribe(GameMessage.MapLoaded, () => {
            if (!Connection.get().isHost()) {
                return;
            }
            this.readyCount++;
            this.checkReadyToStart();
        });


        gameEvent.subscribe(GameMessage.StartMap, ({ }) => { this.onMapStart() });
    }

    public static hostInitializeMap(mapId: number): void {
        this.readyCount = 0;

        Connection.get().sendGameMessage(GameMessage.LoadMap, { id: mapId });
        this.onMapLoad(mapId);

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

    public static setMapLoad(callback: (mapId: number) => void): void {
        this.onMapLoad = callback;
    }

    public static setMapStart(callback: () => void): void {
        this.onMapStart = callback;
    }
}

export { MapNetworkHandler };