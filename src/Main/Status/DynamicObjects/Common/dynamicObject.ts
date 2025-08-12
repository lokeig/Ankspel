import { GameObject } from "../../Common/ObjectTypes/gameObject";
import { Vector, Direction } from "../../Common/types";
import { GridHelper } from "../../Grid/gridHelper";
import { TileHandler } from "../../Grid/tileHandler";
import { CollisionObject } from "../../StaticObjects/staticObject";

export class DynamicObject extends GameObject {

    public collidableObjects: Array<CollisionObject> = [];

    public velocity: Vector = { x: 0, y: 0 }
    public grounded: boolean = false;
    public friction: number = 10;
    public gravity: number = 27;
    public ignoreGravity: boolean = false;
    public ignorePlatforms: boolean = false;
    public ignoreFriction: boolean = false;
    public bounceFactor: number = 0;
    public direction: Direction = "left";
    public collisions: Record<string, boolean> = {
        up: false,
        down: false,
        side: false,
    }

    private smallestBounceValue = 1;

    public getDirectionMultiplier(): number {
        return this.direction === "left" ? -1 : 1;
    }

    private handleTopCollision(gameObject: GameObject) {
        this.pos.y = gameObject.pos.y + gameObject.height;
        if (Math.abs(this.velocity.y) > this.smallestBounceValue) {
            this.velocity.y *= -this.bounceFactor;
        } else {
            this.velocity.y = 0;
        }        
    }

    private handleBotCollision(gameObject: GameObject) {
        this.pos.y = gameObject.pos.y - this.height;
        this.grounded = true;

        if (Math.abs(this.velocity.y) > this.smallestBounceValue) {
            this.velocity.y *= -this.bounceFactor;
        } else {
            this.velocity.y = 0;
        }    
    }

    private handleSideCollision(gameObject: GameObject) {
        if (this.velocity.x > 0) {
            this.pos.x = gameObject.pos.x - this.width;
        } else {
            this.pos.x = gameObject.pos.x + gameObject.width;
        }
        if (Math.abs(this.velocity.x) > this.smallestBounceValue) {
            this.velocity.x *= -this.bounceFactor;
        } else {
            this.velocity.x = 0;
        }
    }
 
    public getHorizontalTileCollision(): GameObject | undefined {
        for (const collidable of this.collidableObjects.values()) {
            if (!this.collision(collidable.gameObject)) {
                continue;
            }

            if (collidable.platform) {
                continue;
            }
            
            return collidable.gameObject
        }
    }

    public getVerticalTileCollision(): GameObject | undefined {
        this.grounded = false;
        for (const collidable of this.collidableObjects.values()) {
            if (!this.collision(collidable.gameObject)) {
                continue;
            }

            if (collidable.platform) {
                const bottomPosY = Math.floor(this.pos.y + this.height - this.velocity.y);
                const belowPlatform = bottomPosY > collidable.gameObject.pos.y;
                if (belowPlatform || this.ignorePlatforms) {
                    continue;
                }
            }
            
            return collidable.gameObject;
        }
    }

    private velocityPhysicsUpdate(deltaTime: number) {
        if (!this.ignoreGravity) {
            this.velocity.y += this.gravity * deltaTime; 
        }

        if (!this.ignoreFriction) {
            this.velocity.x *= 1 / (1 + (deltaTime * this.friction));
        }
        if (Math.abs(this.velocity.x) < 0.01) {
            this.velocity.x = 0;
        }
        const maxSpeed = GridHelper.gridSize;
        this.velocity.x = Math.max(Math.min(this.velocity.x, maxSpeed), -maxSpeed);
        this.velocity.y = Math.max(Math.min(this.velocity.y, maxSpeed), -maxSpeed);
    }

    public setNewCollidableObjects() {
        this.collidableObjects = TileHandler.getNearbyTiles(this.pos, this.width, this.height);
    }

    public update(deltaTime: number) {
        this.setNewCollidableObjects();
        this.velocityPhysicsUpdate(deltaTime);
        
        this.collisions.up = false;
        this.collisions.down = false;
        this.collisions.side = false;

        this.pos.x += this.velocity.x;
        const horizontalCollidingTile = this.getHorizontalTileCollision();
        if (horizontalCollidingTile) {
            this.handleSideCollision(horizontalCollidingTile);
            this.collisions.side = true;
        }

        this.pos.y += this.velocity.y;
        const verticalCollidingTile = this.getVerticalTileCollision();
        if (verticalCollidingTile) {
            if (this.velocity.y > 0) {
                this.handleBotCollision(verticalCollidingTile);
                this.collisions.down = true;
            } else {
                this.handleTopCollision(verticalCollidingTile);
                this.collisions.up = true;
            }
        }
    }
}
