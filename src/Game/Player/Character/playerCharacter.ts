import { Controls, SpriteAnimator, Vector, SpriteSheet, Utility, Animation, images } from "@common";
import { DynamicObject } from "@core";
import { PlayerArm } from "./playerArm";
import { PlayerItemHolder } from "./playerItemHolder";
import { PlayerJump } from "./playerJump";
import { PlayerMove } from "./playerMove";

class PlayerCharacter {

    public readonly controls: Controls;
    public readonly drawSize: number = 64;
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

    public static readonly standardHeight: number = 46;
    public static readonly standardWidth: number = 18;

    public body: DynamicObject;
    public playerJump: PlayerJump;
    public playerMove: PlayerMove;
    public playerItem: PlayerItemHolder;
    public armFront = new PlayerArm(this.animations.idle);
    public dead: boolean = false;

    constructor(pos: Vector, local: boolean, controls?: Controls) {
        this.body = new DynamicObject(pos, PlayerCharacter.standardWidth, PlayerCharacter.standardHeight);
        if (local && controls) {
            this.controls = controls;
        }
        
        const sprite = new SpriteSheet(images.playerImage, 32, 32);
        this.animator = new SpriteAnimator(sprite, this.animations.idle);
        this.setUpAnimations();
        this.playerMove = new PlayerMove(this.body);
        this.playerJump = new PlayerJump(this.body);
        this.playerItem = new PlayerItemHolder(this.body);
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
        this.body.update(deltaTime);

        if (this.body.collisions.up) {
            this.playerJump.isJumping = false;
        }

        this.playerJump.update(deltaTime, this.controls);
        this.playerMove.update(deltaTime, this.controls);
        this.playerItem.update(deltaTime, this.controls);
    }

    private updateArm(deltaTime: number): void {
        this.setArmPosition();
        this.setHoldingPosition();
        this.armFront.update(deltaTime);
    }

    public setArmPosition(): void {
        const pos = this.getDrawPos();
        const itemOffset = this.playerItem.holding ? this.playerItem.holding.common.handOffset : { x: 0, y: 0 };
        if (this.body.isFlip()) {
            pos.x += this.drawSize - this.armFront.drawSize - this.armFront.posOffset.x - itemOffset.x;
        } else {
            pos.x += this.armFront.posOffset.x + itemOffset.x
        }
        pos.y += this.armFront.posOffset.y + itemOffset.y;

        this.armFront.pos = pos;
    }

    private setHoldingPosition(): void {
        if (!this.playerItem.holding) {
            return;
        }

        const item = this.playerItem.holding.common;

        item.body.setCenterToPos(this.armFront.getCenter());
        item.body.direction = this.body.direction;
        item.angle = this.armFront.angle;

        const offset = Utility.Angle.rotateForce(
            { x: item.holdOffset.x, y: item.holdOffset.y },
            item.angle
        );
        item.body.pos.x += offset.x * this.body.getDirectionMultiplier();
        item.body.pos.y += offset.y;
    }

    public rotateArm(deltaTime: number): void {
        if (this.playerMove.willTurn(this.controls)) {
            this.armFront.angle *= -1;
        }
        if (this.armFront.angle > 0 || this.itemNoRotationCollision()) {
            this.armFront.rotateArmUp(deltaTime);
        } else {
            this.armFront.rotateArmDown(deltaTime);
        }
    }

    private itemNoRotationCollision(): boolean {
        if (!this.playerItem.holding) {
            return false;
        }

        const item = this.playerItem.holding.common;
        const tempItemPos = {
            x: item.body.pos.x,
            y: item.body.pos.y
        };
        item.body.setCenterToPos(this.armFront.getCenter());
        item.body.pos.x += item.holdOffset.x * this.body.getDirectionMultiplier();
        item.body.pos.y += item.holdOffset.y;
        const collision = item.body.getHorizontalTileCollision();
        item.body.pos = tempItemPos;

        return collision !== undefined;
    }

    public setArmOffset(amount: Vector): void {
        const result = amount;
        this.armFront.posOffset = result;
    }

    public idleCollision(): boolean {
        const prevHeight = this.body.height;
        const prevY = this.body.pos.y;

        this.body.height = PlayerCharacter.standardHeight;
        this.body.pos.y -= PlayerCharacter.standardHeight - prevHeight;

        const returnValue = this.body.getHorizontalTileCollision();

        this.body.pos.y = prevY;
        this.body.height = prevHeight;

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
        const x = this.body.pos.x + ((this.body.width - this.drawSize) / 2);
        const y = this.body.pos.y + (this.body.height - this.drawSize);
        return { x, y };
    }

    public draw(): void {
        this.animator.draw(this.getDrawPos(), this.drawSize, this.body.isFlip(), 0);
        if (this.playerItem.holding) {
            this.playerItem.holding.draw();
        }
        this.armFront.draw(this.body.isFlip());
    };
}

export { PlayerCharacter };