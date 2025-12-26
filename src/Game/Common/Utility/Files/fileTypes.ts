import { controlConfigJSON, imageConfigJSON, animationConfigJSON, frameConfigJSON, tileLookupConfigJSON } from "@config";
import { Controls } from "../../Types/controls";
import { Frame } from "../../Sprite/Animation/frame";

const imageTable: Record<string, ImageDefinition> = imageConfigJSON;
const controlArray: ControllerConfig[] = controlConfigJSON;
const animations: Record<string, Record<string, AnimationConfig>> = animationConfigJSON;
const frames: Record<string, Record<string, Frame>> = frameConfigJSON;
const tileLookup: TileLookupConfig = tileLookupConfigJSON;

type ControllerConfig = {
    keyboard: Controls;
    controller?: Controls;
}

type TileLookupConfig = {
    tileLookup: Record<string, number[]>;
    lipLeft: number[];
    lipRight: number[];
};

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

export type { ImageDefinition, Controls, AnimationConfig };
export { imageTable, controlArray, animations, frames, tileLookup };

