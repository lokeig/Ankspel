import { Vector } from "@math";
import { OnItemUseEffect, OnItemUseType, Ownership } from "@item";
import { Item } from "../item";
import { EquipmentSlot, Frame, images, ItemInteraction, ProjectileEffect, ProjectileEffectType, SpriteSheet, Utility } from "@common";
import { ProjectileManager, ProjectileTarget } from "@projectile";

class Helmet extends Item {
    private static frames = { default: new Frame(), broken: new Frame(), equipped: new Frame() };
    private static spriteSheet: SpriteSheet;

    private damaged: boolean = false;
    private target: ProjectileTarget;

    static {
        const spriteInfo = Utility.File.getImage(images.armor);
        this.spriteSheet = new SpriteSheet(spriteInfo.src, spriteInfo.frameWidth, spriteInfo.frameHeight);
        Utility.File.setFrames("helmet", this.frames);
    }

    constructor(pos: Vector) {
        const width = 32;
        const height = 32;
        super(pos, width, height);

        this.useInteractions.set(ItemInteraction.Activate, () => {
            this.setOwnership(Ownership.Equipped);
            const result: OnItemUseEffect = { type: OnItemUseType.Equip, value: EquipmentSlot.Head };
            return [result];
        });

        this.target = {
            body: () => this.body,
            penetrationResistance: () => 5,
            onProjectileHit: this.onProjectileHit.bind(this),
            enabled: () => !this.shouldBeDeleted()
        }
    }

    public onEquip(slot: EquipmentSlot): void {
        this.body.width = 40;
        this.body.height = 40;
        if (slot === EquipmentSlot.Head) {
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
                this.setToDelete();
            }
        })
    }

    public draw(): void {
        const frame = this.damaged ? Helmet.frames.broken : this.getOwnership() === Ownership.Equipped ? Helmet.frames.equipped : Helmet.frames.default;
        const drawSize = 32;

        Helmet.spriteSheet.draw(this.getDrawPos(drawSize), drawSize, this.body.isFlip(), this.getAngle(), frame);
    }


    private onHitFunction(): OnItemUseEffect[] {
        this.setToDelete();
        return [];
    }
}

export { Helmet };