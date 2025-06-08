import { GameObject } from "../../Common/ObjectTypes/gameObject";
import { Vector, Direction } from "../../Common/types";
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

    public direction: Direction = "left";

    constructor(pos: Vector, width: number, height: number) {
        super(pos, width, height);
    }

    public getDirectionMultiplier(): number {
        return this.direction === "left" ? -1 : 1;
    }

    public handleTopCollision(gameObject: GameObject) {
        this.pos.y = gameObject.pos.y + gameObject.height;
        this.velocity.y = 0;
    }

    public handleBotCollision(gameObject: GameObject) {
        this.pos.y = gameObject.pos.y - this.height;
        this.velocity.y = 0;
        this.grounded = true;
    }

    public handleSideCollision(gameObject: GameObject) {
        if (this.velocity.x > 0) {
            this.pos.x = gameObject.pos.x - this.width;
        } else {
            this.pos.x = gameObject.pos.x + gameObject.width;
        }
        this.velocity.x = 0;
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

    public velocityPhysicsUpdate(deltaTime: number) {
        if (!this.ignoreGravity) {
            this.velocity.y += this.gravity * deltaTime;
        }

        if (!this.ignoreFriction) {
            this.velocity.x *= 1 / (1 + (deltaTime * this.friction));
        }

        this.velocity.x = Math.min(this.velocity.x, 12);
        this.velocity.y = Math.min(this.velocity.y, 12);
    }
}
