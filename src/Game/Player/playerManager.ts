import { Grid, Vector } from "@common";
import { Player } from "./player";

class PlayerManager {
    private static players: Map<string, Set<Player>> = new Map();

    private static localPlayers: Player[] = [];
    private static currentLocalCount = 0;

    private static IDToPlayer: Map<string, Player> = new Map();
    private static playerToID: Map<Player, string> = new Map();

    static update(deltaTime: number) {
        for (const playerSet of this.players.values()) {
            for (const player of playerSet) {
                player.update(deltaTime);
                if (!player.character.equipment.isHolding()) {
                    continue;
                }
                if (player.character.equipment.getHolding().shouldBeDeleted()) {
                    player.character.equipment.setHolding(null);
                }
            }
        }

        Grid.updateMapPositions<Player>(this.players, e => e.character.body.pos);
    }

    private static getPlayerSet(pos: Vector): Set<Player> | undefined {
        return this.players.get(Grid.key(pos));
    }

    public static getLocal(): Player[] {
        return this.localPlayers;
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

    public static addPlayer(local: boolean, id: string): Player {
        const pos = new Vector();
        const player = new Player(local);

        const playerSet = this.getPlayerSet(pos);
        if (!playerSet) {
            this.players.set(Grid.key(pos), new Set());
        }
        this.getPlayerSet(pos)!.add(player);

        if (local) {
            this.localPlayers[this.currentLocalCount++] = player;
        }
        this.IDToPlayer.set(id, player);
        this.playerToID.set(player, id);
        return player;
    }

    public static draw() {
        for (const playerSet of this.players.values()) {
            for (const player of playerSet.values()) {
                player.draw();
            }
        }
    }

    public static getPlayerFromID(ID: string): Player | undefined {
        return this.IDToPlayer.get(ID);
    }

    public static getPlayerID(player: Player): string | undefined {
        return this.playerToID.get(player);
    }
}

export { PlayerManager };