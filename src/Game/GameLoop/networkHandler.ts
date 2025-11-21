import { GameMap, MapManager } from "@game/Map";
import { PlayerManager } from "@player";
import { GameServer, GMsgType } from "@game/Server";
import { TileManager } from "@game/StaticObjects/Tiles";
import { ItemManager } from "@item";
import { Grid, PlayerState, Utility } from "@common";

class NetworkHandler {
    private static readyCount = 0;
    private static onStart: (t: number) => void = () => {};
    static init() {
        const emitter = GameServer.get().emitter;

        emitter.subscribe(GMsgType.newPlayer, ({ local, id }) => {
            const player = PlayerManager.addPlayer(local, id);
            if (local) {
                const controls = Utility.File.getControls(0);
                player.setControls(controls);
            }
        });

        emitter.subscribe(GMsgType.loadMap, ({ name }) => {
            const map = MapManager.getMap(name);
            this.loadMap(map);
            if (GameServer.get().isHost()) {
                this.hostInitializeMap(map);
            }
        });

        emitter.subscribe(GMsgType.dataDone, () => {
            if (!GameServer.get().isHost()) {
                GameServer.get().sendMessage(GMsgType.readyToStart, {});
            }
        });

        emitter.subscribe(GMsgType.readyToStart, () => {
            if (GameServer.get().isHost()) {
                this.readyCount++;
                this.checkReadyToStart();
            }
        });

        emitter.subscribe(GMsgType.playerSpawn, ({ id, location }) => {
            PlayerManager.getPlayerFromID(id)!.character.setPos(location);
        });

        emitter.subscribe(GMsgType.spawnItem, ({ itemType, id, location }) => {
            ItemManager.spawn(itemType, location, id);
        });

        emitter.subscribe(GMsgType.playerInfo, ({ id, pos, state, holding, anim, side, armAngle }) => {
            const player = PlayerManager.getPlayerFromID(id);
            if (!player) {
                console.log("Sending non existing playerID: ", id);
                return;
            }
            player.character.setPos(pos);
            if (holding) {
                player.character.equipment.setHolding(ItemManager.getItemFromID(holding)!);
            } else {
                player.character.equipment.setHolding(null);
            }
            player.setState(state);
            player.character.body.direction = side;
            player.character.animator.setAnimation(anim);
            player.character.armFront.angle = armAngle;
        });

        emitter.subscribe(GMsgType.startGame, ({ time }) => {this.onStart(time) });
    }

    public static setStart(e: (t: number) => void) {
        this.onStart = e;
    }

    public static update(): void {
        const localPlayers = PlayerManager.getLocal();
        for (const player of localPlayers) {
            const id = PlayerManager.getPlayerID(player)!;
            let holding = player.character.equipment.getHolding();
            let itemID: number | null = null;
            if (holding) {
                itemID = ItemManager.getItemID(holding)!;
            }
            GameServer.get().sendMessage(GMsgType.playerInfo, {
                id,
                pos: player.character.body.pos,
                state: PlayerState.Standard,
                holding: itemID,
                anim: player.character.animator.getCurrentAnimation(),
                side: player.character.body.direction,
                armAngle: player.character.armFront.angle,
            });
        }
    }

    private static loadMap(map: GameMap): void {
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
        GameServer.get().sendMessage(GMsgType.dataDone, {});
    }

    private static loadMapPlayerSpawns(map: GameMap): void {
        const players = PlayerManager.getPlayers();
        const spawns = map.getRandomSpawnLocations(players.length);
        for (let i = 0; i < players.length; i++) {
            players[i].character.setPos(spawns[i]);
            GameServer.get().sendMessage(GMsgType.playerSpawn, {
                id: PlayerManager.getPlayerID(players[i])!,
                location: spawns[i],
            });
        }
    }

    public static quickLoadForTest(): void {
        const map = MapManager.getMap("defaultMap");
        this.loadMap(map);
        this.loadMapItems(map);
        PlayerManager.addPlayer(true, "0");
        const player = PlayerManager.getPlayerFromID("0")!;
        const spawns = map.getRandomSpawnLocations(1);
        const controls = Utility.File.getControls(0);
        player.character.setPos(spawns[0]);
        player.setControls(controls);
    }

    private static loadMapItems(map: GameMap): void {
        const items = map.getItems();
        for (const item of items) {
            const worldPos = Grid.getWorldPos(item.gridPos);
            const newItem = ItemManager.create(item.type, worldPos);
            if (!newItem) {
                console.log("Could not find: " + item.type);
                continue;
            }
            newItem.common.body.pos.x += (newItem.common.body.width - Grid.size) / 2;
            newItem.common.body.pos.y += newItem.common.body.height;

            const id = ItemManager.getItemID(newItem)!;
            GameServer.get().sendMessage(GMsgType.spawnItem, {
                id,
                itemType: item.type,
                location: newItem.common.body.pos
            });
        }
    }

    private static checkReadyToStart(): void {
        const totalPlayers = PlayerManager.getPlayers().length;
        if (this.readyCount === totalPlayers - 1) {
            const timeToStart = Date.now() + 500;
            GameServer.get().sendMessage(GMsgType.startGame, {
                time: timeToStart
            });
            this.onStart(timeToStart);
        }
    }
}
export { NetworkHandler };