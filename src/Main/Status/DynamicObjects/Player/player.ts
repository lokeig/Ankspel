import { Input } from "../../Common/input";
import { SpriteAnimator, SpriteSheet, Animation } from "../../Common/sprite";
import { StateMachine } from "../../Common/stateMachine";
import { PlayerState, Vector, Controls } from "../../Common/types";
import { PlayerObject } from "./PlayerObject/playerObject";
import { PlayerFlap } from "./PlayerState/flap";
import { PlayerFlying } from "./PlayerState/flying";
import { PlayerSlide } from "./PlayerState/slide";
import { PlayerStanding } from "./PlayerState/standing";



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
        slide:  { row: 6, frames: 1, fps: 8, repeat: true },
        turn:   { row: 7, frames: 1, fps: 8, repeat: false}
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
                if ((left && this.playerObject.velocity.x > 0.1) || right && this.playerObject.velocity.x < -0.1) {
                    this.animator.setAnimation(this.animations.turn);
                    break;
                }
                if (Math.abs(this.playerObject.velocity.x) > 0.3) {
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

        const flip = this.playerObject.direction === "left";

        const drawPosX = this.playerObject.pos.x + ((this.playerObject.width - this.drawSize) / 2)
        const drawPosY = this.playerObject.pos.y + (this.playerObject.height - this.drawSize);

        this.animator.draw(ctx, {x: drawPosX, y: drawPosY}, this.drawSize, flip);
        if (this.playerObject.holding) {
            this.playerObject.holding.draw(ctx);
        }
    };
}