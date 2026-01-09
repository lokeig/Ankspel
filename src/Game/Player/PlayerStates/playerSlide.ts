import { Countdown, Vector, PlayerState, InputMode, PlayerAnim, ThrowType, IState, Side } from "@common";
import { PlayerCharacter } from "../Character/playerCharacter";
import { GameObject } from "@core";
import { EquipmentSlot } from "@item";
import { Render } from "@render";

class PlayerSlide implements IState<PlayerState> {

    private playerCharacter: PlayerCharacter;
    private platformIgnoreTime = new Countdown(0.15);
    private static readonly SlideHeight: number = 20;
    private crouch: boolean;
    private unstuckSpeed: number = 420;

    constructor(playerCharacter: PlayerCharacter, crouch: boolean) {
        this.playerCharacter = playerCharacter;
        this.crouch = crouch;
    }

    public stateEntered(): void {
        this.platformIgnoreTime.setToReady();
        if (this.playerCharacter.isLocal()) {
            this.playerCharacter.movement.moveEnabled = false;
            this.playerCharacter.itemManager.forcedThrowType = ThrowType.Drop;
        }
        this.playerCharacter.body.height = PlayerSlide.SlideHeight;
        this.playerCharacter.body.pos.y += PlayerCharacter.standardHeight - this.playerCharacter.body.height;

        let armOffset = new Vector(16, 42);
        if (this.crouch) {
            armOffset = new Vector(10, 34);
        }
        this.playerCharacter.armFront.setOffset(armOffset);
    }

    public stateUpdate(deltaTime: number): void {
        if (!this.playerCharacter.isLocal()) {
            this.nonLocalUpdate(deltaTime);
            return;
        }
        const animation = this.crouch ? PlayerAnim.Crouch : PlayerAnim.Slide;
        this.playerCharacter.animator.setAnimation(animation);

        this.setFriction();
        this.handlePlatforms(deltaTime);

        this.playerCharacter.rotateArm(deltaTime);
        this.playerCharacter.update(deltaTime);

        if (this.crouch) {
            this.setEquipmentPositionsCrouch();
        } else {
            this.setEquipmentPositionsSlide();
        }
        this.handleProjectiles();
    }

    private handleProjectiles(): void {
        const body = this.playerCharacter.body;
        const width = PlayerCharacter.standardWidth / 3;
        const height = PlayerSlide.SlideHeight;
        const pos = body.pos.clone();

        const head = new GameObject(
            pos,
            width,
            height
        );
        const bodySegment = new GameObject(
            pos.clone().add(new Vector(width, 0)),
            width,
            height
        );
        const legs = new GameObject(
            pos.clone().add(new Vector(width * 2, 0)),
            width,
            height
        );
        this.playerCharacter.handleProjectileCollisions(head, bodySegment, legs);
    }


    private setEquipmentPositionsSlide(): void {
        const center = this.playerCharacter.body.getCenter();
        const positions: [EquipmentSlot, Vector][] = [
            [EquipmentSlot.Head, new Vector(0, -PlayerSlide.SlideHeight)],
            [EquipmentSlot.Body, new Vector(0, 2)],
            [EquipmentSlot.Boots, new Vector(0, PlayerSlide.SlideHeight)],
        ];
        positions.forEach(([slot, offset]) => {
            this.playerCharacter.equipment.setBody(center, offset, this.playerCharacter.body.direction, -Math.PI / 2, slot);
        });
    }

    private setEquipmentPositionsCrouch(): void {
        const center = this.playerCharacter.body.getCenter();
        const positions: [EquipmentSlot, Vector][] = [
            [EquipmentSlot.Head, new Vector(0, -PlayerSlide.SlideHeight)],
            [EquipmentSlot.Body, new Vector(0, -4)],
            [EquipmentSlot.Boots, new Vector(0, PlayerSlide.SlideHeight)],
        ];
        positions.forEach(([slot, offset]) => {
            this.playerCharacter.equipment.setBody(center, offset, this.playerCharacter.body.direction, 0, slot);
        });
    }

    private setFriction(): void {
        if (!this.playerCharacter.body.grounded) {
            this.playerCharacter.body.frictionMultiplier = 0.5;
        } else if (Math.abs(this.playerCharacter.body.velocity.x) > 120) {
            this.playerCharacter.body.frictionMultiplier = 1 / 5;
        } else {
            this.playerCharacter.body.frictionMultiplier = 1;
        }
    }

    private handlePlatforms(deltaTime: number): void {
        this.playerCharacter.jump.jumpEnabled = true;
        if (this.playerCharacter.controls.jump(InputMode.Press)) {
            this.platformIgnoreTime.reset();
            if (this.playerCharacter.body.onPlatform()) {
                this.playerCharacter.jump.jumpEnabled = false;
            }
            if (this.playerCharacter.body.grounded && this.playerCharacter.idleCollision()) {
                this.playerCharacter.body.velocity.x = this.unstuckSpeed * this.playerCharacter.body.getDirectionMultiplier();
                this.playerCharacter.jump.jumpEnabled = false;
            }
        }
        this.playerCharacter.body.ignorePlatforms = !this.platformIgnoreTime.isDone();
        this.platformIgnoreTime.update(deltaTime);
    }

    public nonLocalUpdate(deltaTime: number): void {
        this.playerCharacter.nonLocalUpdate(deltaTime);
        this.handleProjectiles();
    }

    public stateChange(): PlayerState {
        if (this.playerCharacter.controls.ragdoll() || this.playerCharacter.dead) {
            return PlayerState.Ragdoll;
        }
        if (this.playerCharacter.controls.down() || this.playerCharacter.idleCollision()) {
            if (this.crouch) {
                const maxCrouchSpeed = 180;
                const validCrouch = !this.playerCharacter.body.grounded
                    || Math.abs(this.playerCharacter.body.velocity.x) < maxCrouchSpeed
                    || this.playerCharacter.idleCollision();
                if (validCrouch) {
                    return PlayerState.Crouch;
                }
            }
            return PlayerState.Slide;
        }
        return PlayerState.Standard;
    }

    public getHeadCollision(body: GameObject): boolean {
        const playerBody = this.playerCharacter.body;
        return body.collision(new GameObject(playerBody.pos, playerBody.width / 3, playerBody.height));
    }

    public getBodyCollision(body: GameObject): boolean {
        const playerBody = this.playerCharacter.body;
        const posOffset = playerBody.pos.clone().add(new Vector(playerBody.width / 3, 0));
        return body.collision(new GameObject(posOffset, playerBody.width / 3, playerBody.height));
    }

    public getLegsCollision(body: GameObject): boolean {
        const playerBody = this.playerCharacter.body;
        const posOffset = playerBody.pos.clone().add(new Vector(2 * playerBody.width / 3, 0));
        return body.collision(new GameObject(posOffset, playerBody.width / 3, playerBody.height));
    }

    public stateExited(): void {
        this.playerCharacter.body.pos.y -= PlayerCharacter.standardHeight - this.playerCharacter.body.height;
        this.playerCharacter.body.height = PlayerCharacter.standardHeight;

        this.platformIgnoreTime.reset();
        this.playerCharacter.body.ignorePlatforms = false;
        if (this.playerCharacter.isLocal()) {
            this.playerCharacter.movement.moveEnabled = true;
            this.playerCharacter.itemManager.forcedThrowType = null;
        }
        this.playerCharacter.body.frictionMultiplier = 1;
    }

    public draw(): void {
        const body = this.playerCharacter.body;
        const width = 14;
        const height = PlayerSlide.SlideHeight;
        const pos = body.pos.clone()
        
        let head = new GameObject(
            pos,
            width,
            height
        );
        const bodySegment = new GameObject(
            pos.clone().add(new Vector(width, 0)),
            width,
            height
        );
        let legs = new GameObject(
            pos.clone().add(new Vector(width * 2, 0)),
            width,
            height
        );
        if (this.playerCharacter.body.direction === Side.Left) {
            const temp = head;
            head = legs;
            legs = temp; 
        }
        Render.get().drawSquare({ x: head.pos.x, y: head.pos.y, width: head.width, height: head.height }, 0, "green");
        Render.get().drawSquare({ x: bodySegment.pos.x, y: bodySegment.pos.y, width: bodySegment.width, height: bodySegment.height }, 0, "blue");
        Render.get().drawSquare({ x: legs.pos.x, y: legs.pos.y, width: legs.width, height: legs.height }, 0, "red");
        
        this.playerCharacter.draw();
    }
}

export { PlayerSlide };