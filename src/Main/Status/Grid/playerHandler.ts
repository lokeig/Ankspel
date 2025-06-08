import { Vector, Controls } from "../Common/types";
import { Item } from "../DynamicObjects/Items/item";
import { Player } from "../DynamicObjects/Player/player";
import { CollisionObject, StaticObject } from "../StaticObjects/staticObject";
import { ItemHandler } from "./itemHandler";
import { TileHandler } from "./tileHandler";

export class PlayerHandler {
    private static players: Map<string, Set<Player>> = new Map();
    private static gridSize: number;

    static init(gridSize: number) {
        this.gridSize = gridSize;
    }

    static update(deltaTime: number) {
        const movedPlayers: Map<string, Set<Player>> = new Map();

        for (const [key, playerSet] of this.players.entries()) {
            for (const player of playerSet) {

                this.setNearby(player);
                player.update(deltaTime);

                const newKey = this.key(this.getGridPos(player.playerBody.dynamicObject.pos));

                if (key !== newKey) {

                    playerSet.delete(player);

                    if (!movedPlayers.has(newKey)) {
                        movedPlayers.set(newKey, new Set());
                    }
                    movedPlayers.get(newKey)!.add(player);
                }
            }

            if (playerSet.size === 0) {
                this.players.delete(key);
            }
        }

        // Merges moved items into items Map
        for (const [newKey, playerSet] of movedPlayers.entries()) {
            if (!this.players.has(newKey)) {
                this.players.set(newKey, new Set());
            }
            for (const item of playerSet) {
                this.players.get(newKey)!.add(item);
            }
        }
    }

    private static getGridPos(pos: Vector): Vector {
        return { x: Math.floor(pos.x / this.gridSize), y: Math.floor(pos.y / this.gridSize) }
    }

    private static getWorldPos(gridPos: Vector): Vector {
        return { x: gridPos.x * this.gridSize, y: gridPos.y * this.gridSize } 
    }

    private static key(pos: Vector): string {
        return `${pos.x},${pos.y}`;
    }

    public static getPlayers(pos: Vector): Set<Player> | undefined{
        return this.players.get(this.key(pos));
    }

    private static setNearby(player: Player): void {
        const nearbyCollidable: CollisionObject[] = [];
        const nearbyItems: Item[] = [];
    
        const body = player.playerBody.dynamicObject;
        const startX = body.pos.x - this.gridSize * 2;
        const endX = body.pos.x + body.width + this.gridSize * 2;
        const startY = body.pos.y - this.gridSize * 2;
        const endY = body.pos.y + body.height + this.gridSize * 2;
    
        for (let x = startX; x < endX; x += this.gridSize) {
            for (let y = startY; y < endY; y += this.gridSize) {
                const gridPos = this.getGridPos({ x, y });
    
                this.processTile(TileHandler.getTile(gridPos), nearbyCollidable);
                this.processItems(ItemHandler.getItems(gridPos), nearbyCollidable, nearbyItems);
            }
        }
    
        body.collidableObjects = nearbyCollidable;
        player.playerBody.playerItem.nearbyItems = nearbyItems;
    }

    private static processTile(tile: StaticObject | undefined, accumulatedCollidable: Array<CollisionObject>): void {
        if (!tile) return;
    
        accumulatedCollidable.push({ gameObject: tile, platform: tile.platform });
    
        if (tile.lipLeft) {
            accumulatedCollidable.push({ gameObject: tile.lipLeft, platform: true });
        }
    
        if (tile.lipRight) {
            accumulatedCollidable.push({ gameObject: tile.lipRight, platform: true });
        }
    }

    private static processItems(itemArray: Set<Item> | undefined,  accumulatedCollidable: Array<CollisionObject>, accumulatedItems: Array<Item>): void {
        if (!itemArray) return;
    
        for (const item of itemArray.values()) {
            if (item.collidable) {
                accumulatedCollidable.push({ gameObject: item.dynamicObject, platform: true });
            } 
            accumulatedItems.push(item);
        }
    }

    public static addPlayer(gridPos: Vector, controls: Controls) {
        const playerSet = this.getPlayers(gridPos);

        const player = new Player(this.getWorldPos(gridPos), controls);
        player.playerBody.dynamicObject.pos.y += player.playerBody.dynamicObject.height;
        player.playerBody.dynamicObject.pos.x += (player.playerBody.dynamicObject.width - this.gridSize) / 2;

        if (!playerSet) {
            this.players.set(this.key(gridPos), new Set());
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