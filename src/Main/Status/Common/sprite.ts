import { Render } from "../../HMI/render";
import { DrawInfo } from "../../HMI/renderInterface";
import { GameObject } from "./ObjectTypes/gameObject";
import { Vector } from "./types";

export class SpriteSheet {
    imageSrc: string;
    frameWidth: number;
    frameHeight: number;

    constructor(imageSrc: string, frameWidth: number, frameHeight: number) {
        this.imageSrc = imageSrc;
        this.frameWidth = frameWidth;
        this.frameHeight = frameHeight;
    }
  
    getFrame(row: number, col: number): { sx: number, sy: number, sw: number, sh: number } {
        return {
            sx: col * this.frameWidth,
            sy: row * this.frameHeight,
            sw: this.frameWidth,
            sh: this.frameHeight,
        };
    }

    draw(row: number, col: number, pos: Vector, size: number, flip: boolean, angle: number) {

        const { sx, sy, sw, sh } = this.getFrame(row, col);
        const drawInfo: DrawInfo = {
            imageSrc: this.imageSrc,
            sourcePos: { x: sx, y: sy }, 
            sourceWidth: sw,
            sourceHeight: sh,
            drawPos: pos,
            drawWidth: size,
            drawHeight: size,
            flip: flip,
            angle: angle
        };

        Render.get().draw(drawInfo);
    }

    drawLine(row: number, col: number, pos1: Vector, pos2: Vector, width: number) {
        const { sx, sy, sw, sh } = this.getFrame(row, col);
        Render.get().drawLine(this.imageSrc, pos1, pos2, width, new GameObject({ x: sx, y: sy }, sw, sh));
    }
}

export type Frame = {
    row: number,
    col: number
}

export type Animation = {
    frames: Array<Frame>,
    fps: number,
    repeat: boolean
}

export class SpriteAnimator {
    public spriteSheet: SpriteSheet;
    private animation: Animation;
    private currentFrame: number = 0;
    private timer: number = 0;

    constructor(spriteSheet: SpriteSheet, animation: Animation) {
        this.spriteSheet = spriteSheet;
        this.animation = animation;
    }

    public update(deltaTime: number) {
        this.timer += deltaTime;
        const framesAmount = this.animation.frames.length;
        const frameDuration = 1 / this.animation.fps;
        if (this.timer > frameDuration) {
            const framesToAdvance = Math.floor(this.timer / frameDuration);
            const nextFrame = this.currentFrame + framesToAdvance;
            if (!this.animation.repeat && nextFrame > framesAmount - 1) {
                this.currentFrame = framesAmount - 1;
            } else {
                this.currentFrame = nextFrame % framesAmount;
                this.timer %= frameDuration;
            }
        } 
    }

    public draw(pos: Vector, size: number, flip: boolean, angle: number) { 
        const frame = this.animation.frames[this.currentFrame];
        this.spriteSheet.draw(frame.row, frame.col, pos, size, flip, angle)
    }

    public setAnimation(animation: Animation) {
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
