import { Vector, SpriteSheet, Side, Direction, Utility } from "@common";
import { StaticObject } from "@core";
import { ITile } from "@game/StaticObjects/Tiles";
import { SpriteLookup } from "./spriteLookup";

abstract class BaseTile implements ITile {
    public body: StaticObject;
    private spriteIndex: number = 0;
    private static lookup: SpriteLookup = (() => {
        const config = Utility.File.getTileLookup();
        return new SpriteLookup(config.tiles, config.lipLeft, config.lipRight);
    })();
    protected sprite!: SpriteSheet;

    constructor(pos: Vector, size: number) {
        const platform = false;
        this.body = new StaticObject(pos, size, platform);
    }

    public getNeighbours(): {
        top: boolean, right: boolean, bot: boolean, left: boolean,
        topRight: boolean, topLeft: boolean, botRight: boolean, botLeft: boolean
    } {
        return {
            top: this.body.isNeighbour(Direction.Top),
            right: this.body.isNeighbour(Direction.Right),
            left: this.body.isNeighbour(Direction.Left),
            bot: this.body.isNeighbour(Direction.Bot),
            topRight: this.body.isNeighbour(Direction.TopRight),
            topLeft: this.body.isNeighbour(Direction.TopLeft),
            botRight: this.body.isNeighbour(Direction.BotRight),
            botLeft: this.body.isNeighbour(Direction.BotLeft)
        }
    }

    public setSpriteIndex(): void {
        this.spriteIndex = 0;

        const { top, right, bot, left, topLeft, topRight, botLeft, botRight } = this.getNeighbours();

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

    public setLip(): void {
        const { top, right, bot, left, topLeft, topRight, botLeft, botRight } = this.getNeighbours();

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

    public draw(): void {
        const drawSize = 32;
        const flip = false;
        const angle = 0;

        this.sprite.draw(BaseTile.lookup.tile(this.spriteIndex), this.body.pos, drawSize, flip, angle);

        if (this.body.getLip(Side.Left)) {
            this.sprite.draw(BaseTile.lookup.getLip(Side.Left), this.body.getLipDrawPos(Side.Left), drawSize, flip, angle);
        }
        if (this.body.getLip(Side.Right)) {
            this.sprite.draw(BaseTile.lookup.getLip(Side.Right), this.body.getLipDrawPos(Side.Right), drawSize, flip, angle);
        }
    }
}

export { BaseTile };
