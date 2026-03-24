import { SpriteSheet } from "@common";
import { Images } from "@render";
import { Vector } from "@math";
import { BaseProp } from "./baseProp";

class Rock extends BaseProp {
    private static sprite = new SpriteSheet(Images.rock);
    private static drawSize = new Vector(32, 26);
    private static holdOffset = new Vector(10, -6);

    constructor(pos: Vector, id: number) {
        const width = 20;
        const height = 26;

        super(pos, width, height, id);

        this.info.holdOffset = Rock.holdOffset;
        this.info.weightFactor = 0.5;
    }

    public getHoldOffset(): Vector {
        return Rock.holdOffset;
    }

    public draw(): void {
        Rock.sprite.draw(this.getDrawPos(Rock.drawSize), Rock.drawSize, this.body.isFlip(), this.angle.worldAngle, this.getZIndex())
    }
}

export { Rock };