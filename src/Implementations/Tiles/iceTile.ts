import { images, SpriteSheet, Utility, Vector } from "@common";
import { BaseTile } from "./baseTile";

class IceTile extends BaseTile {
    private static sprite: SpriteSheet;

    static {
        const spriteInfo = Utility.File.getImage(images.tileIce);
        this.sprite = new SpriteSheet(spriteInfo.src, spriteInfo.frameWidth, spriteInfo.frameHeight);
    }

    constructor(pos: Vector, size: number) {
        super(pos, size);
        this.sprite = IceTile.sprite;
    }
}

export { IceTile };