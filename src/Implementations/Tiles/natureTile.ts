import { Vector } from "@math";
import { SpriteSheet } from "@common";
import { BaseTile } from "./baseTile";
import { Images } from "@render";

class NatureTile extends BaseTile {
    private static sprite: SpriteSheet;

    static {
        this.sprite = new SpriteSheet(Images.tileNature);
    }

    constructor(pos: Vector, size: number) {
        super(pos, size);
        this.sprite = NatureTile.sprite;
    }
}

export { NatureTile };