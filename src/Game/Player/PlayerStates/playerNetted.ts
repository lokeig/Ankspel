import { Vector } from "@math";
import { PlayerState, IState, EquipmentSlot, Countdown, ThrowType, OnItemCollision, OnItemCollisionType } from "@common";
import { PlayerCharacter } from "../Character/playerCharacter";
import { PlayerAnim } from "../../Common/Types/playerAnim";
import { IItem, ItemIgnore, ItemPlayerCollision, ItemPlayerInteraction, ItemProjectileCollision, Ownership } from "@item";
import { DynamicObject } from "@core";
import { zIndex } from "@render";

class PlayerNetted implements IState<PlayerState>, IItem {
    private static holdOffset = new Vector(14, -5);
    private static handOffset = new Vector();

    private player: PlayerCharacter;
    private timer = new Countdown(10);
    public ownership = Ownership.None;

    public body: DynamicObject;
    public info = {
        id: 0,
        handOffset: new Vector,
        holdOffset: new Vector,
        weightFactor: 1,
    }
    public ignoring = new ItemIgnore();
    public playerInteractions = new ItemPlayerInteraction();
    public playerCollision: ItemPlayerCollision;
    public projectileCollision!: ItemProjectileCollision;

    constructor(player: PlayerCharacter, id: number) {
        this.player = player;
        this.body = player.standardBody;
        this.info.id = id;
        this.playerCollision = new ItemPlayerCollision(this.info.id, this.onCollision.bind(this), this.handleCollision.bind(this));
        this.info.handOffset = PlayerNetted.handOffset;
        this.info.holdOffset = PlayerNetted.holdOffset;
    }

    private setCurrentAnimation() {
        const animator = this.player.animator;
        animator.setAnimation(PlayerAnim.Netted);
    }

    public stateEntered(): void {
        if (this.player.isLocal()) {
            this.player.movement.moveEnabled = false;
            this.player.jump.jumpEnabled = false;
            this.player.itemManager.enabled = false;
        }
        this.timer.reset();
        const armOffset = new Vector(10, 28);
        this.player.armFront.setOffset(armOffset);

        this.player.handleNewState(PlayerState.Net);
    }

    public stateUpdate(deltaTime: number): void {
        this.setFriction();
        this.setCurrentAnimation();
        this.player.update(deltaTime);
        this.timer.update(deltaTime);
        this.setEquipmentLocation();

        if (this.ownership !== Ownership.None) { // is owned by player or spawner
            return;
        }
        this.body.ignoreFriction = !this.body.grounded;
        this.player.updateBody(deltaTime);
        if (!this.player.isLocal()) {
            return;
        }
        if (this.player.controls.jump() && this.player.standardBody.grounded) {
            this.player.standardBody.velocity.y -= 150;
            const dir = this.player.controls.getMoveDirection();
            this.player.standardBody.velocity.x = 100 * dir;
            this.timer.update(0.33);
        }
    }

    private setFriction(): void {
        if (Math.abs(this.player.standardBody.velocity.x) > 120) {
            this.player.standardBody.frictionMultiplier = 0.7;
        } else {
            this.player.standardBody.frictionMultiplier = 1;
        }
    }

    private setEquipmentLocation() {
        const center = this.player.standardBody.getCenter();
        const positions: [EquipmentSlot, Vector][] = [
            [EquipmentSlot.Head, new Vector(0, -17)],
            [EquipmentSlot.Body, new Vector(0, 3)],
            [EquipmentSlot.Boots, new Vector(0, PlayerCharacter.standardHeight / 2)],
        ];
        positions.forEach(([slot, offset]) => {
            this.player.equipment.setBody(center, offset, this.player.standardBody.direction, 0, slot);
        });
    }

    public stateChange(): PlayerState {
        if (this.player.isDead()) {
            return PlayerState.Ragdoll;
        }
        if (this.timer.isDone()) {
            return PlayerState.Standard;
        }
        return PlayerState.Net;
    }

    public stateExited(): void {
        if (this.player.isLocal()) {
            this.player.movement.moveEnabled = true;
            this.player.jump.jumpEnabled = true;
            this.player.itemManager.enabled = true;
        }
        this.player.standardBody.frictionMultiplier = 1;
        this.player.standardBody.ignoreFriction = false;
        this.player.netted = false;
        this.ownership = Ownership.None;
    }

    public draw(): void {
        const z = this.ownership === Ownership.InSpawner ? zIndex.Spawners : zIndex.Player;
        this.player.draw(z);
    }

    public update(deltaTime: number): void {
        this.ignoring.update(deltaTime);
    }

    public setAngle(_to: number): void {

    }

    public getAngle(): number {
        return 0;
    }

    private onCollision(deltaTime: number, body: DynamicObject): OnItemCollision[] {
        const offset = 5;
        const minVerticalSpeed = 300;
        const prevPos = this.body.pos.y + this.body.height - this.body.velocity.y * deltaTime;
        if ((prevPos - offset < body.pos.y) && this.body.velocity.y > minVerticalSpeed) {
            return [{ type: OnItemCollisionType.Headbonk }];
        }
        if (Math.abs(this.body.velocity.x) > 300) {
            return [{ type: OnItemCollisionType.Knockback, amount: new Vector(-this.body.velocity.x, 0) }];
        }
        return [];
    }

    private handleCollision(effect: OnItemCollision): void {
        switch (effect.type) {
            case OnItemCollisionType.Knockback: {
                this.body.velocity.x *= -this.body.bounceFactor;
                break;
            }
            case OnItemCollisionType.Headbonk: {
                this.body.velocity.y *= -0.5;
                break;
            }
        }
    }

    public setToDelete(): void {

    }

    public shouldBeDeleted(): boolean {
        return false;
    }

    public enabled(): boolean {
        return this.player.netted;
    }

    public throw(throwType: ThrowType): void {
        this.body.grounded = false;
        const direcMult = this.body.getDirectionMultiplier();

        if (this.body.getCollidingTile()) {
            return;
        }
        switch (throwType) {
            case (ThrowType.Light): {
                this.body.velocity.set(110 * direcMult, -210);
                break;
            }
            case (ThrowType.Hard): {
                this.body.velocity.set(500 * direcMult, -300);
                break;
            }
            case (ThrowType.HardDiagonal): {
                this.body.velocity.set(500 * direcMult, -600);
                break;
            }
            case (ThrowType.Drop): {
                this.body.velocity.set(0 * direcMult, 0);
                break;
            }
            case (ThrowType.Upwards): {
                this.body.velocity.set(0 * direcMult, -600);
                break;
            }
        }
    }
}

export { PlayerNetted };