import { animationConfigJSON, frameConfigJSON } from "@config";
import { Frame } from "../../Sprite/Animation/frame";

const animations: Record<string, Record<string, AnimationConfig>> = animationConfigJSON;
const frames: Record<string, Record<string, Frame>> = frameConfigJSON;

type ImageDefinition = {
    src: string;
    frameWidth: number;
    frameHeight: number;
};

type AnimationConfig = {
    frameCount?: number;
    row?: number;
    frames?: Frame[];
    repeat?: boolean;
    fps?: number;
    grid?: {
        startRow: number;
        rowCount: number;
        startCol: number;
        colCount: number;
        exclude?: number;
    };
};

export type { ImageDefinition, AnimationConfig };
export { animations, frames };

