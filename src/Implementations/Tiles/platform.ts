import { Side, SpriteSheet } from "@common";
import { StaticObject } from "@core";
import { ITile, SpriteLookup } from "@game/Tiles";
import { baseTileLookup, lipLeft, lipRight } from "./baseTileLookup";
import { Vector } from "@math";
import { Images } from "@render";

class Platform implements ITile {
    public body: StaticObject;
    private spriteIndex: number = 0;

    private static lookup: SpriteLookup;
    private static sprite = new SpriteSheet(Images.woodPlatform);

    static {
        this.lookup = new SpriteLookup(baseTileLookup, lipLeft, lipRight);
    }

    constructor(pos: Vector, size: number) {
        const platform = true;
        this.body = new StaticObject(pos, size, platform);
    }

    public setSpriteIndex(): void {
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

    public enabled(): boolean {
        const { top, right, bot, left, topLeft, topRight } = this.body.neighbourStatus();

        if (top && bot) {
            if (!left && !right) {
                return false;
            }
            if (left && topLeft) {
                if (topRight) {
                    return false;
                }
                if (!right) {
                    return false;
                }
                
            }
            if (right && topRight) {
                if (topLeft) {
                    return false;
                }   
                if (!left) {
                    return false;
                }       
            }
        }


        return true;
    }

    public update(): void {
        this.setSpriteIndex();
    }

    public draw(): void {
        const drawSize = 32;
        const flip = false;
        const angle = 0;

        Platform.sprite.draw(this.body.pos, drawSize, flip, angle, Platform.lookup.tile(this.spriteIndex));

        if (this.body.getLip(Side.Left)) {
            Platform.sprite.draw(this.body.getLipDrawPos(Side.Left), drawSize, flip, angle, Platform.lookup.getLip(Side.Left));
        }
        if (this.body.getLip(Side.Right)) {
            Platform.sprite.draw(this.body.getLipDrawPos(Side.Right), drawSize, flip, angle, Platform.lookup.getLip(Side.Right));
        }
    }
}

export { Platform };