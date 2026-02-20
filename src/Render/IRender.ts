import { Vector } from "@math";
import { DrawInfo } from "./drawInfo";
import { Rect } from "./rect";

enum RenderSpace {
    World,
    Screen
}

interface IRender {
    clear(): void;

    setCamera(pos: Vector, scale: number): void;
    getCameraPos(): Vector;
    getCameraZoom(): number;

    draw(drawInfo: DrawInfo, space?: RenderSpace): void;
    drawSquare(rect: Rect, angle: number, color: string, space?: RenderSpace): void;
    drawLine(imageSrc: string, start: Vector, end: Vector, width: number, sourceRect: Rect, opacity: number, space?: RenderSpace): void;

    getWidth(): number;
    getHeight(): number;
}

export { RenderSpace };
export type { IRender };