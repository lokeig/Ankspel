import { StateInterface, Vector, PlayerState, InputMode } from "@common";
import { PlayerCharacter } from "../Character/playerCharacter";
import { ProjectileCollision } from "@game/Projectile";
import { PlayerAnimType } from "../Character/playerAnimType";

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
        this.playerCharacter.armFront.setOffset(armOffset);
    }

    public stateUpdate(deltaTime: number): void {
        this.projectileCollision.check();
        this.playerCharacter.rotateArm(deltaTime);
        this.playerCharacter.update(deltaTime);
        this.setAnimation();
    }

    private setAnimation() {
        const animator = this.playerCharacter.animator;
        if (!this.playerCharacter.body.grounded) {

            if (this.playerCharacter.body.velocity.y < 0) {
                animator.setAnimation(PlayerAnimType.jump);
            } else {
                animator.setAnimation(PlayerAnimType.fall);
            }
            return;
        }
        const left = this.playerCharacter.controls.left();
        const right = this.playerCharacter.controls.right();

        if ((left && this.playerCharacter.body.velocity.x > 0.3) || right && this.playerCharacter.body.velocity.x < -0.3) {
            animator.setAnimation(PlayerAnimType.turn);
        } else if (Math.abs(this.playerCharacter.body.velocity.x) > 0.3) {
            animator.setAnimation(PlayerAnimType.walk);
        } else {
            animator.setAnimation(PlayerAnimType.idle);
        };
    }

    public stateChange(): PlayerState {
        if (this.playerCharacter.controls.ragdoll() || this.playerCharacter.dead) {
            return PlayerState.Ragdoll;
        }

        if (this.playerCharacter.controls.jump(InputMode.Press) && !this.playerCharacter.body.grounded && !this.playerCharacter.playerJump.isJumping) {
            return PlayerState.Flap;
        }

        if (this.playerCharacter.controls.down()) {
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