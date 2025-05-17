import { Controls, Vector } from "./types";
import { SpriteSheet, Animation, SpriteAnimator } from "./sprite";
import { PlayerStateMachine } from "./State/playerStateMachine";
import { PlayerState, State } from "./State/playerState";

export class Player {

    private animator: SpriteAnimator;
    private stateMachine: PlayerStateMachine;
    private currentState: State = State.Idle;
    private states: Map<State, PlayerState> = new Map();

    private animations: Record<string, Animation> = {
        idle:   { row: 0, frames: 1, fps: 8, repeat: true },     
        move:   { row: 1, frames: 6, fps: 8, repeat: true },     
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
        this.drawSize = 64;

        this.animator = new SpriteAnimator(sprite, this.animations.idle);
    }

    update(deltaTime: number): void {
        this.stateMachine.update(deltaTime);
        this.pos = this.stateMachine.pos;
        this.animator.update(deltaTime);
        this.animate();
    };

    
    animate() {
        switch (this.stateMachine.getState()) {
            case State.Idle: this.animator.setAnimation(this.animations.idle); break;
            case State.Flap: this.animator.setAnimation(this.animations.flap); break;
            case State.Move: this.animator.setAnimation(this.animations.move); break;
            case State.Crouch: this.animator.setAnimation(this.animations.crouch); break;
            case State.Slide: this.animator.setAnimation(this.animations.slide); break;
            case State.Jump:
                if (this.stateMachine.velocity.y < 0) {
                    this.animator.setAnimation(this.animations.jump);
                } else {
                    this.animator.setAnimation(this.animations.fall);
                } break;
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