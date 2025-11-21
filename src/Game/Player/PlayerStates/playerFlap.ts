import { IState, Vector, PlayerState } from "@common";
import { PlayerCharacter } from "../Character/playerCharacter";
import { ProjectileCollision } from "@projectile";
import { PlayerAnim } from "../../Common/Types/playerAnimType";
import { IPlayerState } from "../IPlayerState";

class PlayerFlap implements IPlayerState {
    private playerCharacter: PlayerCharacter;
    private flapSpeed: number = 1.5;
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
        this.playerCharacter.body.velocity.y = Math.min(this.playerCharacter.body.velocity.y, this.flapSpeed);
        this.playerCharacter.animator.setAnimation(PlayerAnim.flap);

        const forceRotationUp = this.playerCharacter.equipment.isHolding();
        this.playerCharacter.rotateArm(deltaTime, forceRotationUp)
        this.playerCharacter.update(deltaTime);
    }

    public offlineUpdate(deltaTime: number): void {
        this.projectileCollision.check();
        this.playerCharacter.offlineUpdate(deltaTime);
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

    public draw(): void {
        this.playerCharacter.draw();
    }
}

export { PlayerFlap };