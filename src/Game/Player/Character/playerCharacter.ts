import { Vector, Controls } from "@common";
import { DynamicObject } from "@core";
import { PlayerArm } from "./playerArm";
import { PlayerItemManager } from "./playerItemManager";
import { PlayerJump } from "./playerJump";
import { PlayerMove } from "./playerMove";
import { PlayerControls } from "./playerControls";
import { PlayerAnimation } from "./playerAnimation";
import { PlayerEquipment } from "./playerEquipment";

class PlayerCharacter {
    public static readonly drawSize: number = 64;
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
            offset = this.equipment.getHolding().getHandOffset();
        }
        this.armFront.setPosition(this.getDrawPos(), PlayerCharacter.drawSize, offset, this.body.isFlip());
    }

    public setPos(pos: Vector) {
        this.body.pos = pos;
        this.setArmPos();
        this.equipment.setHoldingBody(this.armFront.getCenter(), this.body.direction, this.armFront.angle);
        this.body.setNewCollidableObjects();
    }

    private updateControllers(deltaTime: number): void {
        if (this.body.collisions.up) {
            this.jump.isJumping = false;
        }
        this.jump.update(deltaTime);
        this.movement.update(deltaTime);
        this.itemManager.handle();
    }

    public offlineUpdate(deltaTime: number): void {
        this.animator.update(deltaTime, this.equipment.isHolding());
    }

    public update(deltaTime: number): void {
        this.body.update(deltaTime);
        this.updateControllers(deltaTime);
        this.setArmPos();
        this.equipment.setHoldingBody(this.armFront.getCenter(), this.body.direction, this.armFront.angle);
        this.animator.update(deltaTime, this.equipment.isHolding());
    }

    public rotateArm(deltaTime: number, forceup: Boolean = false): void {
        if (this.movement.willTurn()) {
            this.armFront.angle *= -1;
        }
        if (forceup || this.armFront.angle > 0 || this.equipment.itemNoRotationCollision(this.armFront.getCenter())) {
            this.armFront.rotateArmUp(deltaTime);
        } else {
            this.armFront.rotateArmDown(deltaTime);
        }
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

    private getDrawPos(): Vector {
        const x = this.body.pos.x + ((this.body.width - PlayerCharacter.drawSize) / 2);
        const y = this.body.pos.y + (this.body.height - PlayerCharacter.drawSize);
        return new Vector(x, y);
    }

    public draw(): void {
        this.animator.drawBody(this.getDrawPos(), PlayerCharacter.drawSize, this.body.isFlip());
        if (this.equipment.isHolding()) {
            this.equipment.getHolding().draw();
        }
        this.animator.drawArm(this.armFront.pos, this.armFront.getDrawSize(), this.armFront.angle, this.body.isFlip());
    };
}

export { PlayerCharacter };