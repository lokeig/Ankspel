import { Input } from "@common";
import { GameMap, MapLoader, MapManager } from "@game/Map";
import { PlayerManager } from "@player";
import { Connection, GameMessage } from "@server";

class MapNetworkHandler {
    private static readyCount: number = 0;
    private static onMapLoad: (t: number) => void;

    public static init() {
        const gameEvent = Connection.get().gameEvent;

        gameEvent.subscribe(GameMessage.MapLoaded, () => {
            if (!Connection.get().isHost()) {
                return;
            }
            this.readyCount++;
            this.checkReadyToStart();
        });

        gameEvent.subscribe(GameMessage.LoadMap, ({ id }) => {
            const map = MapManager.getMap(id);
            MapLoader.load(map, false);
            Connection.get().sendGameMessage(GameMessage.MapLoaded, {});
        });

        gameEvent.subscribe(GameMessage.StartMap, ({ time }) => { this.onMapLoad(time) });

        Input.onKey("q", this.quickStart.bind(this));

    }

    public static hostInitializeMap(map: [number, GameMap]): void {
        this.readyCount = 0;
        const host = true;

        Connection.get().sendGameMessage(GameMessage.LoadMap, { id: map[0] });
        MapLoader.load(map[1], host);
    }

    private static checkReadyToStart(): void {
        const totalPlayers = PlayerManager.getPlayers().length;
        if (this.readyCount !== totalPlayers - 1) {
            return;
        }
        this.readyCount = 0;
        const timeToStart = Date.now() + 500;
        Connection.get().sendGameMessage(GameMessage.StartMap, {
            time: timeToStart
        });
        this.onMapLoad(timeToStart);
    }

    private static quickStart(): void {
        this.onMapLoad(0);
    }


    public static setMapLoad(e: (t: number) => void): void {
        this.onMapLoad = e;
    }
}

export { MapNetworkHandler };