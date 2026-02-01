import { Grid, Utility, Vector } from "@common";
import { Player } from "./player";
import { IDManager } from "@game/Common/IDManager/idManager";
import { Connection, GameMessage } from "@server";

class PlayerManager {
    private static players: Map<string, Set<Player>> = new Map();
    private static idManager = new IDManager<Player>();
    private static localPlayerCount = 0;

    static update(deltaTime: number) {
        const pending: Player[] = [];

        const updatePlayer = (player: Player) => {
            player.update(deltaTime);
            player.character.equipment.getAllEquippedItems().forEach((item, slot) => {
                if (item && item.shouldBeDeleted()) {
                    player.character.equipment.equip(null, slot);
                }
            })
        };
        this.getPlayers().forEach(player => {
            if (player.held()) {
                pending.push(player);
                return;
            }
            updatePlayer(player);
        });
        pending.forEach(updatePlayer);
        Grid.updateMapPositions<Player>(this.players, player => player.character.body.pos);
    }

    public static reset(): void {
        this.getPlayers().forEach(player => {
            player.reset();
        });
    }

    public static getLocal(): Player[] {
        const result: Player[] = [];
        this.players.forEach(playerSet => { playerSet.forEach(player => { if (player.character.isLocal()) { result.push(player); } }) });
        return result;
    }

    public static getPlayers(): Player[] {
        const result: Player[] = [];
        this.players.forEach(playerSet => { playerSet.forEach(player => { result.push(player); }) });
        return result;
    }

    public static create(): Player {
        const player = new Player(this.idManager.getNextID(), Utility.File.getControls(this.localPlayerCount++));
        const id = this.idManager.add(player);
        this.addPlayer(player);
        Connection.get().sendGameMessage(GameMessage.NewPlayer, ({ id }));

        return player;
    }

    public static spawn(id: number): Player {
        const player = new Player(id);
        this.idManager.setID(player, id);
        this.addPlayer(player);
        return player;
    }

    private static addPlayer(player: Player) {
        const pos = Grid.key(new Vector());
        const playerSet = this.players.get(pos);
        if (!playerSet) {
            this.players.set(pos, new Set());
        }
        this.players.get(pos)!.add(player);
    }

    public static draw() {
        this.getPlayers().forEach(player => {
            if (!player.held()) {
                player.draw();
            }
        })
    }

    public static getPlayerFromID(ID: number): Player | undefined {
        return this.idManager.getObject(ID);
    }

    public static getPlayerID(player: Player): number | undefined {
        return this.idManager.getID(player);
    }
}

export { PlayerManager };