import { Countdown, Vector, Utility, PlayerState, InputMode, ThrowType } from "@common";
import { DynamicObject, GameObject } from "@core";
import { PlayerCharacter } from "../Character/playerCharacter";
import { IPlayerState } from "../IPlayerState";
import { IItem, ItemInteractions } from "@item";

class PlayerRagdoll implements IPlayerState, IItem {
    private playerCharacter: PlayerCharacter;
    private head: DynamicObject;
    private body: DynamicObject;
    private legs: DynamicObject;
    private headAngle = 0;
    private legsAngle = 0;

    private readonly height: number;
    private readonly width: number;

    private coyoteTime = new Countdown(0.15);

    private owned: boolean = false;
    public interactions: ItemInteractions = new ItemInteractions;

    constructor(playerCharacter: PlayerCharacter) {
        this.playerCharacter = playerCharacter;
        this.height = PlayerCharacter.standardHeight / 3;
        this.width = PlayerCharacter.standardWidth;

        this.head = new DynamicObject(new Vector(), this.width, this.height);
        this.legs = new DynamicObject(new Vector(), this.width, this.height);
        this.body = new DynamicObject(new Vector(), this.width, this.width);

        const bounceFactor = 0.5;
        this.head.bounceFactor = bounceFactor;
        this.body.bounceFactor = bounceFactor;
        this.legs.bounceFactor = bounceFactor;
        this.body.ignorePlatforms = true;
        const friction = 8;
        this.head.friction = friction;
        this.body.friction = friction;
        this.legs.friction = friction;
    }

    private handleInputs(deltaTime: number): void {
    }

    private setAngle(head: boolean): void {
        const bodyCenter = this.body.getCenter();
        const otherBodyCenter = head ? this.head.getCenter() : this.legs.getCenter();
        const DX = bodyCenter.x - otherBodyCenter.x;
        const DY = bodyCenter.y - otherBodyCenter.y;
        const angle = Math.atan2(DY, DX);
        if (head) {
            this.headAngle = (angle - (Math.PI / 2)) * this.head.getDirectionMultiplier();
        } else {
            this.legsAngle = (angle + (Math.PI / 2)) * this.legs.getDirectionMultiplier();
        }
    }

    public updateStandardBody(): void {
        const pos = new Vector(
            this.legs.pos.x,
            this.legs.pos.y + this.legs.height - PlayerCharacter.standardHeight
        );
        this.playerCharacter.body.grounded = true;
        this.playerCharacter.setPos(pos);
    }

    private isGrounded(): boolean {
        return this.head.grounded || this.legs.grounded || this.body.grounded;
    }

    private keepBodiesTogether(deltaTime: number, bodyPart1: DynamicObject, bodyPart2: DynamicObject, distanceBetweenBodies: number, allowLongerDistance: boolean): void {
        const prevGrounded1 = bodyPart1.grounded;
        const prevGrounded2 = bodyPart2.grounded;

        const body1Center = bodyPart1.getCenter();
        const body2Center = bodyPart2.getCenter();

        const DX = body2Center.x - body1Center.x;
        const DY = body2Center.y - body1Center.y;
        const distance = Math.hypot(DX, DY);
        if (allowLongerDistance && distance > distanceBetweenBodies) {
            return;
        }
        const diff = (distance - distanceBetweenBodies) / distance;
        const impulse = new Vector(DX * diff, DY * diff).divide(2 * deltaTime);
        const body1Vel = bodyPart1.velocity.clone();
        const body2Vel = bodyPart2.velocity.clone();
        bodyPart1.velocity = impulse.clone();
        bodyPart2.velocity = impulse.clone().multiply(-1);
        bodyPart1.updatePositions(deltaTime);
        bodyPart2.updatePositions(deltaTime);
        bodyPart1.grounded = prevGrounded1;
        bodyPart2.grounded = prevGrounded2;
        bodyPart1.velocity = body1Vel.add(impulse);
        bodyPart2.velocity = body2Vel.subtract(impulse);
    }

    public stateEntered(): void {
        this.playerCharacter.itemManager.throw(ThrowType.drop);
        this.coyoteTime.setToReady();
        this.head.direction = this.playerCharacter.body.direction;
        this.legs.direction = this.playerCharacter.body.direction;

        const pos = this.playerCharacter.body.pos;
        this.head.pos = pos.clone();
        this.body.pos = pos.clone().add(new Vector(0, this.height));
        this.legs.pos = pos.clone().add(new Vector(0, this.height * 2));

        const velocity = this.playerCharacter.body.velocity;
        this.head.velocity = velocity.clone();
        this.body.velocity = velocity.clone();
        this.legs.velocity = velocity.clone();

        if (this.playerCharacter.jump.isJumping) {
            const jumpLeft = this.playerCharacter.jump.getJumpRemaining();
            const jumpCharge = this.playerCharacter.jump.getJumpForce() / 5;
            this.body.velocity.y -= jumpLeft * jumpCharge;
            this.head.velocity.y -= jumpLeft * jumpCharge;
            this.legs.velocity.y -= jumpLeft * jumpCharge;
        }
        this.headAngle = 0;
        this.legsAngle = 0;
    }

    public stateUpdate(deltaTime: number): void {
        this.coyoteTime.update(deltaTime);
        if (this.isGrounded()) {
            this.coyoteTime.reset();
        }
        this.head.ignoreFriction = !this.head.grounded;
        this.body.ignoreFriction = !this.body.grounded;
        this.legs.ignoreFriction = !this.legs.grounded;

        this.head.update(deltaTime);
        this.body.update(deltaTime);
        this.legs.update(deltaTime);

        this.keepBodiesTogether(deltaTime, this.head, this.body, this.height - 1, false);
        this.keepBodiesTogether(deltaTime, this.legs, this.body, this.height - 1, false);
        this.keepBodiesTogether(deltaTime, this.head, this.legs, this.height * 1.5, true);

        if (this.head.pos.x === this.legs.pos.x && this.head.velocity.x === 0 && this.legs.velocity.x === 0) {
            this.head.velocity.x = Utility.Random.getRandomNumber(-3, 3);
        }
        if (!this.playerCharacter.dead) {
            this.handleInputs(deltaTime);
        }
        const head = true;
        this.setAngle(head);
        this.setAngle(!head);
    }

    public nonLocalUpdate(deltaTime: number): void {
    }

    public stateChange(): PlayerState {
        if (this.playerCharacter.dead) {
            return PlayerState.Ragdoll;
        }
        this.updateStandardBody();
        const exitKeyPressed = this.playerCharacter.controls.ragdoll() || this.playerCharacter.controls.jump(InputMode.Press);
        if (exitKeyPressed && !this.coyoteTime.isDone()) {
            return PlayerState.Standard;
        }
        return PlayerState.Ragdoll;
    }

    public stateExited(): void {
        this.updateStandardBody();
        const jumpHeight = 25;
        const exitVerticalSpeed = -250;
        this.playerCharacter.body.pos.y -= jumpHeight;
        this.playerCharacter.body.velocity = new Vector(this.body.velocity.x, exitVerticalSpeed);
    }

    public getHeadCollision(body: GameObject): boolean {
        return body.collision(this.head);
    }

    public getBodyCollision(body: GameObject): boolean {
        return body.collision(this.body);
    }

    public getLegsCollision(body: GameObject): boolean {
        return body.collision(this.legs);
    }

    private getDrawPos(bodyPart: DynamicObject): Vector {
        const x = bodyPart.pos.x + (this.width - PlayerCharacter.drawSize) / 2;
        const y = bodyPart.pos.y + (this.height - PlayerCharacter.drawSize) / 2;
        return new Vector(x, y);
    }

    public draw(): void {
        this.playerCharacter.animator.drawRagdoll(
            this.getDrawPos(this.head),
            this.getDrawPos(this.legs),
            PlayerCharacter.drawSize,
            this.headAngle,
            this.legsAngle,
            this.head.isFlip()
        );
    }

    // For IItem
    public update(deltaTime: number): void {
        this.stateUpdate(deltaTime);
    }

    public getBody(): DynamicObject {
        return this.head;
    }

    public getAngle(): number {
        return this.headAngle;
    }

    public getLocalAngle(): number {
        return this.headAngle;
    }

    public setWorldAngle(angle: number): void {
        this.headAngle = angle;
    }

    public setLocalAngle(angle: number): void {
        this.headAngle = angle;
    }

    public getHandOffset(): Vector {
        return new Vector();
    }

    public getHoldOffset(): Vector {
        return new Vector();
    }

    public setOwnership(value: boolean): void {
        this.owned = value;
    }

    public isOwned(): boolean {
        return this.owned;
    }

    public throw(throwType: ThrowType): void {
        throwType;
        this.owned = false;
    }

    public shouldBeDeleted(): boolean {
        return false;
    }

    public setToDelete(): void {
        return;
    }
}

export { PlayerRagdoll };