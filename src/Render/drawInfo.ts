import { Vector } from "@math";
import { ImageInfo } from "./images";
import { Rect } from "./rect";

type DrawInfo = {   
    image: ImageInfo;
    source: Rect;
    world: Rect;
    flip: boolean;
    angle: number;
    opacity: number;
};


type DrawTextInfo = {   
    text: string;
    pos: Vector;
    font: string;
    color: string;
    opacity: number;
};

export type { DrawInfo, DrawTextInfo };
