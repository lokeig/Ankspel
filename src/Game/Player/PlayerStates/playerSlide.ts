import { StateInterface, Countdown, Input, Vector, PlayerState } from "@common";
import { PlayerBody } from "../Character/playerCharacter";
import { ThrowType } from "../Character/throwType";
import { ProjectileCollision } from "@game/Projectile";

class PlayerSlide implements StateInterface<PlayerState> {

    private playerBody: PlayerBody;
    private platformIgnoreTime = new Countdown(0.15);
    private newHeight: number;
    private crouch: boolean;
    private unstuckSpeed: number = 7;
    private projectileCollision: ProjectileCollision;

    constructor(playerBody: PlayerBody, crouch: boolean) {
        this.playerBody = playerBody;
        this.crouch = crouch;
        this.newHeight = 20;
        this.projectileCollision = new ProjectileCollision(playerBody.body);
        this.projectileCollision.setOnHit((hitpos: Vector) => {
            this.playerBody.dead = true;
        })
    }

    public stateEntered(): void {
        this.platformIgnoreTime.setToReady();
        this.playerBody.playerMove.moveEnabled = false;
        this.playerBody.body.height = this.newHeight;
        this.playerBody.body.pos.y += PlayerBody.standardHeight - this.playerBody.body.height;

        this.playerBody.playerItem.forcedThrowType = ThrowType.drop;

        let armOffset = { x: 16, y: 42 };

        if (this.crouch) {
            armOffset = { x: 10, y: 34 };
        }

        this.playerBody.setArmOffset(armOffset);
    }

    public stateUpdate(deltaTime: number): void {
        this.projectileCollision.check();

        const animation = this.crouch ? this.playerBody.animations.crouch : this.playerBody.animations.slide;
        this.playerBody.setAnimation(animation);

        if (!this.playerBody.body.grounded) {
            this.playerBody.body.frictionMultiplier = 0.5;
        } else if (Math.abs(this.playerBody.body.velocity.x) > 1.8) {
            this.playerBody.body.frictionMultiplier = 1 / 5;
        } else {
            this.playerBody.body.frictionMultiplier = 1;
        }

        this.playerBody.playerJump.jumpEnabled = true;
        if (Input.keyPress(this.playerBody.controls.jump)) {
            this.platformIgnoreTime.reset();

            if (this.playerBody.body.onPlatform()) {
                this.playerBody.playerJump.jumpEnabled = false;
            }

            if (this.playerBody.body.grounded && this.playerBody.idleCollision()) {
                this.playerBody.body.velocity.x = this.unstuckSpeed * this.playerBody.body.getDirectionMultiplier();
                this.playerBody.playerJump.jumpEnabled = false;
            }
        }

        this.playerBody.body.ignorePlatforms = !this.platformIgnoreTime.isDone();
        this.platformIgnoreTime.update(deltaTime);

        this.playerBody.rotateArm(deltaTime);
        this.playerBody.update(deltaTime);
    }

    public stateChange(): PlayerState {
        if (Input.keyPress(this.playerBody.controls.ragdoll) || this.playerBody.dead) {
            return PlayerState.Ragdoll;
        }
        if (Input.keyDown(this.playerBody.controls.down) || this.playerBody.idleCollision()) {
            const maxCrouchSpeed = 3;
            const validCrouch = !this.playerBody.body.grounded || Math.abs(this.playerBody.body.velocity.x) < maxCrouchSpeed || this.playerBody.idleCollision()
            if (this.crouch && validCrouch) {
                return PlayerState.Crouch;
            }
            return PlayerState.Slide;
        }

        return PlayerState.Standard;
    }

    public stateExited(): void {
        this.playerBody.body.pos.y -= PlayerBody.standardHeight - this.playerBody.body.height;
        this.playerBody.body.height = PlayerBody.standardHeight;

        this.platformIgnoreTime.reset();
        this.playerBody.body.ignorePlatforms = false;
        this.playerBody.playerJump.jumpEnabled = true;
        this.playerBody.playerMove.moveEnabled = true;

        this.playerBody.playerItem.forcedThrowType = null;
        this.playerBody.body.frictionMultiplier = 1;
    }

    public stateDraw(): void {
        this.playerBody.draw();
    }
}

export { PlayerSlide };