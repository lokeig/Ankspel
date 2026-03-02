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

export type { DrawInfo };
