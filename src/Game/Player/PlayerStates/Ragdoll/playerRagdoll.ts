import { Vector } from "@math";
import { Countdown, Utility, PlayerState, InputMode, ThrowType, IState, EquipmentSlot, PlayerAnim, ProjectileEffect } from "@common";
import { DynamicObject } from "@core";
import { IItem, Ownership } from "@item";
import { ItemUseInteractions } from "@game/Item/itemUseInteractions";
import { PlayerCharacter } from "@game/Player/Character/playerCharacter";

class PlayerRagdoll implements IState<PlayerState>, IItem {

    private static readonly TorsoDistance = -1;
    private static readonly LegHeadDistance = 1.5;
    private static readonly ExitJumpHeight = 25;
    private static readonly ExitVerticalSpeed = -250;
    private static readonly OwnedDirectionChangeImpulse = 1000;

    private player: PlayerCharacter;

    private head: DynamicObject;
    private torso: DynamicObject;
    private legs: DynamicObject;

    private headAngle = 0;
    private legsAngle = 0;

    private readonly height: number;
    private readonly width: number;

    private coyoteTime = new Countdown(0.15);
    private owned: Ownership = Ownership.None;
    private currentState = false;

    public useInteractions = new ItemUseInteractions();

    constructor(player: PlayerCharacter, _id: number) {
        this.player = player;

        this.height = PlayerCharacter.standardHeight / 3;
        this.width = PlayerCharacter.standardWidth;

        this.head = new DynamicObject(new Vector(), this.width, this.height);
        this.torso = new DynamicObject(new Vector(), this.width, this.width);
        this.legs = new DynamicObject(new Vector(), this.width, this.height);

        this.configurePhysics();
    }

    private configurePhysics(): void {
        const bounce = 0.5;
        const friction = 8;

        [this.head, this.torso, this.legs].forEach(body => {
            body.bounceFactor = bounce;
            body.friction = friction;
        });

        this.torso.ignorePlatforms = true;
    }

    public stateEntered(from: PlayerState): void {
        this.currentState = true;

        this.player.activeBody = this.legs;

        this.player.equipment.throw(EquipmentSlot.Hand, ThrowType.Drop);
        this.coyoteTime.setToReady();

        this.head.direction = this.player.standardBody.direction;
        this.legs.direction = this.player.standardBody.direction;

        this.initializePositions(from);
        this.initializeVelocities();
        this.applyJumpInheritance();

        this.headAngle = 0;
        this.legsAngle = 0;

        this.player.equipment.getAllEquippedItems().forEach((item) => {
            if (item && item.interactions().getOnPlayerState()) {
                const effects = item.interactions().getOnPlayerState()!(PlayerState.Ragdoll);
                this.player.itemManager.handleEffects(item, effects);
            }
        });
    }

    public stateUpdate(deltaTime: number): void {
        this.player.standardBody.pos.set(this.torso.pos.x, this.torso.pos.y);
        if (this.isHeld()) {
            this.updateOwned(deltaTime);
            return;
        }

        if (!this.player.isLocal()) {
            console.log(Ownership[this.getOwnership()])
        }
        if (this.isOnSpawner()) {
            this.updateOnSpawner(deltaTime);
            return;
        }

        this.updateTimers(deltaTime);
        this.updatePhysics(deltaTime);
        this.solveConstraints(deltaTime);
        this.handleLocalInput(deltaTime);
        this.updateAngles();
        this.syncEquipment();

        this.player.equipment.setAnimation(this.player.animator.getCurrentAnimation());
    }

    public stateChange(): PlayerState {
        if (this.player.isDead() || this.isHeld()) {
            return PlayerState.Ragdoll;
        }
        const exit = this.player.controls.ragdoll() || this.player.controls.jump(InputMode.Press);

        if (exit && !this.coyoteTime.isDone()) {
            return PlayerState.Standard;
        }
        return PlayerState.Ragdoll;
    }

    public stateExited(): void {
        this.currentState = false;

        this.player.activeBody = this.player.standardBody;
        this.syncBackToPlayerBody();
        this.player.standardBody.pos.y -= PlayerRagdoll.ExitJumpHeight;
        this.player.standardBody.velocity = new Vector(this.torso.velocity.x, PlayerRagdoll.ExitVerticalSpeed);

        this.owned = Ownership.None;
    }

    private initializePositions(from: PlayerState): void {
        const basePos = this.player.standardBody.pos;

        if (from === PlayerState.Slide) {
            const mult = this.player.standardBody.getDirectionMultiplier();
            const centerX = this.player.standardBody.getCenter().x;

            const offset = (i: number) => new Vector(centerX + (i * this.width / 3), basePos.y + this.height);

            this.head.pos = offset(-1 * mult);
            this.torso.pos = offset(0);
            this.legs.pos = offset(1 * mult);
        } else {
            this.head.pos = basePos.clone();
            this.torso.pos = basePos.clone().add(new Vector(0, this.height));
            this.legs.pos = basePos.clone().add(new Vector(0, this.height * 2));
        }
    }

    private initializeVelocities(): void {
        const velocity = this.player.standardBody.velocity;

        this.head.velocity = velocity.clone();
        this.torso.velocity = velocity.clone();
        this.legs.velocity = velocity.clone();

        this.head.velocity.x -= Utility.Random.getInRange(-30, 30);
    }

    private applyJumpInheritance(): void {
        if (!this.player.isLocal() || !this.player.jump.isJumping) {
            return;
        }
        const jumpLeft = this.player.jump.getJumpRemaining();
        const jumpCharge = this.player.jump.getJumpForce() / 5;
        const impulse = jumpLeft * jumpCharge;

        this.head.velocity.y -= impulse;
        this.torso.velocity.y -= impulse;
        this.legs.velocity.y -= impulse;
    }


    private updateTimers(deltaTime: number): void {
        this.coyoteTime.update(deltaTime);
        if (this.isGrounded()) {
            this.coyoteTime.reset()
        };
    }

    private updatePhysics(deltaTime: number): void {
        this.head.ignoreFriction = !this.head.grounded;
        this.torso.ignoreFriction = !this.torso.grounded;
        this.legs.ignoreFriction = !this.legs.grounded;

        this.head.update(deltaTime);
        this.torso.update(deltaTime);
        this.legs.update(deltaTime);
    }

    private solveConstraints(deltaTime: number): void {
        this.keepDistance(deltaTime, this.head, this.torso, this.height + PlayerRagdoll.TorsoDistance, false);
        this.keepDistance(deltaTime, this.legs, this.torso, this.height + PlayerRagdoll.TorsoDistance, false);
        this.keepDistance(deltaTime, this.head, this.legs, this.height * PlayerRagdoll.LegHeadDistance, true);
    }

    private handleLocalInput(_deltaTime: number): void {
        if (!this.player.isDead() && this.player.isLocal()) {

        }
    }

    private syncBackToPlayerBody(): void {
        const pos = new Vector(
            this.legs.pos.x,
            this.legs.pos.y + this.legs.height - PlayerCharacter.standardHeight
        );
        this.player.activeBody = this.player.standardBody;

        this.player.standardBody.grounded = true;
        this.player.setPos(pos);
    }

    private updateAngles(): void {
        this.headAngle = this.calculateAngle(this.head, this.torso, -Math.PI / 2);
        this.legsAngle = this.calculateAngle(this.legs, this.torso, Math.PI / 2);
    }

    private syncEquipment(): void {
        this.player.equipment.setBody(
            this.head.getCenter(),
            new Vector(0, -4),
            this.head.direction,
            this.headAngle,
            EquipmentSlot.Head
        );

        this.player.equipment.setBody(
            this.head.getCenter(),
            new Vector(0, 16),
            this.head.direction,
            this.headAngle,
            EquipmentSlot.Body
        );
    }

    private updateOwned(deltaTime: number): void {
        if (this.legs.direction !== this.head.direction) {
            this.torso.velocity.add(PlayerRagdoll.OwnedDirectionChangeImpulse / 2 * this.head.getDirectionMultiplier());
            this.head.velocity.add(PlayerRagdoll.OwnedDirectionChangeImpulse / 2 * this.head.getDirectionMultiplier());
        }

        this.head.direction = this.legs.direction;

        this.head.update(deltaTime);
        this.torso.update(deltaTime);

        this.solveConstraints(deltaTime);
        this.updateAngles();
        this.syncEquipment();
        this.player.standardBody.pos.set(this.torso.pos.x, this.torso.pos.y);
    }

    private updateOnSpawner(deltaTime: number): void {
        console.log("local: ", this.player.isLocal(), " on spawner")
        this.head.update(deltaTime);
        this.torso.update(deltaTime);

        this.updateTimers(deltaTime);
        this.solveConstraints(deltaTime);
        this.updateAngles();
        this.syncEquipment();
        this.player.standardBody.pos.set(this.torso.pos.x, this.torso.pos.y);
    }

    private isHeld(): boolean {
        return this.owned === Ownership.Held;
    }

    private isOnSpawner(): boolean {
        return this.owned === Ownership.InSpawner;
    }

    private keepDistance(deltaTime: number, a: DynamicObject, b: DynamicObject, targetDistance: number, allowStretch: boolean): void {
        const prevGroundedA = a.grounded;
        const prevGroundedB = b.grounded;

        const aCenter = a.getCenter();
        const bCenter = b.getCenter();

        const diffX = bCenter.x - aCenter.x;
        const diffY = bCenter.y - aCenter.y;

        const dist = Math.hypot(diffX, diffY);
        if (allowStretch && dist > targetDistance) {
            return;
        }
        const diff = (dist - targetDistance) / dist;
        const impulse = new Vector(diffX * diff, diffY * diff).divide(2 * deltaTime);

        const velocityA = a.velocity.clone();
        const velocityB = b.velocity.clone();

        a.velocity = impulse.clone();
        b.velocity = impulse.clone().multiply(-1);

        a.updatePositions(deltaTime);
        b.updatePositions(deltaTime);

        a.grounded = prevGroundedA;
        b.grounded = prevGroundedB;

        a.velocity = velocityA.add(impulse);
        b.velocity = velocityB.subtract(impulse);
    }

    private calculateAngle(segment: DynamicObject, reference: DynamicObject, offset: number): number {
        const ref = reference.getCenter();
        const seg = segment.getCenter();

        const angle = Math.atan2(ref.y - seg.y, ref.x - seg.x);
        return (angle + offset) * segment.getDirectionMultiplier();
    }

    private isGrounded(): boolean {
        return this.head.grounded || this.torso.grounded || this.legs.grounded;
    }

    private getDrawPos(part: DynamicObject): Vector {
        const x = part.pos.x + (this.width - PlayerCharacter.drawSize) / 2;
        const y = part.pos.y + (this.height - PlayerCharacter.drawSize) / 2;
        return new Vector(x, y);
    }

    public draw(): void {
        const flip = this.head.isFlip();
        this.player.animator.setAnimation(PlayerAnim.UpperRagdoll);
        this.player.animator.drawBody(this.getDrawPos(this.head), PlayerCharacter.drawSize, flip, this.headAngle);

        this.player.animator.setAnimation(PlayerAnim.LowerRagdoll);
        this.player.animator.drawBody(this.getDrawPos(this.legs), PlayerCharacter.drawSize, flip, this.legsAngle);

        this.player.animator.drawItems(this.player.equipment);
    }

    // For IItem
    
    private static holdOffset = new Vector(0, -3);
    private static handOffset = new Vector();

    public update(_deltaTime: number): void {

    }

    public getBody(): DynamicObject {
        return this.legs;
    }

    public getAngle(): number {
        return this.legsAngle;
    }

    public setAngle(_angle: number): void {

    }

    public enabled(): boolean {
        return this.currentState;
    }

    public getHandOffset(): Vector {
        return PlayerRagdoll.handOffset;
    }

    public getHoldOffset(): Vector {
        return PlayerRagdoll.holdOffset;
    }

    public setOwnership(value: Ownership): void {
        this.owned = value;
    }

    public getOwnership(): Ownership {
        return this.owned;
    }

    public onProjectileEffect(_effect: ProjectileEffect, _pos: Vector, _local: boolean): void {
        return;
    }

    public interactions(): ItemUseInteractions {
        return this.useInteractions;
    }

    public throw(throwType: ThrowType): void {
        const direcMult = this.head.getDirectionMultiplier();
        this.head.velocity.set(0, 0);
        this.legs.velocity.set(0, 0);

        switch (throwType) {
            case (ThrowType.Light): {
                this.torso.velocity.set(600 * direcMult, -210);
                break;
            }
            case (ThrowType.Hard): {
                this.torso.velocity.set(2000 * direcMult, -300);
                break;
            }
            case (ThrowType.HardDiagonal): {
                this.torso.velocity.set(2000 * direcMult, -1600);
                break;
            }
            case (ThrowType.Drop): {
                this.torso.velocity.set(0 * direcMult, 0);
                break;
            }
            case (ThrowType.Upwards): {
                this.torso.velocity.set(0 * direcMult, -1600);
                break;
            }
        }
    }

    public getId(): number {
        return 0;
    }

    public shouldBeDeleted(): boolean {
        return false;
    }

    public setToDelete(): void {

    }
}

export { PlayerRagdoll };