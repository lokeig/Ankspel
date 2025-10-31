import { Grid, Vector } from "@common";
import { Player } from "./player";

class PlayerManager {
    private static players: Map<string, Set<Player>> = new Map();
    private static playersID: Map<string, Player> = new Map();

    static update(deltaTime: number) {
        for (const playerSet of this.players.values()) {
            for (const player of playerSet) {
                player.update(deltaTime);
                if (!player.character.playerItem.holding) {
                    continue;
                }
                if (player.character.playerItem.holding.shouldBeDeleted()) {
                    player.character.playerItem.holding = null;
                }
            }
        }

        Grid.updateMapPositions<Player>(this.players, e => e.character.body.pos);
    }

    private static getPlayerSet(pos: Vector): Set<Player> | undefined {
        return this.players.get(Grid.key(pos));
    }

    public static getPlayers(): Player[] {
        const result: Player[] = [];

        for (const playerSet of this.players.values()) {
            for (const player of playerSet) {
                result.push(player);
            }
        }
        return result;
    }

    public static addPlayer(local: boolean) {
        const pos = { x: 0, y: 0 };
        const player = new Player(pos, local);

        const playerSet = this.getPlayerSet(pos);
        if (!playerSet) {
            this.players.set(Grid.key(pos), new Set());
        }
        this.getPlayerSet(pos)!.add(player);

    }

    public static setPlayerID(playerID: string, player: Player) {
        this.playersID.set(playerID, player);
    }

    public static draw() {
        for (const playerSet of this.players.values()) {
            for (const player of playerSet.values()) {
                player.draw();
            }
        }
    }

    public static getPlayerFromID(ID: string): Player | undefined {
        return this.playersID.get(ID);
    }
}

export { PlayerManager };