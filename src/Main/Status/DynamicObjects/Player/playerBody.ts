import { rotateForce } from "../../Common/angleHelper";
import { Animation } from "../../Common/animation";
import { SpriteSheet } from "../../Common/sprite";
import { SpriteAnimator } from "../../Common/spriteAnimator";
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
    
    public animations = { 
        idle:   new Animation(), 
        walk:   new Animation(),
        crouch: new Animation(),
        flap:   new Animation(),
        jump:   new Animation(),
        fall:   new Animation(),
        slide:  new Animation(),
        turn:   new Animation()
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
        this.setUpAnimations();
    }

    private setUpAnimations() {
        this.animations.idle.addFrame({ row: 0, col: 0 });
        this.animations.walk.addRow(1, 6);
        this.animations.walk.repeat = true;
        this.animations.crouch.addFrame({ row: 2, col: 0 });
        this.animations.flap.addRow(3, 4);
        this.animations.flap.repeat = true;
        this.animations.flap.fps = 16;
        this.animations.jump.addFrame({ row: 4, col: 0 });
        this.animations.fall.addFrame({ row: 5, col: 0 });
        this.animations.slide.addFrame({ row: 6, col: 0 });
        this.animations.turn.addFrame({ row: 7, col: 0 });
    }
    
    public update(deltaTime: number): void {
        this.updatePlayerBody(deltaTime);
        this.animator.update(deltaTime);
        this.setArmPosition(this.armFront);
        this.armFront.update(deltaTime);
        this.setHoldingPosition();
    }

    public rotateArm(deltaTime: number): void {
        if (this.itemNoRotationCollision()) {
            this.armFront.rotateArmUp(deltaTime);
        } else {
            this.armFront.rotateArmDown(deltaTime);
        }
    }

    private itemNoRotationCollision(): boolean {
        if (!this.playerItem.holding) {
            return false;
        }
        const tempItemPos = { x: this.playerItem.holding.itemLogic.dynamicObject.pos.x, y: 
            this.playerItem.holding.itemLogic.dynamicObject.pos.y };
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
        this.dynamicObject.update(deltaTime);

        if (this.dynamicObject.collisions.up) {
            this.playerJump.isJumping = false;
        }

        this.playerJump.update(deltaTime, this.dynamicObject, this.controls);
        this.playerMove.update(deltaTime, this.dynamicObject, this.controls);
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
            this.armFront.setAnimation(this.armFront.itemHoldingAnimation);
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