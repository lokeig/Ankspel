import { Rect } from "./rect";


type DrawInfo = {   
    imageSrc: string;
    source: Rect;
    world: Rect;
    flip: boolean;
    angle: number;
};

export type { DrawInfo };
