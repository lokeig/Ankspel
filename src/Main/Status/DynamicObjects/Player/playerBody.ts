
import { rotateForce } from "../../Common/angleHelper";
import { SpriteAnimator, Animation, SpriteSheet } from "../../Common/sprite";
import { Controls, Vector } from "../../Common/types";

import { DynamicObject } from "../Common/dynamicObject";
import { PlayerArm } from "./playerArm";
import { PlayerItemHolder } from "./playerItemHolder";
import { PlayerJump } from "./playerJump";
import { PlayerMove } from "./playerMove";

export class PlayerBody {

    public controls: Controls;
    public drawSize: number = 64; 
    private animator: SpriteAnimator; 
    public rotateSpeed: number = 25;
    
    public animations: Record<string, Animation> = { 
        idle:   { frames: [{ row: 0, col: 0 }], fps: 8, repeat: true },     
        walk:   { frames: [{ row: 1, col: 0 }, { row: 1, col: 1 }, { row: 1, col: 2 }, { row: 1, col: 3 }, { row: 1, col: 4 }, { row: 1, col: 5 }], fps: 8, repeat: true},     
        crouch: { frames: [{ row: 2, col: 0 }], fps: 8, repeat: true },     
        flap:   { frames: [{ row: 3, col: 0 }, { row: 3, col: 1 }, { row: 3, col: 2 }, { row: 3, col: 3 }], fps: 16, repeat: true  },
        jump:   { frames: [{ row: 4, col: 0 }], fps: 8, repeat: true },
        fall:   { frames: [{ row: 5, col: 0 }], fps: 8, repeat: true },
        slide:  { frames: [{ row: 6, col: 0 }], fps: 8, repeat: true  },
        turn:   { frames: [{ row: 7, col: 0 }], fps: 8, repeat: true }
    };

    public readonly standardFriction: number = 10;
    public readonly slideFriction: number = 5;
    public readonly idleHeight: number = 46;
    public readonly standardWidth: number = 18;    

    public dynamicObject: DynamicObject;
    public playerJump = new PlayerJump();
    public playerMove = new PlayerMove();
    public playerItem = new PlayerItemHolder();
    public armFront = new PlayerArm(this.animations.idle);

    constructor(pos: Vector, spriteSheet: SpriteSheet, controls: Controls) {
        this.dynamicObject = new DynamicObject(pos, this.standardWidth, this.idleHeight);
        this.controls = controls;
        this.animator = new SpriteAnimator(spriteSheet, this.animations.idle);
    }
    
    public update(deltaTime: number) {
        this.updatePlayerBody(deltaTime);
        this.animator.update(deltaTime);
        this.setArmPosition(this.armFront);
        this.armFront.update(deltaTime);
        this.setHoldingPosition();

    }

    public rotateArmUp(deltaTime: number): void {
        this.armFront.angle -= deltaTime * this.armFront.rotateSpeed;
        this.armFront.angle = Math.max(this.armFront.angle, -Math.PI / 2)
    }

    public rotateArmDown(deltaTime: number): void {
        this.armFront.angle += deltaTime * this.armFront.rotateSpeed;
        this.armFront.angle = Math.min(this.armFront.angle, 0);
    }

    public rotateArm(deltaTime: number): void {
        if (!this.playerItem.holding) {
            this.armFront.angle = 0;
            return;
        }
        if (this.itemNoRotationCollision()) {
            this.rotateArmUp(deltaTime);
        } else {
            this.rotateArmDown(deltaTime);
        }
    }

    private itemNoRotationCollision(): boolean {
        if (!this.playerItem.holding) {
            return false;
        }
        const tempItemPos = { x: this.playerItem.holding.itemLogic.dynamicObject.pos.x, y: this.playerItem.holding.itemLogic.dynamicObject.pos.y };
        this.playerItem.holding.itemLogic.dynamicObject.setCenterToPos(this.armFront.getCenter());
        this.playerItem.holding.itemLogic.dynamicObject.pos.x += this.playerItem.holding.itemLogic.holdOffset.x * this.dynamicObject.getDirectionMultiplier();
        this.playerItem.holding.itemLogic.dynamicObject.pos.y += this.playerItem.holding.itemLogic.holdOffset.y;
        const collision = this.playerItem.holding.itemLogic.dynamicObject.getHorizontalTileCollision();
        this.playerItem.holding.itemLogic.dynamicObject.pos = tempItemPos;
        
        return collision !== undefined;
    }

    public setHoldingPosition() {
        if (!this.playerItem.holding) {
            return;
        }
        
        this.playerItem.holding.itemLogic.dynamicObject.setCenterToPos(this.armFront.getCenter());
        this.playerItem.holding.itemLogic.dynamicObject.direction = this.dynamicObject.direction;
        this.playerItem.holding.itemLogic.angle = this.armFront.angle;

        const offset = rotateForce(
            { x: this.playerItem.holding.itemLogic.holdOffset.x, y: this.playerItem.holding.itemLogic.holdOffset.y }, 
            this.playerItem.holding.itemLogic.angle
        );
        this.playerItem.holding.itemLogic.dynamicObject.pos.x += offset.x * this.dynamicObject.getDirectionMultiplier();
        this.playerItem.holding.itemLogic.dynamicObject.pos.y += offset.y;
    }

    public getPixelFactor(): Vector {
        return { 
            x: this.drawSize / this.animator.spriteSheet.frameWidth,
            y: this.drawSize / this.animator.spriteSheet.frameHeight
        };
    }

    private setArmPosition(arm: PlayerArm): void {
        const result = this.getDrawPos();
        if (this.dynamicObject.direction === "right") {
            result.x += arm.posOffset.x;
        } else {
            result.x += this.drawSize - arm.drawSize - arm.posOffset.x;
        }
        result.y += arm.posOffset.y;
        arm.pos = result;
    }

    public setArmOffset(arm: PlayerArm, pos: Vector): void {
        const result = pos;
        if (this.playerItem.holding) {
            result.x += this.playerItem.holding.itemLogic.handOffset.x;
            result.y += this.playerItem.holding.itemLogic.handOffset.y;
        }
        arm.posOffset = result;
    }

    private updatePlayerBody(deltaTime: number): void {
        
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

    public setAnimation(animation: Animation) {
        this.animator.setAnimation(animation);
        this.armFront.setAnimation(animation);
        if (this.playerItem.holding) {
            this.armFront.setAnimation(this.armFront.itemAnimation);
        }
    }

    public getDrawPos(): Vector {
        const x = this.dynamicObject.pos.x + ((this.dynamicObject.width - this.drawSize) / 2);
        const y = this.dynamicObject.pos.y + (this.dynamicObject.height - this.drawSize);
        return { x, y };
    }
    
    public draw(): void {
        const flip = this.dynamicObject.direction === "left";
        
        this.animator.draw(this.getDrawPos(), this.drawSize, flip, 0);
        if (this.playerItem.holding) {
            this.playerItem.holding.draw();
        }
        this.armFront.draw(flip);
    };

}