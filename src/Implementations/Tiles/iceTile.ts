import { getTileImage, SpriteSheet, TileType, Vector } from "@common";
import { BaseTile } from "./baseTile";

class IceTile extends BaseTile {
    constructor(pos: Vector, size: number) {
        super(pos, size);
        const spriteSize = 16;
        this.sprite = new SpriteSheet(getTileImage(TileType.Ice), spriteSize, spriteSize);
    }
}

export { IceTile };