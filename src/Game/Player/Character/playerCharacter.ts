import { Vector, Utility, Controls } from "@common";
import { DynamicObject } from "@core";
import { PlayerArm } from "./playerArm";
import { PlayerItemManager } from "./playerItemManager";
import { PlayerJump } from "./playerJump";
import { PlayerMove } from "./playerMove";
import { PlayerControls } from "./playerControls";
import { PlayerAnimation } from "./playerAnimation";
import { PlayerEquipment } from "./playerEquipment";

class PlayerCharacter {

    public readonly drawSize: number = 64;
    public static readonly standardHeight: number = 46;
    public static readonly standardWidth: number = 18;

    public body: DynamicObject;
    public animator: PlayerAnimation;
    public armFront = new PlayerArm();
    public dead: boolean = false;

    public controls!: PlayerControls;
    public jump!: PlayerJump;
    public movement!: PlayerMove;
    public equipment!: PlayerEquipment;
    public itemManager!: PlayerItemManager;

    constructor(pos: Vector) {
        this.body = new DynamicObject(pos, PlayerCharacter.standardWidth, PlayerCharacter.standardHeight);
        this.animator = new PlayerAnimation();
        this.equipment = new PlayerEquipment();
    }

    public isLocal(): boolean {
        return this.controls !== undefined;
    }

    public setControls(controls: Controls) {
        this.controls = new PlayerControls(controls);
        this.movement = new PlayerMove(this.body, this.controls);
        this.jump = new PlayerJump(this.body, this.controls);
        this.itemManager = new PlayerItemManager(this.body, this.controls, this.equipment);
    }

    private setArmPos(): void {
        let offset = new Vector();
        if (this.equipment.isHolding()) {
            offset = this.equipment.getHolding().common.handOffset;
        }
        this.armFront.setPosition(this.getDrawPos(), this.drawSize, offset, this.body.isFlip());
    }

    private setHoldingPosition(): void {
        if (!this.equipment.isHolding()) {
            return;
        }
        const item = this.equipment.getHolding().common;
        item.body.setCenterToPos(this.armFront.getCenter());
        item.body.direction = this.body.direction;
        item.angle = this.armFront.angle;
        
        const offset = Utility.Angle.rotateForce(item.holdOffset, item.angle);
        item.body.pos.x += offset.x * this.body.getDirectionMultiplier();
        item.body.pos.y += offset.y;
    }

    public setPos(pos: Vector) {
        this.body.pos = pos;
        this.setArmPos();
        this.setHoldingPosition();
        this.body.setNewCollidableObjects();
    }


    private updateControllers(deltaTime: number): void {
        if (this.body.collisions.up) {
            this.jump.isJumping = false;
        }
        this.jump.update(deltaTime);
        this.movement.update(deltaTime);
        this.itemManager.update(deltaTime);
    }

    public offlineUpdate(deltaTime: number): void {
        this.animator.update(deltaTime, this.equipment.isHolding());
    }

    public update(deltaTime: number): void {
        this.body.update(deltaTime);
        this.updateControllers(deltaTime);
        this.setArmPos();
        this.setHoldingPosition();
        this.animator.update(deltaTime, this.equipment.isHolding());
    }

    public rotateArm(deltaTime: number, forceup: Boolean = false): void {
        if (this.movement.willTurn()) {
            this.armFront.angle *= -1;
        }
        if (forceup || this.armFront.angle > 0 || this.itemNoRotationCollision()) {
            this.armFront.rotateArmUp(deltaTime);
        } else {
            this.armFront.rotateArmDown(deltaTime);
        }
    }

    private itemNoRotationCollision(): boolean {
        if (!this.equipment.isHolding()) {
            return false;
        }
        const item = this.equipment.getHolding().common;
        const tempItemPos = item.body.pos.clone();

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
        return new Vector(x, y);
    }

    public draw(): void {
        this.animator.drawBody(this.getDrawPos(), this.drawSize, this.body.isFlip());
        if (this.equipment.isHolding()) {
            this.equipment.getHolding().draw();
        }
        this.animator.drawArm(this.armFront.pos, this.armFront.getDrawSize(), this.armFront.angle, this.body.isFlip());
    };
}

export { PlayerCharacter };