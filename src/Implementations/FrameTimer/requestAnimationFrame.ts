import { FrameHandler } from "@game/GameLoop";

class RequestAnimationFrameTimer implements FrameHandler {
    public newFrame(callback: (time: number) => void): void {
        requestAnimationFrame(callback);
    }
}

export { RequestAnimationFrameTimer };