import { Countdown, Vector, PlayerState, InputMode, PlayerAnim, ThrowType, IState, EquipmentSlot } from "@common";
import { PlayerCharacter } from "../Character/playerCharacter";

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
    }

    private nonLocalUpdate(deltaTime: number): void {
        this.playerCharacter.rotateArm(deltaTime);
        this.playerCharacter.nonLocalUpdate(deltaTime);
        if (this.crouch) {
            this.setEquipmentPositionsCrouch();
        } else {
            this.setEquipmentPositionsSlide();
        }
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


    public stateChange(): PlayerState {
        if (this.playerCharacter.controls.ragdoll() || this.playerCharacter.isDead()) {
            return PlayerState.Ragdoll;
        }
        if (this.playerCharacter.controls.down() || this.playerCharacter.idleCollision()) {
            if (this.crouch) {
                const maxCrouchSpeed = 400;
                const validCrouch =
                    Math.abs(this.playerCharacter.body.velocity.x) < maxCrouchSpeed
                    || this.playerCharacter.idleCollision();
                if (validCrouch) {
                    return PlayerState.Crouch;
                }
            }
            return PlayerState.Slide;
        }
        return PlayerState.Standard;
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
        this.playerCharacter.draw();
    }
}

export { PlayerSlide };