import { Controls, EquipmentSlot, ProjectileEffect, ProjectileEffectType, ThrowType } from "@common";
import { Vector } from "@math";
import { DynamicObject } from "@core";
import { PlayerArm } from "./playerArm";
import { PlayerItemManager } from "./playerItemManager";
import { PlayerJump } from "./playerJump";
import { PlayerMove } from "./playerMove";
import { PlayerControls } from "./playerControls";
import { PlayerAnimation } from "./playerAnimation";
import { PlayerEquipment } from "./playerEquipment";
import { Connection, GameMessage } from "@server";
import { ProjectileManager, ProjectileTarget } from "@projectile";

class PlayerCharacter {
    public static readonly drawSize: number = 64;
    public static readonly standardHeight: number = 46;
    public static readonly standardWidth: number = 18;

    public standardBody: DynamicObject;
    public activeBody: DynamicObject;

    public animator: PlayerAnimation;
    public armFront = new PlayerArm();
    private dead: boolean = false;

    public controls!: PlayerControls;
    public jump!: PlayerJump;
    public movement!: PlayerMove;
    public equipment!: PlayerEquipment;
    public itemManager!: PlayerItemManager;

    private id: number;

    constructor(pos: Vector, id: number) {
        this.standardBody = new DynamicObject(pos, PlayerCharacter.standardWidth, PlayerCharacter.standardHeight);
        this.activeBody = this.standardBody;
        this.animator = new PlayerAnimation();
        this.equipment = new PlayerEquipment();
        this.id = id;

        const collidable: ProjectileTarget = {
            body: () => this.activeBody,
            penetrationResistance: () => 10,
            onProjectileHit: this.handleEffects.bind(this),
            enabled: () => true
        };
        ProjectileManager.addCollidable(collidable);
    }

    public isLocal(): boolean {
        return !!this.controls;
    }

    public setControls(controls: Controls) {
        this.controls = new PlayerControls(controls);
        this.movement = new PlayerMove(this.standardBody, this.controls);
        this.jump = new PlayerJump(this.standardBody, this.controls);
        this.itemManager = new PlayerItemManager(this.standardBody, this.controls, this.equipment, this.id);
    }

    private setArmPos(): void {
        let offset = new Vector();
        if (this.equipment.hasItem(EquipmentSlot.Hand)) {
            offset = this.equipment.getItem(EquipmentSlot.Hand).getHandOffset();
        }
        this.armFront.setPosition(this.getDrawPos(), PlayerCharacter.drawSize, offset, this.standardBody.isFlip());
        if (this.equipment.hasItem(EquipmentSlot.Hand)) {
            this.equipment.setBody(this.armFront.getCenter(), this.equipment.getItem(EquipmentSlot.Hand).getHoldOffset(), this.standardBody.direction, this.armFront.angle, EquipmentSlot.Hand);
        }
    }

    public reset(): void {
        this.revive();
        this.equipment.unequipAll();
        this.animator.reset();
        this.armFront.angle = 0;
        this.setPos(new Vector);
        this.standardBody.velocity = new Vector();
    }

    public setPos(pos: Vector) {
        this.standardBody.pos = pos;
        this.setArmPos();
        this.standardBody.setNewCollidableObjects();
    }

    private updateControllers(deltaTime: number): void {
        if (this.standardBody.collidingUp) {
            this.jump.isJumping = false;
        }
        this.jump.update(deltaTime);
        this.movement.update(deltaTime);
        this.itemManager.handle();
    }

    public nonLocalUpdate(deltaTime: number): void {
        this.standardBody.update(deltaTime);
        this.setArmPos();
        this.animator.update(deltaTime, this.equipment.hasItem(EquipmentSlot.Hand));
    }

    public update(deltaTime: number): void {
        this.updateControllers(deltaTime);
        this.standardBody.update(deltaTime);
        this.setArmPos();
        this.animator.update(deltaTime, this.equipment.hasItem(EquipmentSlot.Hand));
        this.equipment.setAnimation(this.animator.getCurrentAnimation());
    }

    public rotateArm(deltaTime: number, forceup: Boolean = false): void {
        if (this.isLocal() && this.movement.willTurn()) {
            this.armFront.angle *= -1;
        }
        const rotateUp = this.armFront.angle > 0 || this.equipment.itemNoRotationCollision(this.armFront.getCenter());
        if (rotateUp || forceup) {
            this.armFront.rotateArmUp(deltaTime);
        } else {
            this.armFront.rotateArmDown(deltaTime);
        }
    }

    public die(local: boolean = true) {
        this.dead = true;
        this.equipment.getAllEquippedItems().forEach((_, slot) => {
            this.equipment.throw(slot, ThrowType.Upwards);
        })
        if (local) {
            Connection.get().sendGameMessage(GameMessage.PlayerDead, { id: this.id });
        }
    }

    public revive(): void {
        this.dead = false;
    }

    public isDead() {
        return this.dead;
    }

    private handleEffects(effects: ProjectileEffect[], pos: Vector, local: boolean): void {
        effects.forEach(effect => {
            switch (effect.type) {
                case (ProjectileEffectType.Damage): {
                    if (local) {
                        this.die();
                    }
                    break;
                }
                case (ProjectileEffectType.Knockback): {
                    this.activeBody.velocity.add(effect.amount);
                    break;
                }
            }
        });
    }

    public idleCollision(): boolean {
        const prevHeight = this.standardBody.height;
        const prevY = this.standardBody.pos.y;

        this.standardBody.height = PlayerCharacter.standardHeight;
        this.standardBody.pos.y -= PlayerCharacter.standardHeight - prevHeight;

        const returnValue = this.standardBody.getCollidingTile();

        this.standardBody.pos.y = prevY;
        this.standardBody.height = prevHeight;
        return returnValue !== undefined;
    }

    private getDrawPos(): Vector {
        const x = this.standardBody.pos.x + ((this.standardBody.width - PlayerCharacter.drawSize) / 2);
        const y = this.standardBody.pos.y + (this.standardBody.height - PlayerCharacter.drawSize);
        return new Vector(x, y);
    }

    public draw(): void {
        this.animator.drawBody(this.getDrawPos(), PlayerCharacter.drawSize, this.standardBody.isFlip());
        this.animator.drawItems(this.equipment);
        this.animator.drawArm(this.armFront.pos, this.armFront.getDrawSize(), this.armFront.angle, this.standardBody.isFlip());
    };
}

export { PlayerCharacter };