import { animations, controlArray, ImageDefinition, imageTable } from "./fileTypes";
import { Controls } from "../../Types/controls";
import { Animation } from "../../Sprite/Animation/animation";

class FileUtility {
    public getImage(name: string): ImageDefinition {
        const result = imageTable[name];
        if (!result) {
            console.log("Error could not find image source");
        }
        return result;
    }

    public getControls(type: string, number: number): Controls {
        const result = controlArray[type][number].keyboard;
        if (!result) {
            console.log("Out of scope");
        }
        return result;
    }

    public setAnimations(type: string, target: Record<string, Animation>): void {
        const config = animations[type];
        for (const key in config) {
            const cfg = config[key];
            const anim = target[key];

            if (!anim) {
                continue;
            }
            if (cfg.row && cfg.frameCount) {
                anim.addRow(cfg.row, cfg.frameCount);
            }
            if (cfg.frames) {
                cfg.frames.forEach(f => anim.addFrame(f));
            }
            if (cfg.repeat) {
                anim.repeat = cfg.repeat;
            }
            if (cfg.fps) {
                anim.fps = cfg.fps;
            }
        }
    }
}

export { FileUtility };