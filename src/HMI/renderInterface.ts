import { GameObject } from "../Status/Game/Objects/Common/gameObject";
import { Vector } from "../Status/Game/Common/Types/vector";

export interface RenderIF {
    draw(drawInfo: DrawInfo): void;
    clear(): void;
    setScale(percentage: number): void;
    setPosition(pos: Vector): void;
    drawSquare(x: number, y: number, width: number, height: number, angle: number, color: string): void;
    drawLine(imageSrc: string, pos1: Vector, pos2: Vector, width: number, sourceRect: GameObject): void;
}

export type DrawInfo = {
    imageSrc: string,
    sourcePos: Vector,
    sourceWidth: number,
    sourceHeight: number,

    drawPos: Vector,
    drawWidth: number,
    drawHeight: number,

    flip: boolean,
    angle: number
}