import { Render } from "../../../../../HMI/render";
import { DrawInfo } from "../../../../../HMI/renderInterface";
import { GameObject } from "../../Objects/Common/gameObject";
import { Vector } from "../Types/vector";

export class SpriteSheet {
    imageSrc: string;
    frameWidth: number;
    frameHeight: number;

    constructor(imageSrc: string, frameWidth: number, frameHeight: number) {
        this.imageSrc = imageSrc;
        this.frameWidth = frameWidth;
        this.frameHeight = frameHeight;
    }
  
    getFrame(row: number, col: number): { sx: number, sy: number, sw: number, sh: number } {
        return {
            sx: col * this.frameWidth,
            sy: row * this.frameHeight,
            sw: this.frameWidth,
            sh: this.frameHeight,
        };
    }

    draw(row: number, col: number, pos: Vector, size: number, flip: boolean, angle: number) {

        const { sx, sy, sw, sh } = this.getFrame(row, col);
        const drawInfo: DrawInfo = {
            imageSrc: this.imageSrc,
            sourcePos: { x: sx, y: sy }, 
            sourceWidth: sw,
            sourceHeight: sh,
            drawPos: pos,
            drawWidth: size,
            drawHeight: size,
            flip: flip,
            angle: angle
        };

        Render.get().draw(drawInfo);
    }

    drawLine(row: number, col: number, pos1: Vector, pos2: Vector, width: number) {
        const { sx, sy, sw, sh } = this.getFrame(row, col);
        Render.get().drawLine(this.imageSrc, pos1, pos2, width, new GameObject({ x: sx, y: sy }, sw, sh));
    }
}


