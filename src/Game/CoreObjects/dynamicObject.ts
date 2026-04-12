import { Side } from "@common";
import { TileManager } from "../Tiles";
import { GameObject } from "./gameObject";
import { Vector } from "@math";
import { CollisionObject } from "@game/Collision";
import { CollisionManager } from "@game/Collision/collisionManager";

class DynamicObject extends GameObject {
    private collidableObjects: Array<CollisionObject> = [];
    public grounded: boolean = false;

    public friction: number = 10;
    public frictionMultiplier = 1;
    public ignoreFriction: boolean = false;

    public velocity = new Vector();
    public gravity: number = 1700;
    public ignoreGravity: boolean = false;
    public ignorePlatforms: boolean = false;

    public direction: Side = Side.Left;
    public bounceFactor: number = 0;
    private smallestBounceValue = 1;

    private prevSideCollision: boolean = false;
    private prevHeadCollision: boolean = false;
    private prevGrounded: boolean = false;

    public onSideCollision: () => void = () => { };
    public onSideLeave: () => void = () => { };
    public onHeadCollision: () => void = () => { };
    public onBottomCollision: () => void = () => { };

    constructor(pos: Vector, width: number, height: number) {
        super(pos, width, height);
    }

    public getDirectionMultiplier(): number {
        return this.direction === Side.Left ? -1 : 1;
    }

    public isFlip(): boolean {
        return this.direction === Side.Left;
    }


    public update(deltaTime: number) {
        this.velocityPhysicsUpdate(deltaTime);
        const nextpos = this.pos.clone().add(this.velocity.clone().multiply(deltaTime));
        this.collidableObjects = CollisionManager.getNearby(this.pos, this.width, this.height, nextpos);
        this.updatePositions(deltaTime);
    }

    private velocityPhysicsUpdate(deltaTime: number) {
        if (!this.ignoreGravity) {
            this.velocity.y += this.gravity * deltaTime;
        }
        if (!this.ignoreFriction) {
            this.velocity.x *= 1 / (1 + (deltaTime * this.friction * this.frictionMultiplier));
        }
        if (Math.abs(this.velocity.x) < 0.1) {
            this.velocity.x = 0;
        }
        if (Math.abs(this.velocity.y) < 0.1) {
            this.velocity.y = 0;
        }
    }

    public updatePositions(deltaTime: number) {
        this.pos.x += this.velocity.x * deltaTime;
        const horizontalCollidingTile = this.getCollidingTile();
        if (horizontalCollidingTile) {
            this.handleSideCollision(horizontalCollidingTile);
        } else {
            if (this.prevSideCollision) {
                this.onSideLeave();
            }
            this.prevSideCollision = false;
        }
        this.pos.y += this.velocity.y * deltaTime;
        const verticalCollidingTile = this.getVerticalTileCollision(deltaTime);
        if (verticalCollidingTile) {
            if (this.velocity.y === 0) {
                if (this.pos.y + this.height / 2 > verticalCollidingTile.pos.y + verticalCollidingTile.height / 2) {
                    this.velocity.y = -1;
                } else {
                    this.velocity.y = 1;
                }
            }
            if (this.velocity.y > 0) {
                this.handleBotCollision(verticalCollidingTile);
                this.prevHeadCollision = false;
            } else {
                this.handleTopCollision(verticalCollidingTile);
                this.prevGrounded = false;
            }
        } else {
            this.prevHeadCollision = false;
            this.prevGrounded = false;
        }
    }

    public getCollidingTile(): GameObject | undefined {
        for (const collidable of this.collidableObjects) {
            if (!this.collision(collidable.body) || collidable.platform) {
                continue;
            }
            return collidable.body;
        }
    }

    private getVerticalTileCollision(deltaTime: number): GameObject | undefined {
        this.grounded = false;
        for (const collidable of this.collidableObjects) {
            if (!this.collision(collidable.body)) {
                continue;
            }
            if (!collidable.platform) {
                return collidable.body;
            }
            if (this.ignorePlatforms || this.velocity.y < 0) {
                continue;
            }
            if (this.pos.y - (this.velocity.y * deltaTime) + this.height > collidable.body.pos.y) {
                continue;
            }
            return collidable.body;
        }
    }

    private handleSideCollision(gameObject: GameObject): void {
        if (this.velocity.x === 0) {
            if (this.pos.x + this.width / 2 > gameObject.pos.x + gameObject.width / 2) {
                this.velocity.x = -1;
            } else {
                this.velocity.x = 1;
            }
        }
        if (this.velocity.x > 0) {
            this.pos.x = gameObject.pos.x - this.width;
        } else {
            this.pos.x = gameObject.pos.x + gameObject.width;
        }
        if (!this.prevSideCollision) {
            this.onSideCollision();
            this.prevSideCollision = true;
        }
        if (Math.abs(this.velocity.x) > this.smallestBounceValue) {
            this.velocity.x *= -this.bounceFactor;
        } else {
            this.velocity.x = 0;
        }
    }

    private handleTopCollision(gameObject: GameObject) {
        this.pos.y = gameObject.pos.y + gameObject.height;
        if (!this.prevHeadCollision) {
            this.onHeadCollision();
            this.prevHeadCollision = true;
        }
        if (Math.abs(this.velocity.y) > this.smallestBounceValue) {
            this.velocity.y *= -this.bounceFactor;
        } else {
            this.velocity.y = 0;
        }
    }

    private handleBotCollision(gameObject: GameObject) {
        this.pos.y = gameObject.pos.y - this.height;
        this.grounded = true;
        if (!this.prevGrounded) {
            this.onBottomCollision();
            this.prevGrounded = true;
        }
        if (Math.abs(this.velocity.y) > this.smallestBounceValue) {
            this.velocity.y *= -this.bounceFactor;
        } else {
            this.velocity.y = 0;
        }
    }

    public getNearbyTiles(): GameObject[] {
        return this.collidableObjects.map(t => t.body);
    }

    public setNewCollidableObjects() {
        this.collidableObjects = CollisionManager.getNearby(this.pos, this.width, this.height);
    }

    public onPlatform(): boolean {
        if (!this.grounded) {
            return false;
        }
        return this.collidableObjects.every(tile =>
            !this.collision(tile.body.scale(0, 5)) || tile.platform
        );
    }
}

export { DynamicObject };
