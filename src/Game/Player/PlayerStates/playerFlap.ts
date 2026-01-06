import { PlayerState, Vector } from "@common";
import { PlayerCharacter } from "../Character/playerCharacter";
import { PlayerAnim } from "../../Common/Types/playerAnim";
import { IPlayerState } from "../IPlayerState";
import { GameObject } from "@core";

class PlayerFlap implements IPlayerState {
    private playerCharacter: PlayerCharacter;
    private flapSpeed: number = 90;

    constructor(playerCharacter: PlayerCharacter) {
        this.playerCharacter = playerCharacter;
    }

    private setCurrentAnimation(): void {
        this.playerCharacter.animator.setAnimation(PlayerAnim.Flap);
    }

    public stateEntered(): void {
        const armOffset = new Vector(10, 28);
        this.playerCharacter.armFront.setOffset(armOffset);
    }

    public stateUpdate(deltaTime: number): void {
        this.playerCharacter.body.velocity.y = Math.min(this.playerCharacter.body.velocity.y, this.flapSpeed);
        const forceRotationUp = this.playerCharacter.equipment.isHolding();
        this.playerCharacter.rotateArm(deltaTime, forceRotationUp)
        this.playerCharacter.update(deltaTime);
        this.setCurrentAnimation();
    }

    public stateChange(): PlayerState {
        const controls = this.playerCharacter.controls;
        if (controls.ragdoll() || this.playerCharacter.dead) {
            return PlayerState.Ragdoll;
        }
        if (controls.down()) {
            return PlayerState.Crouch;
        }
        if (controls.jump() && !this.playerCharacter.body.grounded) {
            return PlayerState.Flap
        }
        return PlayerState.Standard;
    }

    public stateExited(): void {
    }

    public nonLocalUpdate(deltaTime: number): void {
        this.playerCharacter.offlineUpdate(deltaTime);
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

export { PlayerFlap };