import { Vector, Controls, BodyParts, ItemInteraction, Utility } from "@common";
import { DynamicObject, GameObject } from "@core";
import { PlayerArm } from "./playerArm";
import { PlayerItemManager } from "./playerItemManager";
import { PlayerJump } from "./playerJump";
import { PlayerMove } from "./playerMove";
import { PlayerControls } from "./playerControls";
import { PlayerAnimation } from "./playerAnimation";
import { PlayerEquipment } from "./playerEquipment";
import { EquipmentSlot } from "@item";
import { IProjectile, ProjectileEffect, ProjectileManager } from "@projectile";

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
        if (this.body.collisions.up) {
            this.jump.isJumping = false;
        }
        this.jump.update(deltaTime);
        this.movement.update(deltaTime);
        this.itemManager.handle();
    }

    public nonLocalUpdate(deltaTime: number): void {
        this.animator.update(deltaTime, this.equipment.hasItem(EquipmentSlot.Hand));
    }

    public update(deltaTime: number): void {
        this.body.update(deltaTime);
        this.updateControllers(deltaTime);
        this.setArmPos();
        this.animator.update(deltaTime, this.equipment.hasItem(EquipmentSlot.Hand));
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

    public handleProjectileCollisions(head: GameObject, body: GameObject, legs: GameObject): void {
        ProjectileManager.getNearbyProjectiles(this.body.pos, this.body.width, this.body.height).forEach(projectile => {
            if (head.collision(projectile.getBody())) {
                this.handleEffect(projectile, BodyParts.Head);
            } else if (body.collision(projectile.getBody())) {
                this.handleEffect(projectile, BodyParts.Center);
            } else if (legs.collision(projectile.getBody())) {
                this.handleEffect(projectile, BodyParts.Legs);
            }
        });
    }

    private handleEffect(projectile: IProjectile, bodyPart: BodyParts): void {
        if (!projectile.isLocal()) {
            projectile.setToDelete();
            return;
        }
        const seed = Utility.Random.getRandomSeed();
        switch (projectile.onPlayerHit()) {
            case (ProjectileEffect.Damage): {
                if (bodyPart === BodyParts.Head) {
                    if (this.equipment.hasItem(EquipmentSlot.Head)) {
                        this.equipment.getItem(EquipmentSlot.Head).interactions.get(ItemInteraction.Hit)!(seed, this.isLocal());
                    } else {
                        this.dead = true;
                    }
                } else if (bodyPart === BodyParts.Center) {
                    if (this.equipment.hasItem(EquipmentSlot.Body)) {
                        this.equipment.getItem(EquipmentSlot.Body).interactions.get(ItemInteraction.Hit)!(seed, this.isLocal());
                    } else {
                        this.dead = true;
                    }
                } else {
                    this.dead = true;
                }
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
        this.equipment.getAllEquippedItems().forEach(item => {
            if (item) {
                item.draw();
            }
        });
        this.animator.drawArm(this.armFront.pos, this.armFront.getDrawSize(), this.armFront.angle, this.body.isFlip());
    };
}

export { PlayerCharacter };