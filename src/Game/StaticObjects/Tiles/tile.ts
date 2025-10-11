import { Vector, SpriteSheet } from "@common";
import { StaticObject } from "@core";
import { spriteLookup } from "./spriteLookup";

class Tile extends StaticObject{
    private size: number;

    constructor(pos: Vector, sprite: SpriteSheet, width: number, height: number, drawSize: number, platform = false){
        super(pos, sprite, width, height, drawSize, platform);
        this.size = Math.max(width, height);
        this.spriteLookup = spriteLookup;
    }

    setSpriteIndex() { 
        this.spriteIndex = 0;

        const { top, right, bot, left, topLeft, topRight, botLeft, botRight } = this.neighbours;

        if (top)   this.spriteIndex += 1;
        if (right) this.spriteIndex += 2;
        if (bot)   this.spriteIndex += 4;
        if (left)  this.spriteIndex += 8;

        if (right && top && topRight)  this.spriteIndex += 16;
        if (left  && top && topLeft)   this.spriteIndex += 32;
        if (right && bot && botRight)  this.spriteIndex += 64;
        if (left  && bot && botLeft)   this.spriteIndex += 128;
    }

    setLip() {
        const { top, right, bot, left, topLeft, topRight, botLeft, botRight } = this.neighbours;

        let hasLipLeft  = false;
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
            if (botRight && right && !topRight && !left)  {
                hasLipLeft  = true;
            }
            if (botLeft  && left  && !topLeft  && !right) {
                hasLipRight = true;
            }
        }

        const width = Math.floor(this.size / 4)

        if (hasLipLeft) {
            this.lipLeft = new Tile({ x: this.pos.x - width, y: this.pos.y }, this.sprite, width, this.height, this.drawSize, true) 
        } else {
            this.lipLeft = undefined;
        }

        if (hasLipRight) {
            this.lipRight = new Tile({ x: this.pos.x + this.width, y: this.pos.y }, this.sprite, width, this.height, this.drawSize, true)
        } else { 
            this.lipRight = undefined; 
        }
    }
}

export { Tile };
