import { OnItemCollision, OnItemCollisionType, ThrowType } from "@common";
import { Item } from "../item";
import { DynamicObject } from "@core";
import { Vector } from "@math";
import { CollisionManager } from "@game/Collision/collisionManager";

abstract class BaseProp extends Item {
    private collision = { body: this.body, platform: true };

    constructor(pos: Vector, width: number, height: number, id: number) {
        super(pos, width, height, id);
        CollisionManager.addCollidable(this.collision);
    }

    public setAngle(_to: number): void {
        return;
    }

    public onCollision(deltaTime: number, body: DynamicObject): OnItemCollision[] {
        const offset = 5;
        const minVerticalSpeed = 300;
        const prevPos = this.body.pos.y + this.body.height - this.body.velocity.y * deltaTime;
        if (this.body.velocity.y > minVerticalSpeed && prevPos - offset < body.pos.y) {
            return [{ type: OnItemCollisionType.Headbonk }];
        }
        if (Math.abs(this.body.velocity.x) > Item.MinItemDropSpeed) {
            return [{ type: OnItemCollisionType.Knockback, amount: this.getCollisionKnockback() }];
        }
        return [];
    }

    public handleCollision(collision: OnItemCollision): void {
        switch (collision.type) {
            case OnItemCollisionType.Knockback: {
                this.body.velocity.x *= -this.body.bounceFactor;
                break;
            }
            case OnItemCollisionType.Headbonk: {
                this.body.velocity.y *= -0.5;
                break;
            }
        }
    }

    public setToDelete(): void {
        super.setToDelete();
        CollisionManager.removeCollidable(this.collision);
    }
}

export { BaseProp };