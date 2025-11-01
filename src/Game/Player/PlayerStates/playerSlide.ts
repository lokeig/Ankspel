import { StateInterface, Countdown, Input, Vector, PlayerState } from "@common";
import { PlayerCharacter } from "../Character/playerCharacter";
import { ThrowType } from "../Character/throwType";
import { ProjectileCollision } from "@game/Projectile";

class PlayerSlide implements StateInterface<PlayerState> {

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
        this.playerCharacter.playerMove.moveEnabled = false;
        this.playerCharacter.body.height = this.newHeight;
        this.playerCharacter.body.pos.y += PlayerCharacter.standardHeight - this.playerCharacter.body.height;

        this.playerCharacter.playerItem.forcedThrowType = ThrowType.drop;

        let armOffset = { x: 16, y: 42 };

        if (this.crouch) {
            armOffset = { x: 10, y: 34 };
        }

        this.playerCharacter.setArmOffset(armOffset);
    }

    public stateUpdate(deltaTime: number): void {
        this.projectileCollision.check();

        const animation = this.crouch ? this.playerCharacter.animations.crouch : this.playerCharacter.animations.slide;
        this.playerCharacter.setAnimation(animation);

        if (!this.playerCharacter.body.grounded) {
            this.playerCharacter.body.frictionMultiplier = 0.5;
        } else if (Math.abs(this.playerCharacter.body.velocity.x) > 1.8) {
            this.playerCharacter.body.frictionMultiplier = 1 / 5;
        } else {
            this.playerCharacter.body.frictionMultiplier = 1;
        }

        this.playerCharacter.playerJump.jumpEnabled = true;
        if (Input.keyPress(this.playerCharacter.controls.jump)) {
            this.platformIgnoreTime.reset();

            if (this.playerCharacter.body.onPlatform()) {
                this.playerCharacter.playerJump.jumpEnabled = false;
            }

            if (this.playerCharacter.body.grounded && this.playerCharacter.idleCollision()) {
                this.playerCharacter.body.velocity.x = this.unstuckSpeed * this.playerCharacter.body.getDirectionMultiplier();
                this.playerCharacter.playerJump.jumpEnabled = false;
            }
        }

        this.playerCharacter.body.ignorePlatforms = !this.platformIgnoreTime.isDone();
        this.platformIgnoreTime.update(deltaTime);

        this.playerCharacter.rotateArm(deltaTime);
        this.playerCharacter.update(deltaTime);
    }

    public stateChange(): PlayerState {
        if (Input.keyPress(this.playerCharacter.controls.ragdoll) || this.playerCharacter.dead) {
            return PlayerState.Ragdoll;
        }
        if (Input.keyDown(this.playerCharacter.controls.down) || this.playerCharacter.idleCollision()) {
            const maxCrouchSpeed = 3;
            const validCrouch = !this.playerCharacter.body.grounded || Math.abs(this.playerCharacter.body.velocity.x) < maxCrouchSpeed || this.playerCharacter.idleCollision()
            if (this.crouch && validCrouch) {
                return PlayerState.Crouch;
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
        this.playerCharacter.playerJump.jumpEnabled = true;
        this.playerCharacter.playerMove.moveEnabled = true;

        this.playerCharacter.playerItem.forcedThrowType = null;
        this.playerCharacter.body.frictionMultiplier = 1;
    }

    public stateDraw(): void {
        this.playerCharacter.draw();
    }
}

export { PlayerSlide };