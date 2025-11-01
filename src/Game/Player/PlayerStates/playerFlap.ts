import { StateInterface, Input, Vector, PlayerState } from "@common";
import { PlayerCharacter } from "../Character/playerCharacter";
import { ProjectileCollision } from "@projectile";

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
        this.playerCharacter.setArmOffset(armOffset);
    }

    public stateUpdate(deltaTime: number): void {
        this.projectileCollision.check();
        this.playerCharacter.body.velocity.y = Math.min(this.playerCharacter.body.velocity.y, this.flapSpeed);
        this.playerCharacter.setAnimation(this.playerCharacter.animations.flap);

        if (this.playerCharacter.playerMove.willTurn(this.playerCharacter.controls)) {
            this.playerCharacter.armFront.angle *= -1;
        }
        if (this.playerCharacter.playerItem.holding) {
            this.playerCharacter.armFront.rotateArmUp(deltaTime);
        } else {
            this.playerCharacter.armFront.rotateArmDown(deltaTime);
        }
        this.playerCharacter.update(deltaTime);
    }

    public stateChange(): PlayerState {
        if (Input.keyPress(this.playerCharacter.controls.ragdoll) || this.playerCharacter.dead) {
            return PlayerState.Ragdoll;
        }

        if (Input.keyDown(this.playerCharacter.controls.down)) {
            return PlayerState.Crouch;
        }

        if (Input.keyDown(this.playerCharacter.controls.jump) && !this.playerCharacter.body.grounded) {
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