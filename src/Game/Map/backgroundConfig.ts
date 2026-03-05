import { Vector } from "@math";
import { ImageInfo } from "@render";

type BackgroundConfigLayer = {
    src: ImageInfo,
    speed?: number,
    offset?: Vector,
    zIndex?: number;
}

type BackgroundConfig = {
    layers: BackgroundConfigLayer[];
}


export type { BackgroundConfig, BackgroundConfigLayer };