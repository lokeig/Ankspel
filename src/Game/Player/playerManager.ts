import { Grid, Vector } from "@common";
import { Player } from "./player";

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

    public static setPlayerPos(gridPos: Vector) {
        for (const playerSet of this.players.values()) {
            for (const player of playerSet.values()) {
                player.playerBody.dynamicObject.pos = gridPos;
            }
        }
    }

    public static addPlayer(gridPos: Vector, local: boolean) {

        const player = new Player(Grid.getWorldPos(gridPos), local);

        const playerSet = this.getPlayers(gridPos);
        if (!playerSet) {
            this.players.set(Grid.key(gridPos), new Set());
        }
        this.getPlayers(gridPos)!.add(player);

        player.playerBody.dynamicObject.pos.y -= player.playerBody.standardHeight;
        player.playerBody.dynamicObject.pos.x += (Grid.gridSize - player.playerBody.standardWidth) / 2;
        player.playerBody.setArmPosition();
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