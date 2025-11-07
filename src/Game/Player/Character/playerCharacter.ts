import { Vector, Utility, Controls } from "@common";
import { DynamicObject } from "@core";
import { PlayerArm } from "./playerArm";
import { PlayerItemHolder } from "./playerItemHolder";
import { PlayerJump } from "./playerJump";
import { PlayerMove } from "./playerMove";
import { PlayerControls } from "./playerControls";
import { playerAnimation } from "./playerAnimation";

class PlayerCharacter {

    public readonly drawSize: number = 64;
    public static readonly standardHeight: number = 46;
    public static readonly standardWidth: number = 18;

    public body: DynamicObject;
    public animator: playerAnimation;
    public armFront = new PlayerArm();
    public dead: boolean = false;

    public controls!: PlayerControls;
    public playerJump!: PlayerJump;
    public playerMove!: PlayerMove;
    public playerItem!: PlayerItemHolder;

    constructor(pos: Vector) {
        this.body = new DynamicObject(pos, PlayerCharacter.standardWidth, PlayerCharacter.standardHeight);
        this.animator = new playerAnimation();
    }

    private setArmPos(): void {
        let offset = { x: 0, y: 0 };
        if (this.playerItem.holding) {
            offset = this.playerItem.holding.common.handOffset;
        }
        this.armFront.setPosition(this.getDrawPos(), this.drawSize, offset, this.body.isFlip());
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

    public setPos(pos: Vector) {
        this.body.pos = pos;
        this.setArmPos();
        this.setHoldingPosition();
        this.body.setNewCollidableObjects();
    }

    public setControls(controls: Controls) {
        this.controls = new PlayerControls(controls);
        this.playerMove = new PlayerMove(this.body, this.controls);
        this.playerJump = new PlayerJump(this.body, this.controls);
        this.playerItem = new PlayerItemHolder(this.body, this.controls);
    }

    private updateControllers(deltaTime: number): void {
        if (this.body.collisions.up) {
            this.playerJump.isJumping = false;
        }
        this.playerJump.update(deltaTime);
        this.playerMove.update(deltaTime);
        this.playerItem.update(deltaTime);
    }

    public update(deltaTime: number): void {
        this.body.update(deltaTime);
        this.setArmPos();
        this.updateControllers(deltaTime);
        this.setHoldingPosition();
        const holdingItem = this.playerItem.holding !== null;
        this.animator.update(deltaTime, holdingItem);
    }

    public rotateArm(deltaTime: number, forceup: Boolean = false): void {
        if (this.playerMove.willTurn()) {
            this.armFront.angle *= -1;
        }
        if (forceup || this.armFront.angle > 0 || this.itemNoRotationCollision()) {
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

    public getDrawPos(): Vector {
        const x = this.body.pos.x + ((this.body.width - this.drawSize) / 2);
        const y = this.body.pos.y + (this.body.height - this.drawSize);
        return { x, y };
    }

    public draw(): void {
        this.animator.drawBody(this.getDrawPos(), this.drawSize, this.body.isFlip());
        if (this.playerItem.holding) {
            this.playerItem.holding.draw();
        }
        this.animator.drawArm(this.armFront.pos, this.armFront.getDrawSize(), this.armFront.angle, this.body.isFlip());
    };
}

export { PlayerCharacter };