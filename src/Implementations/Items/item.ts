import { Vector } from "@math";
import { EquipmentSlot, OnItemCollision, OnItemCollisionType, PlayerState, ProjectileEffect, ThrowType } from "@common";
import { DynamicObject } from "@core";
import { ItemPlayerInteraction } from "@game/Item/ItemPlayerUse/itemUseInteractions";
import { IItem, ItemAngleHelper, ItemIgnore, ItemInfo, ItemPhysics, ItemPlayerCollision, ItemProjectileCollision, OnItemUseType, Ownership } from "@item";
import { AudioManager, Sound } from "@game/Audio";
import { zIndex } from "@render";

abstract class Item implements IItem {
    private static emptyVector = new Vector;
    protected static readonly MinItemDropSpeed: number = 300;

    public body: DynamicObject;
    public angle = new ItemAngleHelper;
    public ownership: Ownership = Ownership.None;

    private physics: ItemPhysics;
    private delete: boolean = false;

    public info: ItemInfo;

    public playerCollision: ItemPlayerCollision;
    public projectileCollision: ItemProjectileCollision;
    public playerInteractions = new ItemPlayerInteraction;

    public ignoring = new ItemIgnore;

    constructor(pos: Vector, width: number, height: number, id: number) {
        this.body = new DynamicObject(pos, width, height);
        this.info = {
            id,
            handOffset: Item.emptyVector,
            holdOffset: Item.emptyVector,
            weightFactor: 1
        }
        this.physics = new ItemPhysics(this.body, this.angle);
        this.playerCollision = new ItemPlayerCollision(id, this.onCollision.bind(this), this.handleCollision.bind(this));
        this.playerInteractions.setOnPlayerState(PlayerState.Ragdoll, () => { return [{ type: OnItemUseType.Unequip, value: EquipmentSlot.Hand }] });
        this.projectileCollision = new ItemProjectileCollision(this.body, this.info.id, 0, () => { }, () => false);
    }

    public setProjectileCollision(resistence: number, onHit: (effect: ProjectileEffect, pos: Vector, local: boolean) => void, enabled: () => boolean) {
        this.projectileCollision = new ItemProjectileCollision(this.body, this.info.id, resistence, onHit, enabled);
    }

    public getCollisionKnockback(): Vector {
        return new Vector(-this.body.velocity.x * (1.5 - this.info.weightFactor), Math.abs(this.body.velocity.x) * (1.5 - this.info.weightFactor) * 0.5);
    }

    public update(deltaTime: number): void {
        const prevGrounded = this.body.grounded;
        const prevVelocity = Math.abs(this.body.velocity.y);

        this.ignoring.update(deltaTime);
        this.physics.update(deltaTime, this.ownership);

        const audioLandThreshold = 100;
        if (this.body.grounded && !prevGrounded && prevVelocity > audioLandThreshold) {
            AudioManager.get().play(Sound.land);
        }
    }

    public onCollision(_deltaTime: number, _body: DynamicObject): OnItemCollision[] {
        if (Math.abs(this.body.velocity.x) > Item.MinItemDropSpeed) {
            return [{ type: OnItemCollisionType.Knockback, amount: this.getCollisionKnockback() }];
        }
        return [];
    }

    public setAngle(to: number): void {
        this.angle.worldAngle = to;
    }

    public getAngle(): number {
        return this.angle.localAngle + this.angle.worldAngle;
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

    protected getDrawPos(drawSize: number | Vector, offset: Vector = new Vector): Vector {
        let drawWidth: number = drawSize as number;
        let drawHeight: number = drawSize as number;
        if (drawSize instanceof Vector) {
            drawWidth = drawSize.x;
            drawHeight = drawSize.y;
        }
        const result = new Vector(
            this.body.pos.x + ((this.body.width - drawWidth) / 2),
            this.body.pos.y + ((this.body.height - drawHeight) / 2)
        );
        if (offset) {
            result.x -= offset.x / 2;
            result.y -= offset.y / 2;
        }
        return result;
    }

    public enabled(): boolean {
        return true;
    }

    public throw(throwType: ThrowType): void {
        this.body.grounded = false;
        const direcMult = this.body.getDirectionMultiplier();

        if (this.body.getCollidingTile()) {
            return;
        }

        switch (throwType) {
            case (ThrowType.Light): {
                this.body.velocity.set(210 * direcMult, -210);
                this.angle.rotateSpeed = 10;
                break;
            }
            case (ThrowType.Hard): {
                this.body.velocity.set(900 * direcMult, -300);
                this.angle.rotateSpeed = 15;
                break;
            }
            case (ThrowType.HardDiagonal): {
                this.body.velocity.set(900 * direcMult, -600);
                this.angle.rotateSpeed = 15;
                break;
            }
            case (ThrowType.Drop): {
                this.body.velocity.set(0 * direcMult, 0);
                this.angle.rotateSpeed = 5;
                break;
            }
            case (ThrowType.Upwards): {
                this.body.velocity.set(0 * direcMult, -600);
                this.angle.rotateSpeed = 8;
                break;
            }
        }
    }

    public shouldBeDeleted(): boolean {
        return this.delete;
    };

    protected deleteHelper(): boolean {
        return this.ownership === Ownership.None && Math.abs(this.body.velocity.x) < 50 && this.body.grounded;
    }

    public setToDelete(): void {
        this.projectileCollision.disable();
        this.delete = true;
    };

    protected getZIndex(): number {
        switch (this.ownership) {
            case (Ownership.Equipped): {
                return zIndex.Player;
            };
            case (Ownership.Held): {
                return zIndex.Player;
            }
            case (Ownership.InSpawner): {
                return zIndex.Spawners;
            }
            case (Ownership.None): {
                return zIndex.Items;
            }
        }
    }

    public abstract draw(): void;
}

export { Item };