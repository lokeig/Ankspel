import { DrawInfo, Rect, Render, RenderSpace } from "@render";
import { Vector } from "../../../Math/vector";
import { Frame } from "./Animation/frame";

class SpriteSheet {
    private imageSrc: string;
    private frameWidth: number;
    private frameHeight: number;
    private noFrame = new Frame();
    private space: RenderSpace = RenderSpace.World;

    constructor(imageSrc: string, frameWidth: number, frameHeight: number) {
        this.imageSrc = imageSrc;
        this.frameWidth = frameWidth;
        this.frameHeight = frameHeight;
    }

    public setRenderSpace(space: RenderSpace): void {
        this.space = space;
    }
  
    private getSource(row: number, col: number): Rect {
        return {
            x: col * this.frameWidth,
            y: row * this.frameHeight,
            width: this.frameWidth,
            height: this.frameHeight,
        };
    }

    public draw(pos: Vector, size: number | Vector, flip: boolean, angle: number, frame: Frame = this.noFrame, opacity: number = 1): void {
        const width = size instanceof Vector ? size.x : size;
        const height = size instanceof Vector ? size.y : size;

        const drawInfo: DrawInfo = {
            imageSrc: this.imageSrc,
            source: this.getSource(frame.row, frame.col),
            world: { x: pos.x, y: pos.y, width, height },
            flip,
            angle,
            opacity
        };
        Render.get().draw(drawInfo, this.space);
    }

    public drawLine(start: Vector, end: Vector, width: number, frame: Frame = this.noFrame, opacity: number = 1): void {
        const source = this.getSource(frame.row, frame.col);
        Render.get().drawLine(this.imageSrc, start, end, width, source, opacity, this.space);
    }
}

export { SpriteSheet };
