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
import { AudioManager, Sound } from "@game/Audio";

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
    private collidableBodies: Map<DynamicObject, ProjectileTarget> = new Map();

    constructor(pos: Vector, id: number, color: string) {
        this.standardBody = new DynamicObject(pos, PlayerCharacter.standardWidth, PlayerCharacter.standardHeight);
        this.activeBody = this.standardBody;
        this.animator = new PlayerAnimation(color);
        this.equipment = new PlayerEquipment();
        this.id = id;

        this.addCollidableBody(this.standardBody);
    }

    public addCollidableBody(body: DynamicObject): void {
        const collidable: ProjectileTarget = {
            body: () => body,
            penetrationResistance: () => 2,
            onProjectileHit: (effects, pos, local) => this.handleEffects(body, effects, pos, local),
            enabled: () => true
        };
        ProjectileManager.addCollidable(collidable);
        this.collidableBodies.set(body, collidable);
    }

    public removeCollidable(body: DynamicObject): void {
        const collidable = this.collidableBodies.get(body);
        if (collidable) {
            ProjectileManager.removeCollidable(collidable);
        }
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
            const offset = this.equipment.getItem(EquipmentSlot.Hand).getHoldOffset();
            this.equipment.setBody(this.armFront.getCenter(), offset, this.standardBody.direction, this.armFront.angle, EquipmentSlot.Hand);
        }
    }

    public reset(): void {
        this.revive();
        this.equipment.unequipAll();
        this.animator.reset();
        this.armFront.angle = 0;
        this.standardBody.velocity.set(0, 0);
    }

    public delete(): void {
        this.collidableBodies.forEach(target => ProjectileManager.removeCollidable(target));
        this.equipment.getAllEquippedItems().forEach((_, slot) => this.equipment.equip(null, slot));
    }


    public setPos(pos: Vector) {
        this.activeBody.pos = pos;
        this.setArmPos();
        this.activeBody.setNewCollidableObjects();
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
        const prevGrounded = this.standardBody.grounded;
        const prevVelocityY = Math.abs(this.standardBody.velocity.y);

        this.updateControllers(deltaTime);
        this.standardBody.update(deltaTime);
        this.setArmPos();
        this.animator.update(deltaTime, this.equipment.hasItem(EquipmentSlot.Hand));

        const audioThreshold = 200;
        if (this.standardBody.grounded && !prevGrounded && prevVelocityY > audioThreshold) {
            AudioManager.get().play(Sound.land);
        }
        this.equipment.getAllEquippedItems().forEach(item => {
            if (item?.interactions().getOnPlayerAnimation()) {
                item.interactions().getOnPlayerAnimation()!(this.animator.getCurrentAnimation(), this.equipment.hasItem(EquipmentSlot.Hand));
            }
        })
    }

    public rotateArm(deltaTime: number, forceup: Boolean = false): void {
        if (this.isLocal() && this.movement.willTurn()) {
            this.armFront.angle *= -1;
        }
        const rotateUp = this.armFront.angle > 0 || this.equipment.itemNoRotationCollision(this.armFront.getCenter(), this.armFront.getRotationOffset());
        if (rotateUp || forceup) {
            this.armFront.rotateArmUp(deltaTime);
        } else {
            this.armFront.rotateArmDown(deltaTime);
        }
    }

    public die(local: boolean): void {
        if (this.dead) {
            return;
        }
        this.dead = true;
        this.equipment.getAllEquippedItems().forEach((_, slot) => {
            this.equipment.throw(slot, ThrowType.Upwards);
        });
        if (local) {
            Connection.get().sendGameMessage(GameMessage.PlayerDead, { id: this.id });
        }
        AudioManager.get().play(Sound.death);
    }

    public revive(): void {
        this.dead = false;
    }

    public isDead() {
        return this.dead;
    }

    private handleEffects(body: DynamicObject, effects: ProjectileEffect[], _pos: Vector, local: boolean): void {
        effects.forEach(effect => {
            switch (effect.type) {
                case (ProjectileEffectType.Damage): {
                    if (local) {
                        this.die(true);
                    }
                    break;
                }
                case (ProjectileEffectType.Knockback): {
                    body.velocity.add(effect.amount);
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

        this.animator.drawEquipment(this.equipment);
        this.animator.drawHolding(this.equipment);

        this.animator.drawArm(this.armFront.pos, this.armFront.getDrawSize(), this.armFront.angle, this.standardBody.isFlip());
        this.animator.drawTopLayers(this.equipment);

    };
}

export { PlayerCharacter };