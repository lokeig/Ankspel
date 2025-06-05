import { GameObject } from "../../Common/ObjectTypes/gameObject";
import { Vector, Direction } from "../../Common/types";
import { StaticObject } from "../../StaticObjects/staticObject";
import { Item } from "../Items/item";

export class DynamicObject extends GameObject {

    public nearbyTiles: Array<StaticObject> = [];
    public nearbyItems: Array<Item> = [];
    public velocity: Vector = { x: 0, y: 0 };

    public grounded: boolean = false;
    public friction: number = 10;
    public gravity: number = 27;

    public ignoreGravity: boolean = false;
    public ignorePlatforms: boolean = false;
    public direction: Direction = "left";

    constructor(pos: Vector, width: number, height: number) {
        super(pos, width, height);
    }

    public tileCollision(horizontalCollision: boolean): boolean {
        for (const tile of this.nearbyTiles.values()) {
            if (!this.collision(tile)) {
                continue;
            }

            if (!tile.platform) {
                return true;
            }

            if (this.ignorePlatforms || horizontalCollision) {
                continue;
            }
            
            const bottomPosY = Math.floor(this.pos.y + this.height - this.velocity.y);
            const belowPlatform = bottomPosY > tile.pos.y;
            if (belowPlatform) {
                continue;
            }

            return true;
        }
        return false;
    }

    public getDirectionMultiplier(): number {
        return this.direction === "left" ? -1 : 1;
    }

    public handleTopCollision(tile: StaticObject) {
        this.pos.y = tile.pos.y + tile.height;
        this.velocity.x = 0;
    }

    public handleBotCollision(tile: StaticObject) {
        this.pos.x = tile.pos.x + tile.width;
        this.velocity.x = 0;
        this.grounded = true;
    }

    public handleSideCollision(tile: StaticObject) {
        if (this.velocity.x > 0) {
            this.pos.x = tile.pos.x - this.width;
        } else {
            this.pos.x = tile.pos.x + tile.width;
        }
        this.velocity.x = 0;
    }

    public getNearbyItem(): Item | null {
        for (const item of this.nearbyItems.values()) {
            if (this.collision(item)) {
                return item;
            }
        }
        return null;
    }


    public getHorizontalTileCollision(): StaticObject | undefined {
        for (const tile of this.nearbyTiles.values()) {
            if (!this.collision(tile)) {
                continue;
            }

            if (tile.platform) {
                continue;
            }
            
            return tile
        }
    }

    public getVerticalTileCollision(): StaticObject | undefined {
        this.grounded = false;
        for (const tile of this.nearbyTiles.values()) {
            if (!this.collision(tile)) {
                continue;
            }

            if (tile.platform) {
                const bottomPosY = Math.floor(this.pos.y + this.height - this.velocity.y);
                const belowPlatform = bottomPosY > tile.pos.y;
                if (belowPlatform || this.ignorePlatforms) {
                    continue;
                }
            }
            
            return tile;
        }
    }

    velocityPhysicsUpdate(deltaTime: number) {
        if (!this.ignoreGravity) {
            this.velocity.y += this.gravity * deltaTime;
        }

        this.velocity.x *= 1 / (1 + (deltaTime * this.friction));

        this.velocity.x = Math.min(this.velocity.x, 12);
        this.velocity.y = Math.min(this.velocity.y, 12);
    }
}
