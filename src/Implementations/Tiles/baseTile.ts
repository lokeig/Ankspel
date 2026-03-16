import { Vector } from "@math";
import { SpriteSheet, Side } from "@common";
import { StaticObject } from "@core";
import { ITile } from "@game/Tiles";
import { SpriteLookup } from "../../Game/Tiles/spriteLookup";
import { baseTileLookup, lipLeft, lipRight } from "./baseTileLookup";
import { zIndex } from "@render";

abstract class BaseTile implements ITile {
    public body: StaticObject;
    private spriteIndex: number = 0;

    private static lookup: SpriteLookup;
    protected sprite!: SpriteSheet;

    static {
        this.lookup = new SpriteLookup(baseTileLookup, lipLeft, lipRight);
    }

    constructor(pos: Vector, size: number) {
        const platform = false;
        this.body = new StaticObject(pos, size, platform);
    }

    private setSpriteIndex(): void {
        this.spriteIndex = 0;

        const { top, right, bot, left, topLeft, topRight, botLeft, botRight } = this.body.neighbourStatus();

        if (top) {
            this.spriteIndex += 1;
        }
        if (right) {
            this.spriteIndex += 2;
        }
        if (bot) {
            this.spriteIndex += 4;
        }
        if (left) {
            this.spriteIndex += 8;
        }

        if (right && top && topRight) {
            this.spriteIndex += 16;
        }
        if (left && top && topLeft) {
            this.spriteIndex += 32;
        }
        if (right && bot && botRight) {
            this.spriteIndex += 64;
        }
        if (left && bot && botLeft) {
            this.spriteIndex += 128;
        }
    }

    private setLip(): void {
        const { top, right, bot, left, topLeft, topRight, botLeft, botRight } = this.body.neighbourStatus();

        let hasLipLeft = false;
        let hasLipRight = false;
        if (!top) {
            if (!left) {
                hasLipLeft = true;
            }
            if (!right) {
                hasLipRight = true;
            }
        }
        if (top && bot) {
            if (botRight && right && !topRight && !left) {
                hasLipLeft = true;
            }
            if (botLeft && left && !topLeft && !right) {
                hasLipRight = true;
            }
        }

        this.body.setLip(Side.Left, hasLipLeft);
        this.body.setLip(Side.Right, hasLipRight);
    }

    public update(): void {
        this.setSpriteIndex();
        this.setLip();
    }

    public enabled(): boolean {
        return true;
    }

    public draw(): void {
        const drawSize = 32;
        const flip = false;
        const angle = 0;

        this.sprite.draw(this.body.pos, drawSize, flip, angle, zIndex.Tiles, BaseTile.lookup.tile(this.spriteIndex));

        if (this.body.getLip(Side.Left)) {
            this.sprite.draw(this.body.getLipDrawPos(Side.Left), drawSize, flip, angle, zIndex.Tiles + 1, BaseTile.lookup.getLip(Side.Left));
        }
        if (this.body.getLip(Side.Right)) {
            this.sprite.draw(this.body.getLipDrawPos(Side.Right), drawSize, flip, angle, zIndex.Tiles + 1, BaseTile.lookup.getLip(Side.Right));
        }
    }
}

export { BaseTile };
