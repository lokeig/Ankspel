import { Vector, Controls } from "../Common/types";
import { Player } from "../DynamicObjects/Player/player";
import { GridHelper } from "./gridHelper";

export class PlayerHandler {
    private static players: Map<string, Set<Player>> = new Map();

    static update(deltaTime: number) {

        for (const playerSet of this.players.values()) {
            for (const player of playerSet) {

                player.update(deltaTime);

                if (player.playerBody.playerItem.holding) {
                    if (player.playerBody.playerItem.holding.shouldBeDeleted()) {
                        player.playerBody.playerItem.holding = null;
                    }
                }
            }
        }

        GridHelper.updateMapPositions<Player>(this.players, e => e.playerBody.dynamicObject.pos);
    }

    public static getPlayers(pos: Vector): Set<Player> | undefined{
        return this.players.get(GridHelper.key(pos));
    }

    public static addPlayer(gridPos: Vector, controls: Controls) {
        const playerSet = this.getPlayers(gridPos);

        const player = new Player(GridHelper.getWorldPos(gridPos), controls);
        player.playerBody.dynamicObject.pos.y += player.playerBody.dynamicObject.height;
        player.playerBody.dynamicObject.pos.x += (player.playerBody.dynamicObject.width - GridHelper.gridSize) / 2;

        if (!playerSet) {
            this.players.set(GridHelper.key(gridPos), new Set());
        } 
        this.getPlayers(gridPos)!.add(player);
    }
 
    public static draw() {
        for (const playerSet of this.players.values()) {
            for (const player of playerSet.values()) {
                player.draw();
            }
        }
    }
}