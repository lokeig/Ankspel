import { ControlConfigJSON, ImageConfigJSON } from "@config";
import { Controls } from "../../Types/controls";

type ImageDefinition = {
    src: string;
    frameWidth: number;
    frameHeight: number;
};

const imageTable: Record<string, ImageDefinition> = ImageConfigJSON;
const controlArray: Array<Record<string, Controls>> = ControlConfigJSON;

export type { ImageDefinition, Controls };
export { imageTable, controlArray };

