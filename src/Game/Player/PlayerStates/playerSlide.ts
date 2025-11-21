import { IState, Countdown, Vector, PlayerState } from "@common";
import { PlayerCharacter } from "../Character/playerCharacter";
import { ThrowType } from "../Character/throwType";
import { ProjectileCollision } from "@game/Projectile";
import { click } from "../Character/playerControls";
import { PlayerAnim } from "../../Common/Types/playerAnimType";
import { IPlayerState } from "../IPlayerState";

class PlayerSlide implements IPlayerState {

    private playerCharacter: PlayerCharacter;
    private platformIgnoreTime = new Countdown(0.15);
    private newHeight: number;
    private crouch: boolean;
    private unstuckSpeed: number = 7;
    private projectileCollision: ProjectileCollision;

    constructor(playerCharacter: PlayerCharacter, crouch: boolean) {
        this.playerCharacter = playerCharacter;
        this.crouch = crouch;
        this.newHeight = 20;
        this.projectileCollision = new ProjectileCollision(playerCharacter.body);
        this.projectileCollision.setOnHit((hitpos: Vector) => {
            this.playerCharacter.dead = true;
        })
    }

    public stateEntered(): void {
        this.platformIgnoreTime.setToReady();
        this.playerCharacter.movement.moveEnabled = false;
        this.playerCharacter.body.height = this.newHeight;
        this.playerCharacter.body.pos.y += PlayerCharacter.standardHeight - this.playerCharacter.body.height;
        this.playerCharacter.itemManager.forcedThrowType = ThrowType.drop;

        let armOffset = { x: 16, y: 42 };
        if (this.crouch) {
            armOffset = { x: 10, y: 34 };
        }
        this.playerCharacter.armFront.setOffset(armOffset);
    }

    public stateUpdate(deltaTime: number): void {
        this.projectileCollision.check();

        const animation = this.crouch ? PlayerAnim.crouch : PlayerAnim.slide;
        this.playerCharacter.animator.setAnimation(animation);

        if (!this.playerCharacter.body.grounded) {
            this.playerCharacter.body.frictionMultiplier = 0.5;
        } else if (Math.abs(this.playerCharacter.body.velocity.x) > 1.8) {
            this.playerCharacter.body.frictionMultiplier = 1 / 5;
        } else {
            this.playerCharacter.body.frictionMultiplier = 1;
        }

        this.playerCharacter.jump.jumpEnabled = true;
        if (this.playerCharacter.controls.jump(click)) {
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

        this.playerCharacter.rotateArm(deltaTime);
        this.playerCharacter.update(deltaTime);
    }

    public offlineUpdate(deltaTime: number): void {
        this.projectileCollision.check();
        this.playerCharacter.offlineUpdate(deltaTime);
    }

    public stateChange(): PlayerState {
        if (this.playerCharacter.controls.ragdoll() || this.playerCharacter.dead) {
            return PlayerState.Ragdoll;
        }
        if (this.playerCharacter.controls.down() || this.playerCharacter.idleCollision()) {
            if (this.crouch) {
                const maxCrouchSpeed = 3;
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

    public stateExited(): void {
        this.playerCharacter.body.pos.y -= PlayerCharacter.standardHeight - this.playerCharacter.body.height;
        this.playerCharacter.body.height = PlayerCharacter.standardHeight;

        this.platformIgnoreTime.reset();
        this.playerCharacter.body.ignorePlatforms = false;
        this.playerCharacter.jump.jumpEnabled = true;
        this.playerCharacter.movement.moveEnabled = true;

        this.playerCharacter.itemManager.forcedThrowType = null;
        this.playerCharacter.body.frictionMultiplier = 1;
    }

    public draw(): void {
        this.playerCharacter.draw();
    }
}

export { PlayerSlide };