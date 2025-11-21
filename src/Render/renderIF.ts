import { DrawInfo } from "./drawInfo";
import { Rect } from "./rect";

interface RenderIF {
    draw(drawInfo: DrawInfo): void;
    clear(): void;
    drawSquare(rect: Rect, angle: number, color: string): void;
    drawLine(imageSrc: string, x1: number, y1: number, x2: number, y2: number, width: number, sourceRect: Rect): void;
}

export type { RenderIF };