import { animations, frames } from "./fileTypes";
import { Animation } from "../../Sprite/Animation/animation";
import { Frame } from "../../Sprite/Animation/frame";

class FileUtility {
    public setFrames(type: string, target: Record<string, Frame>): void {
        const config = frames[type];
        if (!config) {
            throw new Error(type + " not found in config");
        }
        for (const key in config) {
            const frame = target[key];
            const configured = config[key];
            if (!configured) {
                throw new Error(key + " not found in " + type + " frame record");
            }
            frame.col = configured.col;
            frame.row = configured.row;
        }
    }

    public setAnimations(type: string, target: Record<string, Animation>): void {
        const config = animations[type];
        if (!config) {
            throw new Error(type + " not found in config");
        }
        for (let key in config) {
            const configured = config[key];
            const targetAnimation = target[key];

            if (!targetAnimation) {
                throw new Error(key + " not found in " + type + " animation record");
            }
            if (configured.row && configured.frameCount) {
                targetAnimation.addRow(configured.row, configured.frameCount);
            }
            if (configured.frames) {
                configured.frames.forEach(f => targetAnimation.addFrame(f));
            }
            if (configured.grid) {
                const grid = configured.grid;
                const frames: Frame[] = [];
                for (let row = grid.startRow; row < grid.startRow + grid.rowCount; row++) {
                    for (let col = grid.startCol; col < grid.startCol + grid.colCount; col++) {
                        frames.push({ col, row });
                    }
                }
                if (grid.exclude) {
                    frames.splice(frames.length - grid.exclude);
                }
                frames.forEach(f => targetAnimation.addFrame(f));
            }
            if (configured.repeat) {
                targetAnimation.repeat = configured.repeat;
            }
            if (configured.fps) {
                targetAnimation.fps = configured.fps;
            }
        }
    }
}

export { FileUtility };