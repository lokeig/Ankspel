import { Grid, Utility, Vector } from "@common";
import { Player } from "./player";
import { IDManager } from "@game/Common/IDManager/idManager";
import { Connection, GameMessage } from "@server";

class PlayerManager {
    private static players: Map<string, Set<Player>> = new Map();
    private static idManager = new IDManager<Player>();
    private static localPlayerCount = 0;

    static update(deltaTime: number) {
        this.players.forEach(playerSet => playerSet.forEach(player => {
            player.update(deltaTime);
            if (!player.character.equipment.isHolding()) {
                return;
            }
            if (player.character.equipment.getHolding().shouldBeDeleted()) {
                player.character.equipment.setHolding(null);
            }
        }));
        Grid.updateMapPositions<Player>(this.players, e => e.character.body.pos);
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
        const player = new Player();
        const id = this.idManager.add(player);
        this.addPlayer(player);
        player.setControls(Utility.File.getControls(this.localPlayerCount++));
        Connection.get().sendGameMessage(GameMessage.newPlayer, ({ id }));
        return player;
    }

    public static spawn(id: number): Player {
        const player = new Player();
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
        for (const playerSet of this.players.values()) {
            for (const player of playerSet.values()) {
                player.draw();
            }
        }
    }

    public static getPlayerFromID(ID: number): Player | undefined {
        return this.idManager.getObject(ID);
    }

    public static getPlayerID(player: Player): number | undefined {
        return this.idManager.getID(player);
    }
}

export { PlayerManager };