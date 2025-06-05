import { Vector } from "../Status/Common/types";

export interface RenderIF {
    draw(drawInfo: DrawInfo): void;
    clear(): void;
    setScale(percentage: number): void;
    setPosition(pos: Vector): void;
}

export type DrawInfo = {
    imageSrc: string,

    sourcePos: Vector,
    sourceWidth: number,
    sourceHeight: number,

    drawPos: Vector,
    drawWidth: number,
    drawHeight: number,

    flip: boolean
}