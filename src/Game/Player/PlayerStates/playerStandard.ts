import { StateInterface, Input, Vector, PlayerState } from "@common";
import { PlayerBody } from "../Body/playerBody";
import { ProjectileCollision } from "@game/Projectile";

class PlayerStandard implements StateInterface<PlayerState> {

    private playerBody: PlayerBody;
    private projectileCollision: ProjectileCollision;

    constructor(playerBody: PlayerBody) {
        this.playerBody = playerBody;
        this.projectileCollision = new ProjectileCollision(this.playerBody.dynamicObject);
        this.projectileCollision.setOnHit((hitpos: Vector) => {
            this.playerBody.dead = true;
        })
    }

    public stateEntered(): void {
        const armOffset = { x: 10, y: 28 };
        this.playerBody.setArmOffset(armOffset);
        this.playerBody.setArmPosition();
    }

    public stateUpdate(deltaTime: number): void {
        this.projectileCollision.check();
        this.setAnimation();
        this.playerBody.rotateArm(deltaTime);
        this.playerBody.update(deltaTime);
    }

    private setAnimation() {

        if (!this.playerBody.dynamicObject.grounded) {

            if (this.playerBody.dynamicObject.velocity.y < 0) {
                this.playerBody.setAnimation(this.playerBody.animations.jump);
            } else {
                this.playerBody.setAnimation(this.playerBody.animations.fall);
            }
            return;
        }

        const left = Input.keyDown(this.playerBody.controls.left);
        const right = Input.keyDown(this.playerBody.controls.right);

        if ((left && this.playerBody.dynamicObject.velocity.x > 0.3) || right && this.playerBody.dynamicObject.velocity.x < -0.3) {
            this.playerBody.setAnimation(this.playerBody.animations.turn);
        } else if (Math.abs(this.playerBody.dynamicObject.velocity.x) > 0.3) {
            this.playerBody.setAnimation(this.playerBody.animations.walk);
        } else {
            this.playerBody.setAnimation(this.playerBody.animations.idle);
        };
    }

    public stateChange(): PlayerState {
        if (Input.keyPress(this.playerBody.controls.ragdoll) || this.playerBody.dead) {
            return PlayerState.Ragdoll;
        }

        if (Input.keyPress(this.playerBody.controls.jump) && !this.playerBody.dynamicObject.grounded && !this.playerBody.playerJump.isJumping) {
            return PlayerState.Flap;
        }

        if (Input.keyDown(this.playerBody.controls.down)) {
            if (Math.abs(this.playerBody.dynamicObject.velocity.x) < 3 || !this.playerBody.dynamicObject.grounded) {
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
        this.playerBody.draw();
    }
}

export { PlayerStandard };