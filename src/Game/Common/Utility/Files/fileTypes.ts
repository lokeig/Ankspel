import { ControlConfigJSON, ImageConfigJSON, AnimationConfigJSON } from "@config";
import { Controls } from "../../Types/controls";
import { Frame } from "@game/Common/Sprite/Animation/frame";

type ImageDefinition = {
    src: string;
    frameWidth: number;
    frameHeight: number;
};

const imageTable: Record<string, ImageDefinition> = ImageConfigJSON;
const controlArray: Record<string, Array<Record<string, Controls>>> = ControlConfigJSON;
const animations: Record<string, Record<string, AnimationConfig>> = AnimationConfigJSON;

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
    };
};

export type { ImageDefinition, Controls, AnimationConfig };
export { imageTable, controlArray, animations };

