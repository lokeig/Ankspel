import { Vector } from "@math";
import { Animation, EquipmentSlot, ItemInteraction, PlayerAnim, ProjectileEffect, ProjectileEffectType, SpriteAnimator, SpriteSheet, Utility } from "@common";
import { OnItemUseEffect, OnItemUseType, Ownership } from "@item";
import { Item } from "../item";
import { ProjectileManager, ProjectileTarget } from "@projectile";
import { Images } from "@render";

class Chestplate extends Item {
    private static animations = { default: new Animation, equipped: new Animation, running: new Animation };
    private static spriteSheet: SpriteSheet;

    private animator: SpriteAnimator;
    private target: ProjectileTarget;

    static {
        Utility.File.setAnimations("chestplate", this.animations);
        this.spriteSheet = new SpriteSheet(Images.armor);
    }

    constructor(pos: Vector) {
        const width = 25;
        const height = 20;
        super(pos, width, height);

        this.animator = new SpriteAnimator(Chestplate.spriteSheet, Chestplate.animations.default);

        this.useInteractions.set(ItemInteraction.Activate, () => {
            this.setOwnership(Ownership.Equipped);
            const result: OnItemUseEffect = { type: OnItemUseType.Equip, value: EquipmentSlot.Body };
            return [result];
        });
        this.useInteractions.setOnPlayerAnimation(anim => {
            if (this.getOwnership() !== Ownership.Equipped) {
                this.animator.setAnimation(Chestplate.animations.default);
                return;
            }
            if (anim === PlayerAnim.Walk) {
                this.animator.setAnimation(Chestplate.animations.running);
            } else {
                this.animator.setAnimation(Chestplate.animations.equipped);
            }
        });
        this.target = {
            body: () => this.body,
            penetrationResistance: () => 5,
            onProjectileHit: this.onProjectileHit.bind(this),
            enabled: () => !this.shouldBeDeleted()
        }
    }

    protected itemUpdate(deltaTime: number): void {
        this.animator.update(deltaTime);
    }

    public onEquip(slot: EquipmentSlot): void {
        if (slot !== EquipmentSlot.Body) {
                return;
        }
        this.body.width = 40;
        this.body.height = 40;
        ProjectileManager.addCollidable(this.target);
    }

    public onUnequip(): void {
        this.body.width = 25;
        this.body.height = 20;
        ProjectileManager.removeCollidable(this.target);
        this.animator.setAnimation(Chestplate.animations.default);
    }

    private onProjectileHit(effects: ProjectileEffect[], _pos: Vector, local: boolean): void {
        if (this.getOwnership() !== Ownership.Equipped || !local) {
            return;
        }
        effects.forEach(effect => {
            if (effect.type === ProjectileEffectType.Damage) {
                this.setToDelete();
            }
        })
    }

    public draw(): void {
        const drawSize = 32;

        this.animator.draw(this.getDrawPos(drawSize), drawSize, this.body.isFlip(), this.getAngle());
    }

    public setToDelete(): void {
        super.setToDelete();
        ProjectileManager.removeCollidable(this.target);
    }
}

export { Chestplate };