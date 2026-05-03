type Callback = (time: number) => void;

interface FrameHandler {
    newFrame(callback: Callback): void;
}

export type { FrameHandler };