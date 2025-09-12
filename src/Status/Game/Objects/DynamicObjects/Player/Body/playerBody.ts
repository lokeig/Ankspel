import { Animation } from "../../../../Common/Sprite/Animation/animation";
import { SpriteSheet } from "../../../../Common/Sprite/sprite";
import { SpriteAnimator } from "../../../../Common/Sprite/spriteAnimator";
import { Controls } from "../../../../Common/Types/controls";
import { Vector } from "../../../../Common/Types/vector";
import { Utility } from "../../../../Common/Utility/utility";

import { DynamicObject } from "../../Common/dynamicObject";
import { PlayerArm } from "./playerArm";
import { PlayerItemHolder } from "./playerItemHolder";
import { PlayerJump } from "./playerJump";
import { PlayerMove } from "./playerMove";

export class PlayerBody {

    public controls: Controls;
    public drawSize: number = 64;
    public rotateSpeed: number = 25;
    private animator: SpriteAnimator;

    public animations = {
        idle: new Animation(),
        walk: new Animation(),
        crouch: new Animation(),
        flap: new Animation(),
        jump: new Animation(),
        fall: new Animation(),
        slide: new Animation(),
        turn: new Animation()
    };

    public readonly standardFriction: number = 10;
    public readonly slideFriction: number = 5;
    public readonly standardHeight: number = 46;
    public readonly standardWidth: number = 18;

    public dynamicObject: DynamicObject;
    public playerJump = new PlayerJump();
    public playerMove = new PlayerMove();
    public playerItem = new PlayerItemHolder();
    public armFront = new PlayerArm(this.animations.idle);

    constructor(pos: Vector, spriteSheet: SpriteSheet, controls: Controls) {
        this.dynamicObject = new DynamicObject(pos, this.standardWidth, this.standardHeight);
        this.controls = controls;

        this.animator = new SpriteAnimator(spriteSheet, this.animations.idle);
        this.setUpAnimations();
    }

    private setUpAnimations(): void {
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
        this.updateDynamicObject(deltaTime);
        this.animator.update(deltaTime);
        this.updateArm(deltaTime);
    }

    private updateDynamicObject(deltaTime: number): void {
        this.dynamicObject.update(deltaTime);

        if (this.dynamicObject.collisions.up) {
            this.playerJump.isJumping = false;
        }

        this.playerJump.update(deltaTime, this.dynamicObject, this.controls);
        this.playerMove.update(deltaTime, this.dynamicObject, this.controls);
        this.playerItem.update(deltaTime, this.dynamicObject, this.controls);
    }

    private updateArm(deltaTime: number): void {
        this.setArmPosition();
        this.armFront.update(deltaTime);
        this.setHoldingPosition();
    }

    private setHoldingPosition(): void {
        if (!this.playerItem.holding) {
            return;
        }

        const item = this.playerItem.holding.itemLogic;

        item.dynamicObject.setCenterToPos(this.armFront.getCenter());
        item.dynamicObject.direction = this.dynamicObject.direction;
        item.angle = this.armFront.angle;

        const offset = Utility.Angle.rotateForce(
            { x: item.holdOffset.x, y: item.holdOffset.y },
            item.angle
        );
        item.dynamicObject.pos.x += offset.x * this.dynamicObject.getDirectionMultiplier();
        item.dynamicObject.pos.y += offset.y;
    }

    public setArmPosition(): void {
        const pos = this.getDrawPos();
        if (this.dynamicObject.direction === "right") {
            pos.x += this.armFront.posOffset.x;
        } else {
            pos.x += this.drawSize - this.armFront.drawSize - this.armFront.posOffset.x;
        }
        pos.y += this.armFront.posOffset.y;
        this.armFront.pos = pos;
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

        const item = this.playerItem.holding.itemLogic;
        const tempItemPos = {
            x: item.dynamicObject.pos.x,
            y: item.dynamicObject.pos.y
        };
        item.dynamicObject.setCenterToPos(this.armFront.getCenter());
        item.dynamicObject.pos.x += item.holdOffset.x * this.dynamicObject.getDirectionMultiplier();
        item.dynamicObject.pos.y += item.holdOffset.y;
        const collision = item.dynamicObject.getHorizontalTileCollision();
        item.dynamicObject.pos = tempItemPos;

        return collision !== undefined;
    }

    public setArmOffset(amount: Vector): void {
        const result = amount;
        if (this.playerItem.holding) {
            result.x += this.playerItem.holding.itemLogic.handOffset.x;
            result.y += this.playerItem.holding.itemLogic.handOffset.y;
        }
        this.armFront.posOffset = result;
    }

    public idleCollision(): boolean {
        const prevHeight = this.dynamicObject.height;
        const prevY = this.dynamicObject.pos.y;

        this.dynamicObject.height = this.standardHeight;
        this.dynamicObject.pos.y -= this.standardHeight - prevHeight;

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