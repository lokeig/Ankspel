import { Controls } from "../../../Common/Types/controls";
import { Vector } from "../../../Common/Types/vector";
import { Player } from "./player";
import { Grid } from "../../../Common/grid";

export class PlayerManager {
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

    public static getPlayers(pos: Vector): Set<Player> | undefined{
        return this.players.get(Grid.key(pos));
    }

    public static setPlayerPos(gridPos: Vector) {
        for (const playerSet of this.players.values()) {
            for (const player of playerSet.values()) {
                player.playerBody.dynamicObject.pos = gridPos;
            }
        }
    }

    public static addPlayer(gridPos: Vector, controls: Controls, id: string) {
        const playerSet = this.getPlayers(gridPos);

        const player = new Player(Grid.getWorldPos(gridPos), controls, id);
        player.playerBody.dynamicObject.pos.y += player.playerBody.dynamicObject.height;
        player.playerBody.dynamicObject.pos.x += (player.playerBody.dynamicObject.width - Grid.gridSize) / 2;
        if (!playerSet) {
            this.players.set(Grid.key(gridPos), new Set());
        } 
        this.getPlayers(gridPos)!.add(player);
        this.playersID.set(id, player);
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