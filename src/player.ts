import { GameObject } from "./gameobject";
import { Vector } from "./types";
import { Input } from "./input"
import { SpriteSheet, Animation, SpriteAnimator } from "./sprite";
import { Tile, Grid } from "./tile";

type PlayerState = (
    "Idle"    |
    "Walking" |
    "Jumping" |
    "Falling"
);

type Direction = "Left" | "Right";

export class Player extends GameObject {
    private grounded: boolean = true;
    private CONTROLS: Record<string, string>;
    private animator: SpriteAnimator;
    private state: PlayerState = "Idle";
    private direction: Direction = "Left";

    private jumpAmount = 8;
    private speed = 70;

    private animations: Record<string, Animation> = {
        idle: { row: 0, frames: 1, fps: 8 },     
        walk: { row: 1, frames: 5, fps: 8 },     
        jump: { row: 2, frames: 2, fps: 4 },      
    };

    constructor(pos: Vector, sprite: SpriteSheet, CONTROLS: Record<string, string>) {
        const width = 35;
        const height = 68;
        const drawSize = 96;
        super(pos, width, height, sprite, drawSize);

        this.animator = new SpriteAnimator(sprite, this.animations.idle);
        this.CONTROLS = CONTROLS;
    }

    private latestDirection = "Left";
    update(deltaTime: number): void {

        this.state = "Idle"
        const nearbyTiles = Grid.getNearbyTiles(this);

            // Jumping
        if (Input.isKeyJustPressed(this.CONTROLS.JUMP) && this.grounded) {
            this.velocity.y = -this.jumpAmount;
        }

            // Walking
        const walkLeft = Input.isKeyPressed(this.CONTROLS.LEFT);
        const walkRight = Input.isKeyPressed(this.CONTROLS.RIGHT);

        if (walkLeft)  this.direction = "Left";
        if (walkRight) this.direction = "Right";

        if (walkLeft && walkRight) {
            this.direction = this.latestDirection === "Left" ? this.direction = "Right" : this.direction = "Left";
        } else this.latestDirection = this.direction;
        
        if (walkLeft || walkRight) {
            this.state = "Walking";
            const direction = this.direction === "Right" ? 1 : -1;
            this.velocity.x += this.speed * direction * deltaTime;
        }
            // Gravity
        this.velocity.y += 15 * deltaTime;
        this.pos.y += this.velocity.y;
        this.verticalCollision(nearbyTiles);

            // Friction
        this.velocity.x *= 0.8;
        this.pos.x += this.velocity.x;
        this.horizontalCollision(nearbyTiles);

            // Sprite update
        this.animator.update(deltaTime);
        this.animate();
    };

    verticalCollision(tiles: Set<Tile>) {
        this.grounded = false;

        const corners = this.getCorners();
        
        for (const tile of tiles.values()) {
            if (this.collision(tile)) {
                if(this.velocity.y > 0) {
                    this.pos.y = Grid.snap(corners.BL).y - this.height;
                    this.grounded = true;
                } else {
                    this.pos.y = Grid.snap(corners.TL).y + Grid.tileSize;
                }
                this.velocity.y = 0;
                break;
            }
        }
    }
    
    horizontalCollision(tiles: Set<Tile>) {
        const corners = this.getCorners();

        for (const tile of tiles.values()) {
            if (this.collision(tile)) {
                if (this.velocity.x < 0) {
                    this.pos.x = Grid.snap(corners.BL).x + Grid.tileSize;
                } else {
                    this.pos.x = Grid.snap(corners.BR).x - this.width;
                }
                this.velocity.x = 0;
                break;
            }
        }
    }
    
    getState(): PlayerState {
        return this.state;
    }
    
    
    animate() {
        if (this.state === "Idle")    { this.animator.setAnimation(this.animations.idle) }
        if (this.state === "Walking") { this.animator.setAnimation(this.animations.walk) }
        if (this.state === "Jumping") { this.animator.setAnimation(this.animations.jump) }
    }


    draw(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = "blue";
        ctx.fillRect(this.pos.x, this.pos.y, this.width, this.height);

        const flip = this.direction === "Left";

        const xPos = this.getCenter().x - (this.drawSize / 2);
        const yPos = this.pos.y + (this.height - this.drawSize);

        this.animator.draw(ctx, {x: xPos, y: yPos}, this.drawSize, flip);
    };
}