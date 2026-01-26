import { Vector, Controls, ItemInteraction, Utility, EquipmentSlot, ProjectileEffect } from "@common";
import { DynamicObject } from "@core";
import { PlayerArm } from "./playerArm";
import { PlayerItemManager } from "./playerItemManager";
import { PlayerJump } from "./playerJump";
import { PlayerMove } from "./playerMove";
import { PlayerControls } from "./playerControls";
import { PlayerAnimation } from "./playerAnimation";
import { PlayerEquipment } from "./playerEquipment";
import { ProjectileManager } from "@projectile";
import { IItem } from "@item";
import { Connection, GameMessage } from "@server";

class PlayerCharacter {
    public static readonly drawSize: number = 64;
    public static readonly standardHeight: number = 46;
    public static readonly standardWidth: number = 18;

    public body: DynamicObject;
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
        this.body = new DynamicObject(pos, PlayerCharacter.standardWidth, PlayerCharacter.standardHeight);
        this.animator = new PlayerAnimation();
        this.equipment = new PlayerEquipment();
        this.id = id;
    }

    public isLocal(): boolean {
        return this.controls !== undefined;
    }

    public setControls(controls: Controls) {
        this.controls = new PlayerControls(controls);
        this.movement = new PlayerMove(this.body, this.controls);
        this.jump = new PlayerJump(this.body, this.controls);
        this.itemManager = new PlayerItemManager(this.body, this.controls, this.equipment, this.id);
    }

    private setArmPos(): void {
        let offset = new Vector();
        if (this.equipment.hasItem(EquipmentSlot.Hand)) {
            offset = this.equipment.getItem(EquipmentSlot.Hand).getHandOffset();
        }
        this.armFront.setPosition(this.getDrawPos(), PlayerCharacter.drawSize, offset, this.body.isFlip());
        if (this.equipment.hasItem(EquipmentSlot.Hand)) {
            this.equipment.setBody(this.armFront.getCenter(), this.equipment.getItem(EquipmentSlot.Hand).getHoldOffset(), this.body.direction, this.armFront.angle, EquipmentSlot.Hand);
        }
    }

    public setPos(pos: Vector) {
        this.body.pos = pos;
        this.setArmPos();
        this.body.setNewCollidableObjects();
    }

    private updateControllers(deltaTime: number): void {
        if (this.body.collidingUp) {
            this.jump.isJumping = false;
        }
        this.jump.update(deltaTime);
        this.movement.update(deltaTime);
        this.itemManager.handle();
    }

    public nonLocalUpdate(deltaTime: number): void {
        this.body.update(deltaTime);
        this.setArmPos();
        this.animator.update(deltaTime, this.equipment.hasItem(EquipmentSlot.Hand));
        this.handleProjectileCollisions();
    }

    public update(deltaTime: number): void {
        this.body.update(deltaTime);
        this.updateControllers(deltaTime);
        this.setArmPos();
        this.animator.update(deltaTime, this.equipment.hasItem(EquipmentSlot.Hand));
        this.handleProjectileCollisions();
    }

    public rotateArm(deltaTime: number, forceup: Boolean = false): void {
        if (this.isLocal() && this.movement.willTurn()) {
            this.armFront.angle *= -1;
        }
        if (forceup || this.armFront.angle > 0 || this.equipment.itemNoRotationCollision(this.armFront.getCenter())) {
            this.armFront.rotateArmUp(deltaTime);
        } else {
            this.armFront.rotateArmDown(deltaTime);
        }
    }

    public die(local: boolean = true) {
        this.dead = true;
        if (local) {
            Connection.get().sendGameMessage(GameMessage.PlayerDead, { id: this.id });
        }
    }

    public isDead() {
        return this.dead;
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

    private handleProjectileCollisions(): void {
        ProjectileManager.getNearbyProjectiles(this.body.pos, this.body.width, this.body.height).forEach(projectile => {
            const seed = Utility.Random.getRandomSeed();
            let equipment: IItem | null = null; let slot: EquipmentSlot | null = null;

            this.equipment.getAllEquippedItems().forEach((item, equipSlot) => {
                if (item && projectile.wentThrough(item.getBody()).collision) {
                    equipment = item;
                    slot = equipSlot;
                }
            })
            if (equipment || projectile.wentThrough(this.body).collision) {
                const effect = projectile.onPlayerHit(seed);
                if (projectile.isLocal()) {
                    Connection.get().sendGameMessage(GameMessage.PlayerHit, { id: this.id, effect, seed, slot });
                    this.handleEffect(effect, equipment, seed, true);
                }
            }
        });
    }

    public handleEffect(effect: ProjectileEffect, equipment: IItem | null, seed: number, local: boolean): void {
        switch (effect) {
            case ProjectileEffect.Damage: {
                if (equipment && !equipment.shouldBeDeleted() && equipment.interactions.get(ItemInteraction.Hit)) {
                    equipment.interactions.get(ItemInteraction.Hit)!(seed, local);
                } else {
                    this.die();
                }
                break;
            }
        }
    }

    private getDrawPos(): Vector {
        const x = this.body.pos.x + ((this.body.width - PlayerCharacter.drawSize) / 2);
        const y = this.body.pos.y + (this.body.height - PlayerCharacter.drawSize);
        return new Vector(x, y);
    }

    public draw(): void {
        this.animator.drawBody(this.getDrawPos(), PlayerCharacter.drawSize, this.body.isFlip());
        this.animator.drawItems(this.equipment);
        this.animator.drawArm(this.armFront.pos, this.armFront.getDrawSize(), this.armFront.angle, this.body.isFlip());
    };
}

export { PlayerCharacter };