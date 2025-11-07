import { controlArray, ImageDefinition, imageTable } from "./fileTypes";
import { Controls } from "../../Types/controls";

class FileUtility {
    public getImage(name: string): ImageDefinition {
        const result = imageTable[name];
        if (!result) {
            console.log("Error could not find image source");
        }
        return result;
    }

    public getControls(player: number): Controls {
        const result = controlArray[player].keyboard;
        if (!result) {
            console.log("Out of scope");
        }
        return result;
    }
}

export { FileUtility };