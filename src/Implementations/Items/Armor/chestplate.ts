import { Vector } from "@math";
import { Animation, EquipmentSlot, ItemInteraction, PlayerAnim, ProjectileEffect, ProjectileEffectType, SpriteAnimator, SpriteSheet, Utility } from "@common";
import { OnItemUseEffect, OnItemUseType, Ownership } from "@item";
import { Item } from "../item";
import { ProjectileManager, ProjectileTarget } from "@projectile";
import { Images } from "@render";
import { Connection, GameMessage } from "@server";
import { AudioManager, Sound } from "@game/Audio";

class Chestplate extends Item {
    private static animations = { default: new Animation, equipped: new Animation, running: new Animation };
    private static spriteSheet: SpriteSheet;

    private animator: SpriteAnimator;
    private target: ProjectileTarget;

    static {
        Utility.File.setAnimations("chestplate", this.animations);
        this.spriteSheet = new SpriteSheet(Images.armor);
    }

    constructor(pos: Vector, id: number) {
        const width = 25;
        const height = 20;
        super(pos, width, height, id);

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

    private onProjectileHit(effects: ProjectileEffect[], pos: Vector, local: boolean): void {
        effects.forEach(effect => this.onProjectileEffect(effect, pos, local));
    }

    public onProjectileEffect(effect: ProjectileEffect, pos: Vector, local: boolean) {
        if (!local || this.shouldBeDeleted()) {
            return;
        }
        if (effect.type === ProjectileEffectType.Damage) {
            this.setToDelete();
            AudioManager.get().play(Sound.ting);
            Connection.get().sendGameMessage(GameMessage.ItemProjectileEffect, { id: this.id, effect, pos });
        }
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