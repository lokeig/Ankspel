import { Countdown, SpriteSheet, images, Vector, Utility, PlayerState } from "@common";
import { DynamicObject } from "@core";
import { PlayerCharacter } from "../Character/playerCharacter";
import { ThrowType } from "../Character/throwType";
import { ProjectileCollision } from "@projectile";
import { click } from "../Character/playerControls";
import { IPlayerState } from "../IPlayerState";

class PlayerRagdoll implements IPlayerState {
    private playerCharacter: PlayerCharacter;
    private head: DynamicObject;
    private body: DynamicObject;
    private legs: DynamicObject;

    private headAngle = 0;
    private legsAngle = 0;

    private readonly height: number;
    private readonly width: number;

    private coyoteTime = new Countdown(0.15);

    private spriteSheet: SpriteSheet;
    private headProjectileCollision: ProjectileCollision;
    private legsProjectileCollision: ProjectileCollision;

    constructor(playerCharacter: PlayerCharacter) {
        const spriteInfo = Utility.File.getImage(images.playerImage);
        this.spriteSheet = new SpriteSheet(spriteInfo.src, spriteInfo.frameWidth, spriteInfo.frameHeight);

        this.playerCharacter = playerCharacter;
        this.width = PlayerCharacter.standardWidth;
        this.height = PlayerCharacter.standardHeight / 3;

        this.head = new DynamicObject({ x: 0, y: 0 }, this.width, this.height);
        this.legs = new DynamicObject({ x: 0, y: 0 }, this.width, this.height);
        this.body = new DynamicObject({ x: 0, y: 0 }, this.width, this.width);

        const bounceFactor = 0.5;
        this.legs.bounceFactor = bounceFactor;
        this.head.bounceFactor = bounceFactor;
        this.body.bounceFactor = bounceFactor;
        this.body.ignorePlatforms = true;
        const friction = 8;
        this.body.friction = friction;
        this.head.friction = friction;
        this.legs.friction = friction;

        this.headProjectileCollision = new ProjectileCollision(this.head);
        this.legsProjectileCollision = new ProjectileCollision(this.legs);
        this.headProjectileCollision.setOnHit((hitpos: Vector) => {
            this.playerCharacter.dead = true;
        })
        this.legsProjectileCollision.setOnHit((hitpos: Vector) => {
            this.playerCharacter.dead = true;
        })
    }

    public stateEntered(): void {
        this.playerCharacter.itemManager.throw(ThrowType.drop);
        this.coyoteTime.setToReady();
        this.head.direction = this.playerCharacter.body.direction;
        this.legs.direction = this.playerCharacter.body.direction;

        const pos = this.playerCharacter.body.pos;
        this.head.pos = { x: pos.x, y: pos.y };
        this.body.pos = { x: pos.x, y: pos.y + this.height };
        this.legs.pos = { x: pos.x, y: pos.y + this.height * 2 };

        const vel = this.playerCharacter.body.velocity;
        this.head.velocity = { x: vel.x, y: vel.y };
        this.body.velocity = { x: vel.x, y: vel.y };
        this.legs.velocity = { x: vel.x, y: vel.y };

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
        this.headProjectileCollision.check();
        this.legsProjectileCollision.check();

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

        this.keepBodiesTogether(this.head, this.body, this.height - 1, false);
        this.keepBodiesTogether(this.legs, this.body, this.height - 1, false);
        this.keepBodiesTogether(this.head, this.legs, this.height * 1.5, true);

        if (this.head.pos.x === this.legs.pos.x && this.head.velocity.x === 0 && this.legs.velocity.x === 0) {
            this.head.velocity.x = Utility.Random.getRandomNumber(-0.1, 0.1);
        }

        if (!this.playerCharacter.dead) {
            this.handleInputs(deltaTime);
        }

        this.setHeadAngle();
        this.setLegsAngle();
    }

    public offlineUpdate(deltaTime: number): void {
        this.headProjectileCollision.check();
        this.legsProjectileCollision.check();
    }

    private isGrounded(): boolean {
        return this.head.grounded || this.legs.grounded || this.body.grounded;
    }

    private keepBodiesTogether(bodyPart1: DynamicObject, bodyPart2: DynamicObject, distanceBetweenBodies: number, allowLongerDistance: boolean): void {
        const body1Center = bodyPart1.getCenter();
        const body2Center = bodyPart2.getCenter();

        const DX = body2Center.x - body1Center.x;
        const DY = body2Center.y - body1Center.y;

        const distance = Math.hypot(DX, DY);
        if (allowLongerDistance && distance > distanceBetweenBodies) {
            return
        }
        const diff = (distance - distanceBetweenBodies) / distance;

        const impulseX = DX * diff * 0.5;
        const impulseY = DY * diff * 0.5;

        const prevBody1Vel = { x: bodyPart1.velocity.x, y: bodyPart1.velocity.y };
        const prevBody2Vel = { x: bodyPart2.velocity.x, y: bodyPart2.velocity.y };

        bodyPart1.velocity.x = impulseX;
        bodyPart1.velocity.y = impulseY;
        bodyPart2.velocity.x = -impulseX;
        bodyPart2.velocity.y = -impulseY;

        bodyPart1.updatePositions();
        bodyPart2.updatePositions();

        bodyPart1.velocity = {
            x: prevBody1Vel.x + impulseX,
            y: prevBody1Vel.y + impulseY
        };

        bodyPart2.velocity = {
            x: prevBody2Vel.x - impulseX,
            y: prevBody2Vel.y - impulseY
        };
    }

    private setHeadAngle(): void {
        const bodyCenter = this.body.getCenter();
        const headCenter = this.head.getCenter();
        const DX = bodyCenter.x - headCenter.x;
        const DY = bodyCenter.y - headCenter.y;
        const angle = Math.atan2(DY, DX);
        this.headAngle = (angle - Math.PI / 2) * this.legs.getDirectionMultiplier();

    }

    private setLegsAngle(): void {
        const bodyCenter = this.body.getCenter();
        const legsCenter = this.legs.getCenter();
        const DX = bodyCenter.x - legsCenter.x;
        const DY = bodyCenter.y - legsCenter.y;
        const angle = Math.atan2(DY, DX);
        this.legsAngle = (angle + Math.PI / 2) * this.legs.getDirectionMultiplier();
    }

    private handleInputs(deltaTime: number): void {
    }

    public stateChange(): PlayerState {
        if (this.playerCharacter.dead) {
            return PlayerState.Ragdoll;
        }
        this.updateStandard();
        const exitKeyPressed = this.playerCharacter.controls.ragdoll() || this.playerCharacter.controls.jump(click);
        if (exitKeyPressed && !this.coyoteTime.isDone()) {
            return PlayerState.Standard;
        }
        return PlayerState.Ragdoll;
    }

    public updateStandard(): void {
        const pos = {
            x: this.legs.pos.x,
            y: this.legs.pos.y + this.legs.height - PlayerCharacter.standardHeight
        };
        this.playerCharacter.body.grounded = true;
        this.playerCharacter.setPos(pos);
    }

    public stateExited(): void {
        this.updateStandard();
        const jumpHeight = 25;
        const exitVerticalSpeed = -5;
        this.playerCharacter.body.pos.y -= jumpHeight;
        this.playerCharacter.body.velocity = { x: this.body.velocity.x, y: exitVerticalSpeed };
    }

    private getDrawPos(bodyPart: DynamicObject): Vector {
        const x = bodyPart.pos.x + (this.width - this.playerCharacter.drawSize) / 2;
        const y = bodyPart.pos.y + (this.height - this.playerCharacter.drawSize) / 2;
        return { x, y };
    }

    public draw(): void {
        this.spriteSheet.draw(8, 0, this.getDrawPos(this.head), this.playerCharacter.drawSize, this.head.isFlip(), this.headAngle);
        this.spriteSheet.draw(9, 0, this.getDrawPos(this.legs), this.playerCharacter.drawSize, this.head.isFlip(), this.legsAngle);
    }
}

export { PlayerRagdoll };