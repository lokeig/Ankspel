import { GameMap, MapManager } from "@game/Map";
import { PlayerManager } from "@player";
import { Connection, GameMessage, NetworkVector } from "@game/Server";
import { TileManager } from "@game/StaticObjects/Tiles";
import { ItemManager } from "@item";
import { Grid, IDManager, Vector } from "@common";
import { ProjectileManager } from "@projectile";
import { ServerMessage } from "@shared";

class NetworkHandler {
    private static readyCount = 0;
    private static onStart: (t: number) => void = () => { };
    static init() {
        Connection.get().serverEvent.subscribe(ServerMessage.startGame, ({ userID }) => {
            IDManager.setBaseOffset(userID * (2 << 16));
            PlayerManager.create();
            Connection.get().sendGameMessage(GameMessage.readyToPlay, {});
            if (Connection.get().connectionCount() === 0) {
                this.startNewMap("defaultMap");
            }
        });

        const gameEvent = Connection.get().gameEvent;

        gameEvent.subscribe(GameMessage.readyToPlay, () => {
            this.readyCount++;
            if (Connection.get().isHost() && this.readyCount === Connection.get().connectionCount()) {
                this.readyCount = 0;
                const mapName = "defaultMap";
                this.startNewMap(mapName);
                Connection.get().sendGameMessage(GameMessage.loadMap, { name: mapName });
            }
        });

        gameEvent.subscribe(GameMessage.newPlayer, ({ id }) => {
            PlayerManager.spawn(id);
        });

        gameEvent.subscribe(GameMessage.loadMap, ({ name }) => {
            this.startNewMap(name);
        });

        gameEvent.subscribe(GameMessage.dataDone, () => {
            Connection.get().sendGameMessage(GameMessage.readyForMap, {});
        });

        gameEvent.subscribe(GameMessage.readyForMap, () => {
            this.readyCount++;
            this.checkReadyToStart();
        });

        gameEvent.subscribe(GameMessage.playerSpawn, ({ id, location }) => {
            const player = PlayerManager.getPlayerFromID(id);
            if (!player) {
                throw new Error("Player with id: " + id + " not found");
            }
            player.character.setPos(this.convertVector(location));
        });

        gameEvent.subscribe(GameMessage.spawnItem, ({ type, id, location }) => {
            ItemManager.spawn(type, this.convertVector(location), id);
        });

        gameEvent.subscribe(GameMessage.deleteItem, ({ id }) => {
            const item = ItemManager.getItemFromID(id);
            if (!item) {
                return;
            }
            item.setToDelete();
        });

        gameEvent.subscribe(GameMessage.activateItem, ({ id }) => {
            
        })

        gameEvent.subscribe(GameMessage.spawnProjectile, ({ type, id, location, angle }) => {
            ProjectileManager.spawn(type, this.convertVector(location), angle, id);
        });

        gameEvent.subscribe(GameMessage.throwItem, ({ itemID, pos, direction, throwType }) => {
            const item = ItemManager.getItemFromID(itemID);
            if (!item) {
                return;
            }
            for (const player of PlayerManager.getPlayers()) {
                if (player.character.equipment.getHolding() === item) {
                    player.character.equipment.setHolding(null);
                }
            }
            item.getBody().pos = this.convertVector(pos);
            item.getBody().direction = direction;
            item.throw(throwType);
        });

        gameEvent.subscribe(GameMessage.playerInfo, ({ id, pos, state, holding, anim, side, armAngle }) => {
            const player = PlayerManager.getPlayerFromID(id);
            if (!player) {
                return;
            }
            player.character.setPos(this.convertVector(pos));
            if (holding !== null && ItemManager.getItemFromID(holding)) {
                player.character.equipment.setHolding(ItemManager.getItemFromID(holding)!);
            } else {
                player.character.equipment.setHolding(null);
            }
            player.setState(state);
            player.character.body.direction = side;
            player.character.animator.setAnimation(anim);
            player.character.armFront.angle = armAngle;
        });

        gameEvent.subscribe(GameMessage.startMap, ({ time }) => { this.onStart(time) });
    }

    private static convertVector(vector: NetworkVector): Vector {
        return new Vector(vector.x, vector.y);
    }

    public static startNewMap(mapName: string): void {
        const map = MapManager.getMap(mapName);
        this.loadMapTiles(map);
        if (Connection.get().isHost()) {
            this.hostInitializeMap(map);
        }
    }

    public static quickStart(): void {
        PlayerManager.create();
        const map = MapManager.getMap("defaultMap");
        this.loadMapTiles(map);
        this.hostInitializeMap(map);
        this.onStart(0);
    }

    public static setStart(e: (t: number) => void) {
        this.onStart = e;
    }

    public static update(): void {
        PlayerManager.getLocal().forEach(player => {
            const id = PlayerManager.getPlayerID(player)!;
            let holding = player.character.equipment.getHolding();
            let itemID: number | null = null;
            if (holding) {
                itemID = ItemManager.getItemID(holding)!;
            }
            Connection.get().sendGameMessage(GameMessage.playerInfo, {
                id,
                pos: player.character.body.pos,
                state: player.getState(),
                holding: itemID,
                anim: player.character.animator.getCurrentAnimation(),
                side: player.character.body.direction,
                armAngle: player.character.armFront.angle,
            });
        })
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
        Connection.get().sendGameMessage(GameMessage.dataDone, {});
    }

    private static loadMapPlayerSpawns(map: GameMap): void {
        const players = PlayerManager.getPlayers();
        const spawns = map.getRandomSpawnLocations(players.length);
        for (let i = 0; i < players.length; i++) {
            players[i].character.setPos(spawns[i]);
            Connection.get().sendGameMessage(GameMessage.playerSpawn, {
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
            Connection.get().sendGameMessage(GameMessage.spawnItem, {
                id,
                type: item.type,
                location: newItem.getBody().pos
            });
        }
    }

    private static checkReadyToStart(): void {
        const totalPlayers = PlayerManager.getPlayers().length;
        if (this.readyCount === totalPlayers - 1) {
            const timeToStart = Date.now() + 500;
            Connection.get().sendGameMessage(GameMessage.startMap, {
                time: timeToStart
            });
            this.onStart(timeToStart);
        }
    }
}
export { NetworkHandler };