import { Vector } from "@math";
import { Countdown, PlayerState, InputMode, PlayerAnim, ThrowType, IState, EquipmentSlot } from "@common";
import { PlayerCharacter } from "../Character/playerCharacter";

class PlayerSlide implements IState<PlayerState> {

    private player: PlayerCharacter;
    private platformIgnoreTime = new Countdown(0.15);

    private static readonly slideHeight: number = 20;
    private static readonly crouchHeight: number = 30;

    private crouch: boolean;
    private unstuckSpeed: number = 300;

    constructor(playerCharacter: PlayerCharacter, crouch: boolean) {
        this.player = playerCharacter;
        this.crouch = crouch;
    }

    public stateEntered(): void {
        this.platformIgnoreTime.setToReady();
        if (this.player.isLocal()) {
            this.player.movement.moveEnabled = false;
            this.player.itemManager.forcedThrowType = ThrowType.Drop;
        }

        if (this.crouch) {
            this.player.standardBody.height = PlayerSlide.crouchHeight;
        } else {
            this.player.standardBody.height = PlayerSlide.slideHeight;
        }
        this.player.standardBody.pos.y += PlayerCharacter.standardHeight - this.player.standardBody.height;

        let armOffset = new Vector(16, 42);
        if (this.crouch) {
            armOffset = new Vector(10, 34);
        }
        this.player.armFront.setOffset(armOffset);

        this.player.equipment.getAllEquippedItems().forEach((item) => {
            if (item && item.interactions().getOnPlayerState()) {
                const state = this.crouch ? PlayerState.Crouch : PlayerState.Slide;
                item.interactions().getOnPlayerState()!(state);
            }
        });
    }

    public stateUpdate(deltaTime: number): void {
        if (!this.player.isLocal()) {
            this.nonLocalUpdate(deltaTime);
            return;
        }
        const animation = this.crouch ? PlayerAnim.Crouch : PlayerAnim.Slide;
        this.player.animator.setAnimation(animation);

        this.setFriction();
        this.handlePlatforms(deltaTime);

        this.player.rotateArm(deltaTime);
        this.player.update(deltaTime);

        if (this.crouch) {
            this.setEquipmentPositionsCrouch();
        } else {
            this.setEquipmentPositionsSlide();
        }
    }

    private nonLocalUpdate(deltaTime: number): void {
        this.player.rotateArm(deltaTime);
        this.player.nonLocalUpdate(deltaTime);
        if (this.crouch) {
            this.setEquipmentPositionsCrouch();
        } else {
            this.setEquipmentPositionsSlide();
        }
    }

    private setEquipmentPositionsSlide(): void {
        const center = this.player.standardBody.getCenter();
        const positions: [EquipmentSlot, Vector][] = [
            [EquipmentSlot.Head, new Vector(0, -PlayerSlide.slideHeight)],
            [EquipmentSlot.Body, new Vector(0, 2)],
            [EquipmentSlot.Boots, new Vector(0, PlayerSlide.slideHeight)],
        ];
        positions.forEach(([slot, offset]) => {
            this.player.equipment.setBody(center, offset, this.player.standardBody.direction, -Math.PI / 2, slot);
        });
    }

    private setEquipmentPositionsCrouch(): void {
        const center = this.player.standardBody.getCenter();
        const positions: [EquipmentSlot, Vector][] = [
            [EquipmentSlot.Head, new Vector(0, -PlayerSlide.slideHeight)],
            [EquipmentSlot.Body, new Vector(0, -4)],
            [EquipmentSlot.Boots, new Vector(0, PlayerSlide.slideHeight)],
        ];
        positions.forEach(([slot, offset]) => {
            this.player.equipment.setBody(center, offset, this.player.standardBody.direction, 0, slot);
        });
    }

    private setFriction(): void {
        if (!this.player.standardBody.grounded) {
            this.player.standardBody.frictionMultiplier = 0.5;
        } else if (Math.abs(this.player.standardBody.velocity.x) > 120) {
            this.player.standardBody.frictionMultiplier = 1 / 5;
        } else {
            this.player.standardBody.frictionMultiplier = 1;
        }
    }

    private handlePlatforms(deltaTime: number): void {
        this.player.jump.jumpEnabled = true;
        if (this.player.controls.jump(InputMode.Press)) {
            this.platformIgnoreTime.reset();
            if (this.player.standardBody.onPlatform()) {
                this.player.jump.jumpEnabled = false;
            }
            if (this.player.standardBody.grounded && this.player.idleCollision()) {
                this.player.standardBody.velocity.x = this.unstuckSpeed * this.player.standardBody.getDirectionMultiplier();
                this.player.jump.jumpEnabled = false;
            }
        }
        this.player.standardBody.ignorePlatforms = !this.platformIgnoreTime.isDone();
        this.platformIgnoreTime.update(deltaTime);
    }


    public stateChange(): PlayerState {
        if (this.player.controls.ragdoll() || this.player.isDead()) {
            return PlayerState.Ragdoll;
        }
        if (this.player.controls.down() || this.player.idleCollision()) {
            if (this.crouch) {
                const maxCrouchSpeed = 400;
                const validCrouch =
                    Math.abs(this.player.standardBody.velocity.x) < maxCrouchSpeed
                    || this.player.idleCollision();
                if (validCrouch) {
                    return PlayerState.Crouch;
                }
            }
            return PlayerState.Slide;
        }
        return PlayerState.Standard;
    }

    public stateExited(): void {
        this.player.standardBody.pos.y -= PlayerCharacter.standardHeight - this.player.standardBody.height;
        this.player.standardBody.height = PlayerCharacter.standardHeight;

        this.platformIgnoreTime.reset();
        this.player.standardBody.ignorePlatforms = false;
        if (this.player.isLocal()) {
            this.player.movement.moveEnabled = true;
            this.player.itemManager.forcedThrowType = null;
        }
        this.player.standardBody.frictionMultiplier = 1;
    }

    public draw(): void {
        this.player.draw();
    }
}

export { PlayerSlide };