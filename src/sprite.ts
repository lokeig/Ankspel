import { Vector } from "./types";

export class SpriteSheet {
    image: HTMLImageElement = new Image;
    frameSize: number;

  
    constructor(imageSrc: string, frameSize: number) {
        this.image.src = imageSrc;
        this.frameSize = frameSize
    }
  
    getFrame(row: number, col: number): { sx: number, sy: number, sw: number, sh: number } {
        return {
            sx: col * this.frameSize,
            sy: row * this.frameSize,
            sw: this.frameSize,
            sh: this.frameSize,
        };
    }

    draw(ctx: CanvasRenderingContext2D, row: number, col: number, pos: Vector, size: number, flip: boolean) {
        const { sx, sy, sw, sh } = this.getFrame(row, col);

        ctx.save();
        if (flip) {
            ctx.translate(pos.x + size / 2, pos.y);
            ctx.scale(-1, 1);
            ctx.translate(-pos.x - size / 2, -pos.y); 
        }
        ctx.drawImage(
        this.image,
            sx, sy,
            sw, sh,
            pos.x, pos.y,
            size, size
        );
        ctx.restore();
    }
}

export type Animation = {
    frames: number,
    row: number,
    fps: number,
    repeat: boolean
}

export class SpriteAnimator {
    spriteSheet: SpriteSheet;
    animation: Animation;
    currentFrame: number = 0;
    timer: number = 0;

    constructor(spriteSheet: SpriteSheet, animation: Animation) {
        this.spriteSheet = spriteSheet;
        this.animation = animation;
    }

    update(deltaTime: number) {
        this.timer += deltaTime;
        const frameDuration = 1 / this.animation.fps;
        if (this.timer > frameDuration) {
            const framesToAdvance = Math.floor(this.timer / frameDuration);
            const nextFrame = this.currentFrame + framesToAdvance;
            if (!this.animation.repeat && nextFrame > this.animation.frames - 1) {
                this.currentFrame = this.animation.frames - 1;
            } else {
                this.currentFrame = nextFrame % this.animation.frames;
            }
        
            this.timer %= frameDuration;
        } 
    }

    draw(ctx: CanvasRenderingContext2D, pos: Vector, size: number, flip: boolean) {
        this.spriteSheet.draw(ctx, this.animation.row, this.currentFrame, pos, size, flip)
    }

    animEqual(anim1: Animation, anim2: Animation){
        return anim1.fps    === anim2.fps    &&
               anim1.frames === anim2.frames &&
               anim1.row    === anim2.row    &&
               anim1.repeat === anim2.repeat
    }

    setAnimation(animation: Animation) {
        if (!this.animEqual(this.animation, animation)) {
            this.animation = animation;
            this.currentFrame = 0;
            this.timer = 0;
        }
    }
}
