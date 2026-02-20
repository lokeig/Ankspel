import { Vector } from "@math";
import { OnItemUseEffect, OnItemUseType, Ownership } from "@item";
import { Item } from "../item";
import { EquipmentSlot, Frame, images, ItemInteraction, SpriteSheet, Utility } from "@common";

class Helmet extends Item {
    private static readonly slot: EquipmentSlot = EquipmentSlot.Head;
    private static frames = { default: new Frame(), broken: new Frame() };

    private static spriteSheet: SpriteSheet;
    private damaged: boolean = false;

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
            const result: OnItemUseEffect = { type: OnItemUseType.Equip, value: Helmet.slot };
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
        const frame = this.damaged ? Helmet.frames.broken : Helmet.frames.default;
        const drawSize = 32;

        Helmet.spriteSheet.draw(this.getDrawPos(drawSize), drawSize, this.body.isFlip(), this.getAngle(), frame);
    }


    private onHitFunction(): OnItemUseEffect[] {
        this.setToDelete();
        return [];
    }
}

export { Helmet };