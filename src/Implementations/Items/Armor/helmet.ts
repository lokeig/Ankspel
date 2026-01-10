import { OnItemUseEffect, OnItemUseType, Ownership } from "@item";
import { Item } from "../item";
import { EquipmentSlot, Frame, images, ItemInteraction, SpriteSheet, Utility, Vector } from "@common";

class Helmet extends Item {
    private static readonly slot: EquipmentSlot = EquipmentSlot.Head;
    private frames = { default: new Frame(), broken: new Frame() };
    private spriteSheet: SpriteSheet;
    private damaged: boolean = false;

    constructor(pos: Vector) {
        const width = 32;
        const height = 32;
        super(pos, width, height);

        const spriteInfo = Utility.File.getImage(images.armor);
        this.spriteSheet = new SpriteSheet(spriteInfo.src, spriteInfo.frameWidth, spriteInfo.frameHeight);
        Utility.File.setFrames("helmet", this.frames);

        this.interactions.set(ItemInteraction.Activate, () => {
            this.setOwnership(Ownership.Equipped);
            const result: OnItemUseEffect = { type: OnItemUseType.Equip, value: Helmet.slot };
            return [result];
        });
        this.interactions.set(ItemInteraction.Hit, (seed: number, local: boolean) => {
            if (this.getOwnership() === Ownership.Equipped) {
                return this.onHitFunction(seed, local);
            } else {
                return [];
            }
        });
    }

    public draw(): void {
        const frame = this.damaged ? this.frames.broken : this.frames.default;
        const drawSize = 32;

        this.spriteSheet.draw(frame, this.getDrawPos(drawSize), drawSize, this.body.isFlip(), this.getAngle());
    }


    private onHitFunction(seed: number, local: boolean): OnItemUseEffect[] {
        this.setToDelete();
        return [];
    }
}

export { Helmet };