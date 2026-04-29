import { Vector } from "@math";
import { EquipmentSlot, OnItemCollision, OnItemCollisionType, PlayerState, ProjectileEffect, ProjectileEffectType, ThrowType, Utility } from "@common";
import { DynamicObject } from "@core";
import { ItemPlayerInteraction } from "@game/Item/ItemPlayerUse/itemUseInteractions";
import { IItem, ItemAngleHelper, ItemIgnore, ItemInfo, ItemPhysics, ItemPlayerCollision, ItemProjectileCollision, OnItemUseType, Ownership } from "@item";
import { AudioManager, Sound } from "@game/Audio";
import { zIndex } from "@render";
import { addSmokeCloud, ParticleManager, Smoke } from "@game/Particles";

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
    public projectileCollision: ItemProjectileCollision | null = null;
    public playerInteractions = new ItemPlayerInteraction;

    public ignoring = new ItemIgnore;
    public currentSlot: EquipmentSlot = EquipmentSlot.Hand;

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
        this.playerInteractions.setOnPlayerState(PlayerState.Ragdoll, () => { return [{ type: OnItemUseType.Unequip, value: this.currentSlot }] });
        this.playerInteractions.setOnPlayerState(PlayerState.Net, () => { return [{ type: OnItemUseType.Unequip, value: this.currentSlot }] });

        this.body.onBottomCollision = () => {
            const audioLandThreshold = 100;
            if (this.body.velocity.y > audioLandThreshold) {
                AudioManager.get().play(Sound.land);
            }
        }
        this.body.onSideCollision = () => AudioManager.get().play(Sound.wallTouch);
        this.body.onSideLeave = () => AudioManager.get().play(Sound.wallLeave);
    }

    public setProjectileCollision(
        resistence: number,
        onHit: (effect: ProjectileEffect, pos: Vector, local: boolean) => void,
        enabled: () => boolean,
        interactions: () => ProjectileEffectType[]
    ) {
        this.projectileCollision = new ItemProjectileCollision(this.body, this.info.id, resistence, onHit, enabled, interactions);
    }

    public getCollisionKnockback(): Vector {
        return new Vector(-this.body.velocity.x * (1.5 - this.info.weightFactor), Math.abs(this.body.velocity.x) * (1.5 - this.info.weightFactor) * 0.5);
    }

    public update(deltaTime: number): void {
        this.ignoring.update(deltaTime);
        this.physics.update(deltaTime, this.ownership);
    }

    public onCollision(_deltaTime: number, body: DynamicObject): OnItemCollision[] {
        if (this.ignoring.has(body)) {
            return [];
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

    public setAngle(to: number): void {
        this.angle.world = to;
    }

    public getAngle(): number {
        return this.angle.local + this.angle.world;
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
        const factor = this.body.getDirectionMultiplier() * this.info.weightFactor;

        if (this.body.getCollidingTile()) {
            this.angle.rotateSpeed = 10;
            return;
        }
        switch (throwType) {
            case (ThrowType.Light): {
                this.body.velocity.set(210 * factor, -210 * this.info.weightFactor);
                this.angle.rotateSpeed = 10;
                break;
            }
            case (ThrowType.Hard): {
                this.body.velocity.set(900 * factor, -300 * this.info.weightFactor);
                this.angle.rotateSpeed = 15;
                break;
            }
            case (ThrowType.HardDiagonal): {
                this.body.velocity.set(900 * factor, -600 * this.info.weightFactor);
                this.angle.rotateSpeed = 15;
                break;
            }
            case (ThrowType.Drop): {
                this.body.velocity.set(0 * factor, 0);
                this.angle.rotateSpeed = 5;
                break;
            }
            case (ThrowType.Upwards): {
                this.body.velocity.set(0 * factor, -600 * this.info.weightFactor);
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
        const minScale = 0.3;
        const maxScale = 0.7;
        const variance = 10;
        addSmokeCloud(this.body.getCenter(), minScale, maxScale, variance, 4);
        this.projectileCollision?.disable();
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