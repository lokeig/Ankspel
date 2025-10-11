import { Frame } from "./frame";

class Animation {
    private frames: Array<Frame> = [];
    public fps: number = 8;
    public repeat: boolean = false;

    public addFrame(frame: Frame) {
        this.frames.push(frame);
    }

    public addSegment(startFrame: number, endFrame: number, framesWide: number) {
        if (startFrame < endFrame) {
            for (let currentFrame = startFrame; currentFrame <= endFrame; currentFrame++) {
                const col = currentFrame % framesWide;
                const row = Math.floor(currentFrame / framesWide);
                this.frames.push({ col, row });
            }
        } else {
            for (let currentFrame = startFrame; currentFrame >= endFrame; currentFrame--) {
                const col = currentFrame % framesWide;
                const row = Math.floor(currentFrame / framesWide);
                this.frames.push({ col, row });
            } 
        }
    }

    public addRow(row: number, length: number) {
        for (let i = 0; i < length; i++) {
            this.frames.push({ row, col: i });
        }
    }

    public getFrame(number: number) {
        return this.frames[number];
    }

    public getFrameAmount(): number {
        return this.frames.length;
    }
}

export { Animation };