import { Rect } from "./rect";

type DrawInfo = {   
    imageSrc: string;
    source: Rect;
    world: Rect;
    flip: boolean;
    angle: number;
    opacity: number;
};

export type { DrawInfo };
