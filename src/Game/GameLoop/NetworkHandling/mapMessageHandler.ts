import { Grid } from "@common";
import { GameMap, MapManager } from "@game/Map";
import { TileManager } from "@game/StaticObjects/Tiles";
import { ItemManager } from "@item";
import { PlayerManager } from "@player";
import { Connection, GameMessage } from "@server";

class MapMessageHandler {
    private static readyCount: number = 0;
    private static onStart: (t: number) => void;

    public static init() {
        const gameEvent = Connection.get().gameEvent;

        gameEvent.subscribe(GameMessage.LoadMap, ({ name }) => {
            this.startNewMap(name);
        });

        gameEvent.subscribe(GameMessage.ReadyForMap, () => {
            this.readyCount++;
            this.checkReadyToStart();
        });

        gameEvent.subscribe(GameMessage.StartMap, ({ time }) => { this.onStart(time) });
    }

    public static quickStart(): void {
        PlayerManager.create();

        const map = MapManager.getMap("defaultMap");
        this.loadMapTiles(map);
        this.hostInitializeMap(map);
        this.onStart(0);
    }

    public static startNewMap(mapName: string): void {
        const map = MapManager.getMap(mapName);
        this.loadMapTiles(map);
        if (Connection.get().isHost()) {
            this.hostInitializeMap(map);
        }
    }

    private static loadMapTiles(map: GameMap): void {
        const tiles = map.getTiles();
        tiles.forEach(tile => TileManager.setTile(tile));
    }

    private static hostInitializeMap(map: GameMap): void {
        this.readyCount = 0;
        this.loadMapPlayerSpawns(map);
        this.loadMapItems(map);
        if (PlayerManager.getPlayers().length === 1) {
            this.onStart(Date.now() + 500);
        }
        Connection.get().sendGameMessage(GameMessage.DataDone, {});
    }

    private static loadMapPlayerSpawns(map: GameMap): void {
        const players = PlayerManager.getPlayers();
        const spawns = map.getRandomSpawnLocations(players.length);
        for (let i = 0; i < players.length; i++) {
            players[i].character.setPos(spawns[i]);
            Connection.get().sendGameMessage(GameMessage.PlayerSpawn, {
                id: PlayerManager.getPlayerID(players[i])!,
                location: spawns[i],
            });
        }
    }

    private static loadMapItems(map: GameMap): void {
        const items = map.getItems();
        for (const item of items) {
            const worldPos = Grid.getWorldPos(item.gridPos);
            const newItem = ItemManager.create(item.type, worldPos);
            if (!newItem) {
                continue;
            }
            newItem.getBody().pos.x += (newItem.getBody().width - Grid.size) / 2;
            newItem.getBody().pos.y += newItem.getBody().height;

            const id = ItemManager.getItemID(newItem)!;
            Connection.get().sendGameMessage(GameMessage.SpawnItem, {
                id,
                type: item.type,
                location: newItem.getBody().pos
            });
        }
    }

    private static checkReadyToStart(): void {
        const totalPlayers = PlayerManager.getPlayers().length;
        if (this.readyCount === totalPlayers - 1) {
            this.readyCount = 0;
            const timeToStart = Date.now() + 500;
            Connection.get().sendGameMessage(GameMessage.StartMap, {
                time: timeToStart
            });
            this.onStart(timeToStart);
        }
    }

    public static setStart(e: (t: number) => void) {
        this.onStart = e;
    }
}

export { MapMessageHandler };