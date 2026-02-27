import { Vector } from "@math";
import { EquipmentSlot, Frame, images, ItemInteraction, ProjectileEffect, ProjectileEffectType, SpriteSheet, Utility } from "@common";
import { OnItemUseEffect, OnItemUseType, Ownership } from "@item";
import { Item } from "../item";
import { ProjectileManager, ProjectileTarget } from "@projectile";

class Chestplate extends Item {
    private static frames = { default: new Frame(), equipped: new Frame() };
    private static spriteSheet: SpriteSheet;

    private target: ProjectileTarget;
    private destroyed: boolean = false;

    static {
        Utility.File.setFrames("chestplate", this.frames);
        const spriteInfo = Utility.File.getImage(images.armor);
        this.spriteSheet = new SpriteSheet(spriteInfo.src, spriteInfo.frameWidth, spriteInfo.frameHeight);
    }

    constructor(pos: Vector) {
        const width = 25;
        const height = 20;
        super(pos, width, height);

        this.useInteractions.set(ItemInteraction.Activate, () => {
            this.setOwnership(Ownership.Equipped);
            const result: OnItemUseEffect = { type: OnItemUseType.Equip, value: EquipmentSlot.Body };
            return [result];
        });
        this.target = {
            body: this.body,
            penetrationResistance: 5,
            onProjectileHit: this.onProjectileHit.bind(this),
            enabled: () => !this.shouldBeDeleted()
        }
    }

    public onEquip(slot: EquipmentSlot): void {
        this.body.width = 40;
        this.body.height = 40;
        if (slot === EquipmentSlot.Body) {
            ProjectileManager.addCollidable(this.target);
        }
    }

    public onUnequip(): void {
        this.body.width = 25;
        this.body.height = 20;
        ProjectileManager.removeCollidable(this.target);
    }

    private onProjectileHit(effects: ProjectileEffect[], _pos: Vector, local: boolean): void {
        if (this.getOwnership() !== Ownership.Equipped || !local) {
            return;
        }
        effects.forEach(effect => {
            if (effect.type === ProjectileEffectType.Damage) {
                this.destroyed = true;
                this.setToDelete();
            }
        })
    }

    public draw(): void {
        const frame = this.getOwnership() === Ownership.Equipped ? Chestplate.frames.equipped : Chestplate.frames.default;
        const drawSize = 32;

        Chestplate.spriteSheet.draw(this.getDrawPos(drawSize), drawSize, this.body.isFlip(), this.getAngle(), frame);
    }

    public setToDelete(): void {
        super.setToDelete();
        ProjectileManager.removeCollidable(this.target);
    }
}

export { Chestplate };