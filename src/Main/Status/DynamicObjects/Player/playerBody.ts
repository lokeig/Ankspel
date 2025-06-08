
import { Input } from "../../Common/input";
import { SpriteAnimator, Animation, SpriteSheet } from "../../Common/sprite";
import { Controls, PlayerState, Vector } from "../../Common/types";

import { DynamicObject } from "../Common/dynamicObject";
import { PlayerItemHolder } from "./playerItemHolder";
import { PlayerJump } from "./playerJump";
import { PlayerMove } from "./playerMove";

export class PlayerBody {

    public controls: Controls;
    private drawSize: number = 64; 
    private animator: SpriteAnimator; 
    private animations: Record<string, Animation> = { 
        idle:   { row: 0, frames: 1, fps: 8, repeat: true  },     
        walk:   { row: 1, frames: 6, fps: 8, repeat: true  },     
        crouch: { row: 2, frames: 1, fps: 8, repeat: true  },     
        flap:   { row: 3, frames: 1, fps: 8, repeat: true  },
        jump:   { row: 4, frames: 1, fps: 8, repeat: false },
        fall:   { row: 5, frames: 1, fps: 8, repeat: false },
        slide:  { row: 6, frames: 1, fps: 8, repeat: true  },
        turn:   { row: 7, frames: 1, fps: 8, repeat: false }
    };

    public readonly standardFriction: number = 10;
    public readonly slideFriction: number = 5;
    public readonly idleHeight: number = 46;
    public readonly standardWidth: number = 18;    

    public dynamicObject: DynamicObject;
    public playerJump = new PlayerJump();
    public playerMove = new PlayerMove();
    public playerItem = new PlayerItemHolder();

    constructor(pos: Vector, spriteSheet: SpriteSheet, controls: Controls) {
        this.dynamicObject = new DynamicObject(pos, this.standardWidth, this.idleHeight);
        this.controls = controls;
        this.animator = new SpriteAnimator(spriteSheet, this.animations.idle);
    }
    
    update(deltaTime: number) {
        this.updatePlayerBody(deltaTime);
        this.animator.update(deltaTime);
    }

    updatePlayerBody(deltaTime: number) {
        this.playerJump.update(deltaTime, this.dynamicObject, this.controls);
        this.playerMove.update(deltaTime, this.dynamicObject, this.controls);

        this.dynamicObject.velocityPhysicsUpdate(deltaTime);

        // Handle Horizontal Collisions
        this.dynamicObject.pos.x += this.dynamicObject.velocity.x;
        const horizontalCollidingTile = this.dynamicObject.getHorizontalTileCollision();
        if (horizontalCollidingTile) {
            this.dynamicObject.handleSideCollision(horizontalCollidingTile);
        }

        // Handle Vertical Collisions
        this.dynamicObject.pos.y += this.dynamicObject.velocity.y;
        const verticalCollidingTile = this.dynamicObject.getVerticalTileCollision();
        if (verticalCollidingTile) {
            if (this.dynamicObject.velocity.y > 0) {
                this.dynamicObject.handleBotCollision(verticalCollidingTile);
            } else {
                this.dynamicObject.handleTopCollision(verticalCollidingTile);
                this.playerJump.isJumping = false;
            }
        }

        this.playerItem.update(deltaTime, this.dynamicObject, this.controls);
    }

    public onPlatform(): boolean {
        if (!this.dynamicObject.grounded) {
            return false;
        }

        let allPlatforms = true;
        let noCollisions = true;

        const prevPosY = this.dynamicObject.pos.y;
        this.dynamicObject.pos.y += 5;

        for (const collidable of this.dynamicObject.collidableObjects.values()) {
            if (this.dynamicObject.collision(collidable.gameObject)) {
                noCollisions = false;
                if (!collidable.platform) {
                    allPlatforms = false;
                }
            }
        }

        this.dynamicObject.pos.y = prevPosY;

        return !noCollisions && allPlatforms;
    }

    public idleCollision(): boolean {
        const prevHeight = this.dynamicObject.height;
        const prevY = this.dynamicObject.pos.y;

        this.dynamicObject.height = this.idleHeight;
        this.dynamicObject.pos.y -= this.idleHeight - prevHeight;
        
        const returnValue = this.dynamicObject.getHorizontalTileCollision();

        this.dynamicObject.pos.y = prevY;
        this.dynamicObject.height = prevHeight;

        return returnValue !== undefined;
    }

    setAnimation(state: PlayerState) {
        switch (state) {
            case PlayerState.Standing: {
                const left = Input.keyDown(this.controls.left);
                const right = Input.keyDown(this.controls.right);
                if ((left && this.dynamicObject.velocity.x > 0.1) || right && this.dynamicObject.velocity.x < -0.1) {
                    this.animator.setAnimation(this.animations.turn);
                    break;
                }
                if (Math.abs(this.dynamicObject.velocity.x) > 0.3) {
                    this.animator.setAnimation(this.animations.walk);
                } else {
                    this.animator.setAnimation(this.animations.idle)
                } break;
            }
            case PlayerState.Flying:
                if (this.dynamicObject.velocity.y < 0) {
                    this.animator.setAnimation(this.animations.jump);
                } else {
                    this.animator.setAnimation(this.animations.fall);
                } break;
            case PlayerState.Flap: this.animator.setAnimation(this.animations.flap); break;
            case PlayerState.Crouch: this.animator.setAnimation(this.animations.crouch); break;
            case PlayerState.Slide: this.animator.setAnimation(this.animations.slide); break;
        }
    }

    draw(): void {
        const flip = this.dynamicObject.direction === "left";

        const drawPosX = this.dynamicObject.pos.x + ((this.dynamicObject.width - this.drawSize) / 2)
        const drawPosY = this.dynamicObject.pos.y + (this.dynamicObject.height - this.drawSize);
        
        this.animator.draw({ x: drawPosX, y: drawPosY }, this.drawSize, flip);
        if (this.playerItem.holding) {
            this.playerItem.holding.draw();
        }
    };

}