import { Vector } from "@math";
import { DrawInfo, DrawTextInfo } from "./drawInfo";
import { Rect } from "./rect";
import { ImageInfo } from "./images";

enum RenderSpace {
    World,
    Screen
}

interface IRender {
    clear(): void;

    setCamera(pos: Vector, scale: number): void;
    getCameraPos(): Vector;
    getCameraZoom(): number;

    loadImage(name: ImageInfo): Promise<void>;
    draw(drawInfo: DrawInfo, space?: RenderSpace): void;
    drawSquare(rect: Rect, angle: number, color: string, space?: RenderSpace): void;
    drawLine(imageSrc: ImageInfo, start: Vector, end: Vector, width: number, sourceRect: Rect, opacity: number, space?: RenderSpace): void;
    drawText(info: DrawTextInfo, space?: RenderSpace): void;

    getWidth(): number;
    getHeight(): number;
}

export { RenderSpace };
export type { IRender };