import { Animation } from "./animation";
import { SpriteSheet } from "./sprite";
import { Vector } from "./types";


export class SpriteAnimator {
    public spriteSheet: SpriteSheet;
    private animation: Animation;
    private currentFrame: number = 0;
    private timer: number = 0;
    private done: boolean = false;

    constructor(spriteSheet: SpriteSheet, animation: Animation) {
        this.spriteSheet = spriteSheet;
        this.animation = animation;
    }

    public update(deltaTime: number) {
        this.timer += deltaTime;
        const framesAmount = this.animation.getFrameAmount();
        const frameDuration = 1 / this.animation.fps;
        if (this.timer > frameDuration) {
            const framesToAdvance = Math.floor(this.timer / frameDuration);
            const nextFrame = this.currentFrame + framesToAdvance;
            if (!this.animation.repeat && nextFrame > framesAmount - 1) {
                this.currentFrame = framesAmount - 1;
                this.done = true;
            } else {
                this.currentFrame = nextFrame % framesAmount;
                this.timer %= frameDuration;
            }
        }
    }

    public animationDone(): boolean {
        return this.done;
    }

    public getAnimation(): Animation {
        return this.animation;
    }

    public draw(pos: Vector, size: number, flip: boolean, angle: number) {
        const frame = this.animation.getFrame(this.currentFrame);
        this.spriteSheet.draw(frame.row, frame.col, pos, size, flip, angle);
    }

    public setAnimation(animation: Animation) {
        this.done = false;
        if (this.animation !== animation) {
            this.animation = animation;
            this.currentFrame = 0;
            this.timer = 0;
        }
    }

    public reset(): void {
        this.timer = 0;
        this.currentFrame = 0;
    }
}
