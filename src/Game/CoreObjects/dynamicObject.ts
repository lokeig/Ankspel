import { Vector, Side } from "@common";
import { TileManager } from "../StaticObjects/Tiles";
import { CollisionObject } from "./collisionObject";
import { GameObject } from "./gameObject";

class DynamicObject extends GameObject {
    private collidableObjects: Array<CollisionObject> = [];
    public grounded: boolean = false;
    public collisions: Record<string, boolean> = {
        up: false,
        side: false,
    }
    public friction: number = 10;
    public frictionMultiplier = 1;
    public ignoreFriction: boolean = false;

    public velocity = new Vector();
    public gravity: number = 1260;
    public ignoreGravity: boolean = false;
    public ignorePlatforms: boolean = false;

    public direction: Side = Side.left;

    public bounceFactor: number = 0;
    private smallestBounceValue = 1;

    public getDirectionMultiplier(): number {
        return this.direction === Side.left ? -1 : 1;
    }

    public isFlip(): boolean {
        return this.direction === Side.left;
    }

    public collided(): boolean {
        return this.grounded || this.collisions.side || this.collisions.up;
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
        for (const collidable of this.collidableObjects) {
            if (!this.collision(collidable.gameObject)) {
                continue;
            }
            if (collidable.platform) {
                continue;
            }
            return collidable.gameObject
        }
    }

    public getVerticalTileCollision(deltaTime: number): GameObject | undefined {
        this.grounded = false;
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
            if (this.pos.y + this.height > collidable.gameObject.pos.y + 5 + (this.velocity.y * deltaTime)) {
                continue;
            }
            return collidable.gameObject;
        }
    }

    public setNewCollidableObjects() {
        this.collidableObjects = TileManager.getNearbyTiles(this.pos, this.width, this.height);
    }

    public velocityPhysicsUpdate(deltaTime: number) {
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
        this.collisions.up = false;
        this.collisions.side = false;

        this.pos.x += this.velocity.x * deltaTime;
        const horizontalCollidingTile = this.getHorizontalTileCollision();
        if (horizontalCollidingTile) {
            this.handleSideCollision(horizontalCollidingTile);
            this.collisions.side = true;
        }

        this.pos.y += this.velocity.y * deltaTime;
        const verticalCollidingTile = this.getVerticalTileCollision(deltaTime);
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

    public update(deltaTime: number) {
        this.setNewCollidableObjects();
        this.velocityPhysicsUpdate(deltaTime);
        this.updatePositions(deltaTime);
    }

    public onPlatform(): boolean {
        if (!this.grounded) {
            return false;
        }

        let allPlatforms = true;
        let noCollisions = true;

        const prevPosY = this.pos.y;
        this.pos.y += 5;

        for (const collidable of this.collidableObjects.values()) {
            if (!this.collision(collidable.gameObject)) {
                continue
            }
            noCollisions = false;
            if (!collidable.platform) {
                allPlatforms = false;
            }
        }

        this.pos.y = prevPosY;

        return !noCollisions && allPlatforms;
    }
}

export { DynamicObject };