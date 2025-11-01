import { StateInterface, Input, Vector, PlayerState } from "@common";
import { PlayerCharacter } from "../Character/playerCharacter";
import { ProjectileCollision } from "@game/Projectile";

class PlayerStandard implements StateInterface<PlayerState> {

    private playerCharacter: PlayerCharacter;
    private projectileCollision: ProjectileCollision;

    constructor(playerCharacter: PlayerCharacter) {
        this.playerCharacter = playerCharacter;
        this.projectileCollision = new ProjectileCollision(this.playerCharacter.body);
        this.projectileCollision.setOnHit((hitpos: Vector) => {
            this.playerCharacter.dead = true;
        })
    }

    public stateEntered(): void {
        const armOffset = { x: 10, y: 28 };
        this.playerCharacter.setArmOffset(armOffset);
        this.playerCharacter.setArmPosition();
    }

    public stateUpdate(deltaTime: number): void {
        this.projectileCollision.check();
        this.setAnimation();
        this.playerCharacter.rotateArm(deltaTime);
        this.playerCharacter.update(deltaTime);
    }

    private setAnimation() {

        if (!this.playerCharacter.body.grounded) {

            if (this.playerCharacter.body.velocity.y < 0) {
                this.playerCharacter.setAnimation(this.playerCharacter.animations.jump);
            } else {
                this.playerCharacter.setAnimation(this.playerCharacter.animations.fall);
            }
            return;
        }

        const left = Input.keyDown(this.playerCharacter.controls.left);
        const right = Input.keyDown(this.playerCharacter.controls.right);

        if ((left && this.playerCharacter.body.velocity.x > 0.3) || right && this.playerCharacter.body.velocity.x < -0.3) {
            this.playerCharacter.setAnimation(this.playerCharacter.animations.turn);
        } else if (Math.abs(this.playerCharacter.body.velocity.x) > 0.3) {
            this.playerCharacter.setAnimation(this.playerCharacter.animations.walk);
        } else {
            this.playerCharacter.setAnimation(this.playerCharacter.animations.idle);
        };
    }

    public stateChange(): PlayerState {
        if (Input.keyPress(this.playerCharacter.controls.ragdoll) || this.playerCharacter.dead) {
            return PlayerState.Ragdoll;
        }

        if (Input.keyPress(this.playerCharacter.controls.jump) && !this.playerCharacter.body.grounded && !this.playerCharacter.playerJump.isJumping) {
            return PlayerState.Flap;
        }

        if (Input.keyDown(this.playerCharacter.controls.down)) {
            if (Math.abs(this.playerCharacter.body.velocity.x) < 3 || !this.playerCharacter.body.grounded) {
                return PlayerState.Crouch;
            } else {
                return PlayerState.Slide
            }
        }

        return PlayerState.Standard;
    }

    public stateExited(): void {

    }

    public stateDraw(): void {
        this.playerCharacter.draw();
    }
}

export { PlayerStandard };