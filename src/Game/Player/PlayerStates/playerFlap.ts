import { StateInterface, Vector, PlayerState } from "@common";
import { PlayerCharacter } from "../Character/playerCharacter";
import { ProjectileCollision } from "@projectile";
import { PlayerAnimType } from "../Character/playerAnimType";

class PlayerFlap implements StateInterface<PlayerState> {

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
        this.playerCharacter.animator.setAnimation(PlayerAnimType.flap);

        const forceRotationUp = this.playerCharacter.playerItem.holding !== null;
        this.playerCharacter.rotateArm(deltaTime, forceRotationUp)
        this.playerCharacter.update(deltaTime);
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

    public stateDraw(): void {
        this.playerCharacter.draw();
    }
}

export { PlayerFlap };