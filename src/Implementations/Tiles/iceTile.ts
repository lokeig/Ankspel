import { Vector } from "@math";
import { SpriteSheet } from "@common";
import { BaseTile } from "./baseTile";
import { Images } from "@render";

class IceTile extends BaseTile {
    private static sprite: SpriteSheet;

    static {
        this.sprite = new SpriteSheet(Images.tileIce);
    }

    constructor(pos: Vector, size: number) {
        super(pos, size);
        this.sprite = IceTile.sprite;
    }
}

export { IceTile };