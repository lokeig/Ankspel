import { Vector, SpriteSheet, Side, Direction } from "@common";
import { StaticObject } from "@core";
import { TileInterface } from "../../Game/StaticObjects/Tiles/tileInterface";
import { lipLeftLookup, lipRightLookup, spriteLookup } from "./spriteLookup";

abstract class BaseTile implements TileInterface {
    public body: StaticObject;
    private spriteIndex: number = 0;
    private static lookup = spriteLookup;
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
            top: this.body.isNeighbour(Direction.top),
            right: this.body.isNeighbour(Direction.right),
            left: this.body.isNeighbour(Direction.left),
            bot: this.body.isNeighbour(Direction.bot),
            topRight: this.body.isNeighbour(Direction.topRight),
            topLeft: this.body.isNeighbour(Direction.topLeft),
            botRight: this.body.isNeighbour(Direction.botRight),
            botLeft: this.body.isNeighbour(Direction.botLeft)
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

    setLip() {
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

        this.body.setLip(Side.left, hasLipLeft);
        this.body.setLip(Side.right, hasLipRight);
    }

    public update(): void {
        this.setSpriteIndex();
        this.setLip();
    }

    public draw(): void {
        const lookup = BaseTile.lookup[this.spriteIndex];
        const row = lookup ? lookup[0] : 0;
        const col = lookup ? lookup[1] : 0;
        const drawSize = 32;
        const flip = false;
        const angle = 0;

        this.sprite.draw(row, col, this.body.pos, drawSize, flip, angle);

        if (this.body.getLip(Side.left)) {
            const lipRow = lipLeftLookup[0];
            const lipCol = lipLeftLookup[1];
            this.sprite.draw(lipRow, lipCol, this.body.getLipDrawPos(Side.left), drawSize, flip, angle);
        }
        if (this.body.getLip(Side.right)) {
            const lipRow = lipRightLookup[0];
            const lipCol = lipRightLookup[1];
            this.sprite.draw(lipRow, lipCol, this.body.getLipDrawPos(Side.right), drawSize, flip, angle);
        }
    }
}

export { BaseTile };
