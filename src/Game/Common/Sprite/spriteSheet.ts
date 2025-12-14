import { DrawInfo, Rect, Render } from "@render";
import { Vector } from "../Types/vector";
import { Frame } from "./Animation/frame";

class SpriteSheet {
    imageSrc: string;
    frameWidth: number;
    frameHeight: number;

    constructor(imageSrc: string, frameWidth: number, frameHeight: number) {
        this.imageSrc = imageSrc;
        this.frameWidth = frameWidth;
        this.frameHeight = frameHeight;
    }
  
    private getSource(row: number, col: number): Rect {
        return {
            x: col * this.frameWidth,
            y: row * this.frameHeight,
            width: this.frameWidth,
            height: this.frameHeight,
        };
    }

    public draw(frame: Frame, pos: Vector, size: number, flip: boolean, angle: number): void {
        const drawInfo: DrawInfo = {
            imageSrc: this.imageSrc,
            source: this.getSource(frame.row, frame.col),
            world: { x: pos.x, y: pos.y, width: size, height: size },
            flip: flip,
            angle: angle
        };
        Render.get().draw(drawInfo);
    }

    public drawLine(frame: Frame, pos1: Vector, pos2: Vector, width: number): void {
        const source = this.getSource(frame.row, frame.col);
        Render.get().drawLine(this.imageSrc, pos1.x, pos1.y, pos2.x, pos2.y, width, source);
    }
}

export { SpriteSheet };
