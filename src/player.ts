import { GameObject } from "./gameobject";
import { Vector } from "./types";
import { Input } from "./input"
import { SpriteSheet, Animation, SpriteAnimator } from "./sprite";
import { Grid } from "./tile";

enum PlayerState {
    Idle,
    Walking,
    Jumping,
    Falling
}

type Direction = "LEFT" | "RIGHT";
const left = "LEFT";
const right = "RIGHT";


export class Player extends GameObject {
    grounded: boolean = true;
    private CONTROLS: Record<string, string>;
    private animator: SpriteAnimator;
    private state: PlayerState = PlayerState.Idle;
    private direction: Direction = left;

    private animations: Record<string, Animation> = {
        idle: { row: 0, frames: 1, fps: 8 },     
        walk: { row: 1, frames: 5, fps: 8 },     
        jump: { row: 2, frames: 2, fps: 4 },      
    };

    constructor(pos: Vector, width: number, height: number, sprite: SpriteSheet, drawSize: number, CONTROLS: Record<string, string>) {
        super(pos, width, height, sprite, drawSize);

        this.animator = new SpriteAnimator(sprite, this.animations.idle);
        this.CONTROLS = CONTROLS;

    }

    update(deltaTime: number): void {
            //Player movement
        if (Input.isKeyPressed(this.CONTROLS.JUMP) && this.grounded) {
            this.velocity.y = -250;
            this.grounded = false;
        }

        if (Input.isKeyPressed(this.CONTROLS.RIGHT)) this.direction = right;
        if (Input.isKeyPressed(this.CONTROLS.LEFT)) this.direction = left;

        if (!Input.isKeyPressed(this.CONTROLS.LEFT) && !Input.isKeyPressed(this.CONTROLS.RIGHT)) {
            this.velocity.x *= 0.5;
            this.state = PlayerState.Idle;
        }
        else this.move(70);

        this.animator.update(deltaTime);

        this.animate();
    };
    
    
    move(acceleration: number) {
        this.state = PlayerState.Walking;
        const direction = this.direction === right ? 1 : -1;
        this.velocity.x += acceleration * direction;

        const maxSpeed = 250;
        if (Math.abs(this.velocity.x) > maxSpeed) {
            this.velocity.x = this.velocity.x > 0 ? maxSpeed : -maxSpeed;
        } 
    }
    
    animate() {
        if (this.state === PlayerState.Idle)    { this.animator.setAnimation(this.animations.idle) }
        if (this.state === PlayerState.Walking) { this.animator.setAnimation(this.animations.walk) }
        if (this.state === PlayerState.Jumping) { this.animator.setAnimation(this.animations.jump) }
    }


    draw(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = "blue";
        ctx.fillRect(this.pos.x, this.pos.y, this.width, this.height);

        const flip = this.direction === left;

        const xPos = this.getCenter().x - (this.drawSize / 2);
        const yPos = this.pos.y + (this.height - this.drawSize);

        this.animator.draw(ctx, {x: xPos, y: yPos}, this.drawSize, flip);
    };
}