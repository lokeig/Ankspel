import { Vector } from "@math";
import { EquipmentSlot, Frame, images, ItemInteraction, SpriteSheet, Utility } from "@common";
import { OnItemUseEffect, OnItemUseType, Ownership } from "@item";
import { Item } from "../item";

class Chestplate extends Item {
    private static readonly slot: EquipmentSlot = EquipmentSlot.Body;
    private static frames = { default: new Frame(), equipped: new Frame() };
    private static spriteSheet: SpriteSheet;

    static {
        Utility.File.setFrames("chestplate", this.frames);
        const spriteInfo = Utility.File.getImage(images.armor);
        this.spriteSheet = new SpriteSheet(spriteInfo.src, spriteInfo.frameWidth, spriteInfo.frameHeight);
    }

    constructor(pos: Vector) {
        const width = 20;
        const height = 20;
        super(pos, width, height);


        this.useInteractions.set(ItemInteraction.Activate, () => {
            this.setOwnership(Ownership.Equipped);
            const result: OnItemUseEffect = { type: OnItemUseType.Equip, value: Chestplate.slot };
            return [result];
        });
        this.useInteractions.set(ItemInteraction.HitByProjectile, (seed: number, local: boolean) => {
            if (this.getOwnership() === Ownership.Equipped) {
                return this.onHitFunction();
            } else {
                return [];
            }
        });
    }

    public draw(): void {
        const frame = this.getOwnership() === Ownership.Equipped ? Chestplate.frames.equipped : Chestplate.frames.default;
        const drawSize = 32;

        Chestplate.spriteSheet.draw(this.getDrawPos(drawSize), drawSize, this.body.isFlip(), this.getAngle(), frame);
    }

    private onHitFunction(): OnItemUseEffect[] {
        this.setToDelete();
        return [];
    }
}

export { Chestplate };