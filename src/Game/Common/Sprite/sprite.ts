import { DrawInfo, Render } from "@render";
import { Vector } from "../Types/vector";

class SpriteSheet {
    imageSrc: string;
    frameWidth: number;
    frameHeight: number;

    constructor(imageSrc: string, frameWidth: number, frameHeight: number) {
        this.imageSrc = imageSrc;
        this.frameWidth = frameWidth;
        this.frameHeight = frameHeight;
    }
  
    private getFrame(row: number, col: number): { x: number, y: number, width: number, height: number } {
        return {
            x: col * this.frameWidth,
            y: row * this.frameHeight,
            width: this.frameWidth,
            height: this.frameHeight,
        };
    }

    public draw(row: number, col: number, pos: Vector, size: number, flip: boolean, angle: number): void {

        const source = this.getFrame(row, col);
        const drawInfo: DrawInfo = {
            imageSrc: this.imageSrc,
            source: source,
            world: { x: pos.x, y: pos.y, width: size, height: size },
            flip: flip,
            angle: angle
        };

        Render.get().draw(drawInfo);
    }

    public drawLine(row: number, col: number, pos1: Vector, pos2: Vector, width: number): void {
        const source = this.getFrame(row, col);
        Render.get().drawLine(this.imageSrc, pos1.x, pos1.y, pos2.x, pos2.y, width, source);
    }
}

export { SpriteSheet };
