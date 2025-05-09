import { Controls, Vector } from "./types";
import { SpriteSheet, Animation, SpriteAnimator } from "./sprite";
import { State, PlayerStateMachine } from "./state";

export class Player {

    private animator: SpriteAnimator;
    public readonly stateMachine: PlayerStateMachine;

    private animations: Record<string, Animation> = {
        idle:   { row: 0, frames: 1, fps: 8, repeat: true },     
        walk:   { row: 1, frames: 6, fps: 8, repeat: true },     
        crouch: { row: 2, frames: 1, fps: 8, repeat: true },     
        flap:   { row: 3, frames: 1, fps: 8, repeat: true },
        jump:   { row: 4, frames: 1, fps: 8, repeat: false},
        fall:   { row: 5, frames: 1, fps: 8, repeat: false},
        slide:  { row: 6, frames: 1, fps: 8, repeat: true }      
    };

    private pos: Vector;
    private drawSize: number;

    constructor(pos: Vector, sprite: SpriteSheet, controls: Controls) {        
        this.stateMachine = new PlayerStateMachine(pos, controls);
        this.pos = pos;
        this.drawSize = 96;

        this.animator = new SpriteAnimator(sprite, this.animations.idle);
    }

    update(deltaTime: number): void {
        this.pos = this.stateMachine.pos;
        this.stateMachine.update(deltaTime);
        this.animator.update(deltaTime);
        this.animate();
    };

    
    animate() {
        const state = this.stateMachine.getState();
        if      (state === State.Idle)   {this.animator.setAnimation(this.animations.idle)}
        else if (state === State.Flap)   {this.animator.setAnimation(this.animations.flap)}
        else if (state === State.Move)   {this.animator.setAnimation(this.animations.walk)}
        else if (state === State.Crouch) {this.animator.setAnimation(this.animations.crouch)}
        else if (state === State.Slide)  {this.animator.setAnimation(this.animations.slide)}
        else if (state === State.Jump)   {
            if (this.stateMachine.velocity.y < 0) this.animator.setAnimation(this.animations.jump);
                else                              this.animator.setAnimation(this.animations.fall);
        }

    }


    draw(ctx: CanvasRenderingContext2D): void {
        const width = this.stateMachine.width;
        const height = this.stateMachine.height;
        const x = this.pos.x;
        const y = this.pos.y;

        ctx.fillStyle = "blue";
        ctx.fillRect(x, y, width, height);

        const flip = this.stateMachine.direction === "left";

        const xPos = this.pos.x + ((width - this.drawSize) / 2)
        const yPos = this.pos.y + (height - this.drawSize);

        this.animator.draw(ctx, {x: xPos, y: yPos}, this.drawSize, flip);
    };
}