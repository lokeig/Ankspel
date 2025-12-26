import { PlayerState, InputMode, Vector } from "@common";
import { PlayerCharacter } from "../Character/playerCharacter";
import { PlayerAnim } from "../../Common/Types/playerAnim";
import { IPlayerState } from "../IPlayerState";
import { GameObject } from "@core";

class PlayerStandard implements IPlayerState {

    private playerCharacter: PlayerCharacter;
    constructor(playerCharacter: PlayerCharacter) {
        this.playerCharacter = playerCharacter;
    }

    private setCurrentAnimation() {
        const animator = this.playerCharacter.animator;
        if (!this.playerCharacter.body.grounded) {
            if (this.playerCharacter.body.velocity.y < 0) {
                animator.setAnimation(PlayerAnim.jump);
            } else {
                animator.setAnimation(PlayerAnim.fall);
            }
            return;
        }
        const left = this.playerCharacter.controls.left(); const right = this.playerCharacter.controls.right();
        if ((left && this.playerCharacter.body.velocity.x > 0.3) || right && this.playerCharacter.body.velocity.x < -0.3) {
            animator.setAnimation(PlayerAnim.turn);
        } else if (Math.abs(this.playerCharacter.body.velocity.x) > 0.3) {
            animator.setAnimation(PlayerAnim.walk);
        } else {
            animator.setAnimation(PlayerAnim.idle);
        };
    }

    public stateEntered(): void {
        const armOffset = new Vector(10, 28);
        this.playerCharacter.armFront.setOffset(armOffset);
    }

    public stateUpdate(deltaTime: number): void {
        this.playerCharacter.rotateArm(deltaTime);
        this.playerCharacter.update(deltaTime);
        this.setCurrentAnimation();
    }

    public nonLocalUpdate(deltaTime: number): void {
        this.playerCharacter.offlineUpdate(deltaTime);
    }

    public stateChange(): PlayerState {
        if (this.playerCharacter.controls.ragdoll() || this.playerCharacter.dead) {
            return PlayerState.Ragdoll;
        }

        if (this.playerCharacter.controls.jump(InputMode.Press) && !this.playerCharacter.body.grounded && !this.playerCharacter.jump.isJumping) {
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

    public getHeadCollision(body: GameObject): boolean {
        const playerBody = this.playerCharacter.body;
        return new GameObject(playerBody.pos, playerBody.width, playerBody.height / 3).collision(body);
    }

    public getBodyCollision(body: GameObject): boolean {
        const playerBody = this.playerCharacter.body;
        const posOffset = new Vector(playerBody.pos.x, playerBody.pos.y + playerBody.height / 3);
        return new GameObject(posOffset, playerBody.width, playerBody.height / 3).collision(body);
    }

    public getLegsCollision(body: GameObject): boolean {
        const playerBody = this.playerCharacter.body;
        const posOffset = new Vector(playerBody.pos.x, playerBody.pos.y + 2 * playerBody.height / 3);
        return new GameObject(posOffset, playerBody.width, playerBody.height / 3).collision(body);
    }

    public draw(): void {
        this.playerCharacter.draw();
    }
}

export { PlayerStandard };