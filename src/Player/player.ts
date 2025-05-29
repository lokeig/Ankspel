import { Controls, PlayerState, Vector } from "../types";
import { SpriteSheet, Animation, SpriteAnimator } from "../sprite";
import { StateMachine } from "../stateMachine";
import { PlayerStanding } from "./playerStates/standing";
import { PlayerFlying } from "./playerStates/flying";

import { PlayerObject } from "./playerObject";
import { Input } from "../input";
import { PlayerFlap } from "./playerStates/flap";
import { PlayerSlide } from "./playerStates/slide";

export class Player {

    private drawSize: number = 64;
    private animator: SpriteAnimator;
    private animations: Record<string, Animation> = {
        idle:   { row: 0, frames: 1, fps: 8, repeat: true },     
        walk:   { row: 1, frames: 6, fps: 8, repeat: true },     
        crouch: { row: 2, frames: 1, fps: 8, repeat: true },     
        flap:   { row: 3, frames: 1, fps: 8, repeat: true },
        jump:   { row: 4, frames: 1, fps: 8, repeat: false},
        fall:   { row: 5, frames: 1, fps: 8, repeat: false},
        slide:  { row: 6, frames: 1, fps: 8, repeat: true }      
    };

    public playerObject: PlayerObject;
    private stateMachine: StateMachine<PlayerState, PlayerObject>;

    constructor(pos: Vector, sprite: SpriteSheet, controls: Controls) {    

        this.playerObject = new PlayerObject(pos, controls);  
        this.stateMachine = new StateMachine(PlayerState.Standing, this.playerObject)

        this.stateMachine.addState(PlayerState.Standing, new PlayerStanding());
        this.stateMachine.addState(PlayerState.Flying, new PlayerFlying());
        this.stateMachine.addState(PlayerState.Flap, new PlayerFlap());
        this.stateMachine.addState(PlayerState.Slide, new PlayerSlide());
        this.stateMachine.addState(PlayerState.Crouch, new PlayerSlide(true));

        this.animator = new SpriteAnimator(sprite, this.animations.idle);
    }

    update(deltaTime: number): void {
        this.stateMachine.update(deltaTime);
        this.playerObject.update(deltaTime);
        this.animator.update(deltaTime);
        this.animate();
    };

    
    animate() {
        switch (this.stateMachine.getState()) {
            case PlayerState.Standing: {
                const left = Input.keyDown(this.playerObject.controls.left);
                const right = Input.keyDown(this.playerObject.controls.right);
                if ((left || right) && !(left && right)) {
                    this.animator.setAnimation(this.animations.walk);
                } else {
                    this.animator.setAnimation(this.animations.idle)
                } break;
            }
            case PlayerState.Flying:
                if (this.playerObject.velocity.y < 0) {
                    this.animator.setAnimation(this.animations.jump);
                } else {
                    this.animator.setAnimation(this.animations.fall);
                } break;
            case PlayerState.Flap: this.animator.setAnimation(this.animations.flap); break;
            case PlayerState.Crouch: this.animator.setAnimation(this.animations.crouch); break;
            case PlayerState.Slide: this.animator.setAnimation(this.animations.slide); break;
        }
    }


    draw(ctx: CanvasRenderingContext2D): void {
        
        const width = this.playerObject.width;
        const height = this.playerObject.height;
        const x = this.playerObject.pos.x;
        const y = this.playerObject.pos.y;

        ctx.fillStyle = "blue";
        ctx.fillRect(x, y, width, height);

        const flip = this.playerObject.direction === "left";

        const drawPosX = x + ((width - this.drawSize) / 2)
        const drawPosY = y + (height - this.drawSize);

        this.animator.draw(ctx, {x: drawPosX, y: drawPosY}, this.drawSize, flip);
    };
}