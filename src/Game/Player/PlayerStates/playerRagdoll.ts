import { StateInterface, Countdown, SpriteSheet, images, Input, Vector } from "@common";
import { DynamicObject } from "@core";
import { PlayerBody } from "../Body/playerBody";
import { ThrowType } from "../Body/throwType";
import { PlayerState } from "./playerState";

class PlayerRagdoll implements StateInterface<PlayerState> {

    private playerBody: PlayerBody;
    private head: DynamicObject;
    private body: DynamicObject;
    private legs: DynamicObject;

    private headAngle = 0;
    private legsAngle = 0;

    private readonly height: number;
    private readonly width: number;

    private coyoteTime = new Countdown(0.15);

    private spriteSheet = new SpriteSheet(images.playerImage, 32, 32);

    constructor(playerBody: PlayerBody) {
        this.playerBody = playerBody;

        this.width = playerBody.standardWidth;
        this.height = playerBody.standardHeight / 3;

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
    }


    public stateEntered(): void {
        this.playerBody.playerItem.throw(ThrowType.drop);
        this.coyoteTime.setToReady();
        this.head.direction = this.playerBody.dynamicObject.direction;
        this.legs.direction = this.playerBody.dynamicObject.direction;

        const pos = this.playerBody.dynamicObject.pos;
        this.head.pos = { x: pos.x, y: pos.y };
        this.body.pos = { x: pos.x, y: pos.y + this.height };
        this.legs.pos = { x: pos.x, y: pos.y + this.height * 2 };

        const vel = this.playerBody.dynamicObject.velocity;
        this.head.velocity = { x: vel.x - 0.05 * this.head.getDirectionMultiplier(), y: vel.y };
        this.body.velocity = { x: vel.x, y: vel.y };
        this.legs.velocity = { x: vel.x, y: vel.y };

        if (this.playerBody.playerJump.isJumping) {
            const jumpLeft = this.playerBody.playerJump.getJumpRemaining();
            const jumpCharge = this.playerBody.playerJump.getJumpForce() / 5;
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

        this.keepBodiesTogether(this.head, this.body, this.height, false);
        this.keepBodiesTogether(this.legs, this.body, this.height, false);
        this.keepBodiesTogether(this.head, this.legs, this.height * 1.5, true);


        this.handleInputs(deltaTime);

        this.setHeadAngle();
        this.setLegsAngle();
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
        bodyPart2.velocity.y = -impulseY + 0.001;

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

        const maxSpeed = 1;
        if (Input.keyPress(this.playerBody.controls.left)) {
            if (!(this.body.velocity.x > -maxSpeed)) {
                return
            }

            this.body.velocity.x -= 3;

            if (this.isGrounded()) {
                this.body.velocity.y -= 10;
            }
        }

        if (Input.keyPress(this.playerBody.controls.right)) {
            if (!(this.body.velocity.x < maxSpeed)) {
                return
            }

            this.body.velocity.x += 3;

            if (this.isGrounded()) {
                this.body.velocity.y -= 10;
            }

        }

        if (Input.keyPress(this.playerBody.controls.up)) {
            if (!this.isGrounded()) {
                return;
            }
            this.body.velocity.y -= 10;
            return;
        }
    }

    public stateChange(): PlayerState {
        const exitKeyPressed = Input.keyPress(this.playerBody.controls.ragdoll) || Input.keyPress(this.playerBody.controls.jump);
        if (exitKeyPressed && !this.coyoteTime.isDone()) {
            return PlayerState.Standard;
        }
        return PlayerState.Ragdoll;
    }

    public stateExited(): void {
        const jumpHeight = 25;
        this.playerBody.dynamicObject.pos = { x: this.legs.pos.x, y: this.legs.pos.y - this.legs.height - jumpHeight };
        this.playerBody.dynamicObject.velocity = { x: this.body.velocity.x, y: -5 };
        this.playerBody.dynamicObject.grounded = true;
        this.playerBody.setArmPosition();
    }

    private getDrawPos(bodyPart: DynamicObject): Vector {
        const x = bodyPart.pos.x + (this.width - this.playerBody.drawSize) / 2;
        const y = bodyPart.pos.y + (this.height - this.playerBody.drawSize) / 2;
        return { x, y };
    }

    public stateDraw(): void {
        const flip = this.head.direction === "left";

        this.spriteSheet.draw(8, 0, this.getDrawPos(this.head), this.playerBody.drawSize, flip, this.headAngle);
        this.spriteSheet.draw(9, 0, this.getDrawPos(this.legs), this.playerBody.drawSize, flip, this.legsAngle);

    }
}

export { PlayerRagdoll };