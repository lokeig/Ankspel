import { PlayerState, InputMode, Vector, IState } from "@common";
import { PlayerCharacter } from "../Character/playerCharacter";
import { PlayerAnim } from "../../Common/Types/playerAnim";
import { GameObject } from "@core";
import { EquipmentSlot, Ownership } from "@item";

class PlayerStandard implements IState<PlayerState> {

    private playerCharacter: PlayerCharacter;
    constructor(playerCharacter: PlayerCharacter) {
        this.playerCharacter = playerCharacter;
    }

    private setCurrentAnimation() {
        const animator = this.playerCharacter.animator;
        if (!this.playerCharacter.body.grounded) {
            if (this.playerCharacter.body.velocity.y < 0) {
                animator.setAnimation(PlayerAnim.Jump);
            } else {
                animator.setAnimation(PlayerAnim.Fall);
            }
            return;
        }
        const left = this.playerCharacter.controls.left(); const right = this.playerCharacter.controls.right();
        if ((left && this.playerCharacter.body.velocity.x > 20) || right && this.playerCharacter.body.velocity.x < -20) {
            animator.setAnimation(PlayerAnim.Turn);
        } else if (Math.abs(this.playerCharacter.body.velocity.x) > 20) {
            animator.setAnimation(PlayerAnim.Walk);
        } else {
            animator.setAnimation(PlayerAnim.Idle);
        };
    }

    public stateEntered(): void {
        const armOffset = new Vector(10, 28);
        this.playerCharacter.armFront.setOffset(armOffset);
    }

    public stateUpdate(deltaTime: number): void {
        if (!this.playerCharacter.isLocal()) {
            this.nonLocalUpdate(deltaTime);
            return;
        }
        this.playerCharacter.rotateArm(deltaTime);
        this.playerCharacter.update(deltaTime);
        this.setCurrentAnimation();

        const center = this.playerCharacter.body.getCenter();
        const positions: [EquipmentSlot, Vector][] = [
            [EquipmentSlot.Head, new Vector(0, -21)],
            [EquipmentSlot.Body, new Vector(2, 1)],
            [EquipmentSlot.Boots, new Vector(0, PlayerCharacter.standardHeight / 2)],
        ];
        positions.forEach(([slot, offset]) => {
            this.playerCharacter.equipment.setBody(center, offset, this.playerCharacter.body.direction, 0, slot);
        });
        this.handleProjectiles();
    }

    public nonLocalUpdate(deltaTime: number): void {
        this.playerCharacter.nonLocalUpdate(deltaTime);
        this.handleProjectiles();
    }

    private handleProjectiles(): void {
        const body = this.playerCharacter.body;
        const width = PlayerCharacter.standardWidth;
        const height = PlayerCharacter.standardHeight / 3;
        const pos = body.pos.clone();

        const head = new GameObject(
            pos,
            width,
            height
        );
        const bodySegment = new GameObject(
            pos.clone().add(new Vector(0, height)),
            width,
            height
        );
        const legs = new GameObject(
            pos.clone().add(new Vector(0, height * 2)),
            width,
            height
        );
        this.playerCharacter.handleProjectileCollisions(head, bodySegment, legs);
    }

    public stateChange(): PlayerState {
        if (this.playerCharacter.controls.ragdoll() || this.playerCharacter.dead) {
            return PlayerState.Ragdoll;
        }
        if (this.playerCharacter.controls.jump(InputMode.Press) && !this.playerCharacter.body.grounded && !this.playerCharacter.jump.isJumping) {
            return PlayerState.Flap;
        }
        if (this.playerCharacter.controls.down()) {
            if (Math.abs(this.playerCharacter.body.velocity.x) < 180 || !this.playerCharacter.body.grounded) {
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