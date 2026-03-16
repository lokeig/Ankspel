import { DrawInfo, DrawLineInfo, ImageInfo, Rect, Render, RenderSpace } from "@render";
import { Frame } from "./Animation/frame";
import { Vector } from "@math";

class SpriteSheet {
    private image: ImageInfo;
    private static noFrame = new Frame();
    private space: RenderSpace = RenderSpace.World;

    public zIndex: number = 0;

    constructor(image: ImageInfo) {
        this.image = image;
    }

    public setRenderSpace(space: RenderSpace): void {
        this.space = space;
    }

    private getSource(row: number, col: number): Rect {
        return {
            x: col * this.image.frameWidth,
            y: row * this.image.frameHeight,
            width: this.image.frameWidth,
            height: this.image.frameHeight,
        };
    }

    public draw(pos: Vector, size: number | Vector, flip: boolean, angle: number, zIndex: number, frame: Frame = SpriteSheet.noFrame, opacity: number = 1): void {
        const width = size instanceof Vector ? size.x : size;
        const height = size instanceof Vector ? size.y : size;

        const drawInfo: DrawInfo = {
            image: this.image,
            source: this.getSource(frame.row, frame.col),
            world: { x: pos.x, y: pos.y, width, height },
            flip,
            angle,
            opacity,
            zIndex
        };
        Render.get().drawImage(drawInfo, this.space);
    }

    public drawLine(start: Vector, end: Vector, width: number, frame: Frame = SpriteSheet.noFrame, opacity: number = 1): void {
        const source = this.getSource(frame.row, frame.col);
        const drawInfo: DrawLineInfo = {
            image: this.image,
            start,
            end,
            width,
            sourceRect: source,
            opacity,
            zIndex: this.zIndex,
        };
        Render.get().drawLine(drawInfo);
    }
}

export { SpriteSheet };
