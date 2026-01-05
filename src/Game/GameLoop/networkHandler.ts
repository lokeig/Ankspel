import { GameMap, MapManager } from "@game/Map";
import { PlayerManager } from "@player";
import { Connection, GameMessage, NetworkVector } from "@game/Server";
import { TileManager } from "@game/StaticObjects/Tiles";
import { IExplosive, IFirearm, ItemManager, ItemType } from "@item";
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
            Connection.get().sendGameMessage(GameMessage.ReadyToPlay, {});
            if (Connection.get().connectionCount() === 0) {
                this.startNewMap("defaultMap");
            }
        });

        const gameEvent = Connection.get().gameEvent;

        gameEvent.subscribe(GameMessage.ReadyToPlay, () => {
            this.readyCount++;
            if (Connection.get().isHost() && this.readyCount === Connection.get().connectionCount()) {
                this.readyCount = 0;
                const mapName = "defaultMap";
                this.startNewMap(mapName);
                Connection.get().sendGameMessage(GameMessage.LoadMap, { name: mapName });
            }
        });

        gameEvent.subscribe(GameMessage.NewPlayer, ({ id }) => {
            PlayerManager.spawn(id);
        });

        gameEvent.subscribe(GameMessage.LoadMap, ({ name }) => {
            this.startNewMap(name);
        });

        gameEvent.subscribe(GameMessage.DataDone, () => {
            Connection.get().sendGameMessage(GameMessage.ReadyForMap, {});
        });

        gameEvent.subscribe(GameMessage.ReadyForMap, () => {
            this.readyCount++;
            this.checkReadyToStart();
        });

        gameEvent.subscribe(GameMessage.PlayerSpawn, ({ id, location }) => {
            const player = PlayerManager.getPlayerFromID(id);
            if (!player) {
                throw new Error("Player with id: " + id + " not found");
            }
            player.character.setPos(this.convertVector(location));
        });

        gameEvent.subscribe(GameMessage.SpawnItem, ({ type, id, location }) => {
            ItemManager.spawn(type, this.convertVector(location), id);
        });

        gameEvent.subscribe(GameMessage.DeleteItem, ({ id }) => {
            const item = ItemManager.getItemFromID(id);
            if (!item) {
                return;
            }
            item.common.setToDelete();
        });

        gameEvent.subscribe(GameMessage.ActivateItem, ({ id, action, seed, position, direction, angle }) => {
            const item = ItemManager.getItemFromID(id);
            if (!item) {
                return;
            }
            item.common.angle = angle;
            item.common.body.pos = this.convertVector(position);
            item.common.body.direction = direction;

            console.log("activatzio111n");


            switch (item.common.getType()) {
                case (ItemType.Firearm): {
                    (item as IFirearm).shoot(seed);
                    break;
                }
                case (ItemType.Explosive): {
                    console.log("activatzion");
                    (item as IExplosive).activate();
                    break;
                }
            }

        })

        gameEvent.subscribe(GameMessage.SpawnProjectile, ({ type, id, location, angle }) => {
            ProjectileManager.spawn(type, this.convertVector(location), angle, id);
        });

        gameEvent.subscribe(GameMessage.ThrowItem, ({ itemID, pos, direction, throwType }) => {
            const item = ItemManager.getItemFromID(itemID);
            if (!item) {
                return;
            }
            for (const player of PlayerManager.getPlayers()) {
                if (player.character.equipment.getHolding() === item) {
                    player.character.equipment.setHolding(null);
                }
            }
            item.common.body.pos = this.convertVector(pos);
            item.common.body.direction = direction;
            item.common.throw(throwType);
        });

        gameEvent.subscribe(GameMessage.PlayerInfo, ({ id, pos, state, holding, anim, side, armAngle }) => {
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

        gameEvent.subscribe(GameMessage.StartMap, ({ time }) => { this.onStart(time) });
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
            Connection.get().sendGameMessage(GameMessage.PlayerInfo, {
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
            newItem.common.body.pos.x += (newItem.common.body.width - Grid.size) / 2;
            newItem.common.body.pos.y += newItem.common.body.height;

            const id = ItemManager.getItemID(newItem)!;
            Connection.get().sendGameMessage(GameMessage.SpawnItem, {
                id,
                type: item.type,
                location: newItem.common.body.pos
            });
        }
    }

    private static checkReadyToStart(): void {
        const totalPlayers = PlayerManager.getPlayers().length;
        if (this.readyCount === totalPlayers - 1) {
            const timeToStart = Date.now() + 500;
            Connection.get().sendGameMessage(GameMessage.StartMap, {
                time: timeToStart
            });
            this.onStart(timeToStart);
        }
    }
}
export { NetworkHandler };