import { SpriteSheet } from "../Common/sprite";
import { Vector, Controls } from "../Common/types";
import { Item } from "../DynamicObjects/Items/item";
import { Player } from "../DynamicObjects/Player/player";
import { StaticObject } from "../StaticObjects/staticObject";
import { ItemHandler } from "./itemHandler";
import { TileHandler } from "./tileHandler";



export class PlayerHandler {
    private players: Map<string, Set<Player>> = new Map();
    private gridSize: number;

    constructor(gridSize: number) {
        this.gridSize = gridSize;
    }

    public update(deltaTime: number, tileHandler: TileHandler, itemHandler: ItemHandler) {
        for (const playerArray of this.players.values()) {
            for (const player of playerArray) {
                this.setNearby(player, tileHandler, itemHandler);
                player.update(deltaTime);
            }
        }
    }

    public draw(ctx: CanvasRenderingContext2D) {
        for (const playerArray of this.players.values()) {
            for (const player of playerArray) {
                player.draw(ctx);
            }
        }
    }


    private getGridPos(pos: Vector): Vector {
        return { x: Math.floor(pos.x / this.gridSize), y: Math.floor(pos.y / this.gridSize) }
    }

    private getWorldPos(gridPos: Vector): Vector {
        return { x: gridPos.x * this.gridSize, y: gridPos.y * this.gridSize } 
    }

    private key(pos: Vector): string {
        return `${pos.x},${pos.y}`;
    }

    private getPlayers(pos: Vector): Set<Player> | undefined{
        return this.players.get(this.key(pos));
    }

    private setNearby(player: Player, tileHandler: TileHandler, itemHandler: ItemHandler): void {        
        const nearbyTiles: Array<StaticObject> = [];
        const nearbyItems: Array<Item> = [];

        const gridOffset = this.gridSize * 2;
        let posX = player.playerObject.pos.x - gridOffset;
        let posY = player.playerObject.pos.y - gridOffset;

        while (posX < player.playerObject.pos.x + player.playerObject.width + gridOffset) {
            posY = player.playerObject.pos.y - gridOffset;

            while (posY < player.playerObject.pos.y + player.playerObject.height + gridOffset) {

                const gridPos = this.getGridPos({ x: posX, y: posY });

                const tile = tileHandler.getTile(gridPos);
                const itemArray = itemHandler.getItems(gridPos);

                this.addNearbyTile(tile, nearbyTiles);
                this.addNearbyItem(itemArray, nearbyItems);


                posY += this.gridSize;
            }
            posX += this.gridSize;
        }
        player.playerObject.nearbyTiles = nearbyTiles;
        player.playerObject.nearbyItems = nearbyItems;
    }

    private addNearbyTile(tile: StaticObject | undefined, nearbyTiles: Array<StaticObject>) {
        if (!tile) {
            return;
        }

        nearbyTiles.push(tile)

        if (tile.lipLeft)  {
            nearbyTiles.push(tile.lipLeft);
        }
        if (tile.lipRight) {
            nearbyTiles.push(tile.lipRight);
        }
    }

    private addNearbyItem(itemArray: Set<Item> | undefined, nearbyItems: Array<Item>) {
        if (!itemArray) {
            return;
        }


        for (const item of itemArray) {
            nearbyItems.push(item)
        }
    }

    addPlayer(gridPos: Vector, controls: Controls, imgSrc: string) {

        const playerSet = this.getPlayers(gridPos);

        const player = new Player(this.getWorldPos(gridPos), new SpriteSheet(imgSrc, 32), controls);
        player.playerObject.pos.y += player.playerObject.height;
        player.playerObject.pos.x += (player.playerObject.width - this.gridSize) / 2;

        if (!playerSet) {
            this.players.set(this.key(gridPos), new Set());
        } 

        this.getPlayers(gridPos)!.add(player);
    }
}