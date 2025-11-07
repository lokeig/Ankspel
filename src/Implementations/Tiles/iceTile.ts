import { images, SpriteSheet, Utility, Vector } from "@common";
import { BaseTile } from "./baseTile";

class IceTile extends BaseTile {
    constructor(pos: Vector, size: number) {
        super(pos, size);
        const spriteInfo = Utility.File.getImage(images.tileIce);
        this.sprite = new SpriteSheet(spriteInfo.src, spriteInfo.frameWidth, spriteInfo.frameHeight);
    }
}

export { IceTile };