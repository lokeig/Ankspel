import { Grid, Vector } from "@common";
import { Player } from "./player";
import { PlayerBody } from "./Body/playerBody";

class PlayerManager {
    private static players: Map<string, Set<Player>> = new Map();
    private static playersID: Map<string, Player> = new Map();

    static update(deltaTime: number) {
        for (const playerSet of this.players.values()) {
            for (const player of playerSet) {
                player.update(deltaTime);
                if (!player.playerBody.playerItem.holding) {
                    continue;
                }
                if (player.playerBody.playerItem.holding.shouldBeDeleted()) {
                    player.playerBody.playerItem.holding = null;
                }
            }
        }

        Grid.updateMapPositions<Player>(this.players, e => e.playerBody.dynamicObject.pos);
    }

    public static getPlayers(pos: Vector): Set<Player> | undefined {
        return this.players.get(Grid.key(pos));
    }

    public static addPlayer(gridPos: Vector, local: boolean) {

        const pos = Grid.getWorldPos(gridPos);
        pos.y -= PlayerBody.standardHeight;
        pos.x -= PlayerBody.standardWidth / 2;
        const player = new Player(pos, local);

        const playerSet = this.getPlayers(gridPos);
        if (!playerSet) {
            this.players.set(Grid.key(gridPos), new Set());
        }
        this.getPlayers(gridPos)!.add(player);

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