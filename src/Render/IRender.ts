import { Vector } from "@math";
import { DrawInfo, DrawLineInfo, DrawTextInfo } from "./drawInfo";
import { Rect } from "./rect";
import { ImageInfo } from "./images";
import { FontInfo, FontName } from "./fonts";

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
    loadFont(name: FontName, font: FontInfo): Promise<void>;

    drawImage(drawInfo: DrawInfo, space?: RenderSpace): void;
    drawColor(drawInfo: DrawInfo, color: string, space?: RenderSpace): void;
    drawSquare(rect: Rect, zIndex: number, angle: number, color: string, space?: RenderSpace): void;
    drawLine(lineInfo: DrawLineInfo, space?: RenderSpace): void;

    drawText(info: DrawTextInfo, space?: RenderSpace): void;
    measureText(text: string, font: FontName, size: number): { width: number, height: number };

    render(): void;

    getWidth(): number;
    getHeight(): number;
}

export { RenderSpace };
export type { IRender };