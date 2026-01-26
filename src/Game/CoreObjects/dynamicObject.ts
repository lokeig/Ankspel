import { Vector, Side } from "@common";
import { TileManager } from "../StaticObjects/Tiles";
import { CollisionObject } from "./collisionObject";
import { GameObject } from "./gameObject";

class DynamicObject extends GameObject {
    private collidableObjects: Array<CollisionObject> = [];
    public grounded: boolean = false;
    public collidingSide: boolean = false;
    public collidingUp: boolean = false;

    public friction: number = 10;
    public frictionMultiplier = 1;
    public ignoreFriction: boolean = false;

    public velocity = new Vector();
    public gravity: number = 1260;
    public ignoreGravity: boolean = false;
    public ignorePlatforms: boolean = false;

    public direction: Side = Side.Left;
    public bounceFactor: number = 0;
    private smallestBounceValue = 1;


    constructor(pos: Vector, width: number, height: number) {
        super(pos, width, height);
    }

    public getDirectionMultiplier(): number {
        return this.direction === Side.Left ? -1 : 1;
    }

    public isFlip(): boolean {
        return this.direction === Side.Left;
    }

    public collided(): boolean {
        return this.grounded || this.collidingSide || this.collidingUp;
    }

    public update(deltaTime: number) {
        this.velocityPhysicsUpdate(deltaTime);
        const nextpos = this.pos.clone().add(this.velocity.clone().multiply(deltaTime));
        this.collidableObjects = TileManager.getNearby(this.pos, this.width, this.height, nextpos);
        this.updatePositions(deltaTime);
    }

    private velocityPhysicsUpdate(deltaTime: number) {
        if (!this.ignoreGravity) {
            this.velocity.y += this.gravity * deltaTime;
        }
        if (!this.ignoreFriction) {
            this.velocity.x *= 1 / (1 + (deltaTime * this.friction * this.frictionMultiplier));
        }
        if (Math.abs(this.velocity.x) < 0.01) {
            this.velocity.x = 0;
        }
    }

    public updatePositions(deltaTime: number) {
        this.pos.x = this.pos.x + this.velocity.x * deltaTime;
        const horizontalCollidingTile = this.getHorizontalTileCollision();
        if (horizontalCollidingTile) {
            this.handleSideCollision(horizontalCollidingTile);
        }
        this.pos.y = this.pos.y + this.velocity.y * deltaTime;
        const verticalCollidingTile = this.getVerticalTileCollision();
        if (verticalCollidingTile) {
            if (this.velocity.y > 0) {
                this.handleBotCollision(verticalCollidingTile);
            } else {
                this.handleTopCollision(verticalCollidingTile);
            }
        }
    }

    public getHorizontalTileCollision(): GameObject | undefined {
        this.collidingSide = false;
        for (const collidable of this.collidableObjects) {
            if (!this.collision(collidable.gameObject) || collidable.platform) {
                continue;
            }
            return collidable.gameObject
        }
    }

    public getVerticalTileCollision(): GameObject | undefined {
        this.grounded = false;
        this.collidingUp = false;
        for (const collidable of this.collidableObjects) {
            if (!this.collision(collidable.gameObject)) {
                continue;
            }
            if (!collidable.platform) {
                return collidable.gameObject;
            }
            if (this.ignorePlatforms || this.velocity.y < 0) {
                continue;
            }
            if (this.pos.y + this.height > collidable.gameObject.pos.y + 5 + 0) {
                continue;
            }
            return collidable.gameObject;
        }
    }

    private handleSideCollision(gameObject: GameObject) {
        this.collidingSide = true;

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

    private handleTopCollision(gameObject: GameObject) {
        this.pos.y = gameObject.pos.y + gameObject.height;
        this.collidingUp = true;
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

    public getNearbyTiles(): GameObject[] {
        return this.collidableObjects.map(t => t.gameObject);
    }

    public setNewCollidableObjects() {
        this.collidableObjects = TileManager.getNearby(this.pos, this.width, this.height);
    }

    public onPlatform(): boolean {
        if (!this.grounded) {
            return false;
        }

        return this.collidableObjects.every(tile =>
            !this.collision(tile.gameObject.scale(0, 5)) || tile.platform
        );
    }
}

export { DynamicObject };