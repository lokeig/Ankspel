import { Vector } from "@math";
import { ImageInfo } from "./images";
import { Rect } from "./rect";
import { FontInfo, FontName } from "./fonts";

type DrawInfo = {
    image: ImageInfo;
    source: Rect;
    world: Rect;
    flip: boolean;
    angle: number;
    opacity: number;
    zIndex: number;
};

type DrawTextInfo = {
    text: string;
    pos: Vector;
    font: FontName;
    size: number;
    color: string;
    opacity: number;
    zIndex: number;
};

type DrawLineInfo = {
    image: ImageInfo;
    start: Vector;
    end: Vector;
    width: number;
    sourceRect: Rect;
    opacity: number;
    zIndex: number;
}

export type { DrawInfo, DrawTextInfo, DrawLineInfo };
