import { StateInterface, Input, Vector } from "@common";
import { PlayerBody } from "../Body/playerBody";
import { PlayerState } from "./playerState";
import { ProjectileCollision } from "@projectile";

class PlayerFlap implements StateInterface<PlayerState> {

    private playerBody: PlayerBody;
    private flapSpeed: number = 1.5;
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
    }

    public stateUpdate(deltaTime: number): void {
        this.playerBody.dynamicObject.velocity.y = Math.min(this.playerBody.dynamicObject.velocity.y, this.flapSpeed);
        this.playerBody.setAnimation(this.playerBody.animations.flap);

        if (this.playerBody.playerMove.willTurn(this.playerBody.controls)) {
            this.playerBody.armFront.angle *= -1;
        }
        if (this.playerBody.playerItem.holding) {
            this.playerBody.armFront.rotateArmUp(deltaTime);
        } else {
            this.playerBody.armFront.rotateArmDown(deltaTime);
        }
        this.playerBody.update(deltaTime);
    }

    public stateChange(): PlayerState {

        if (Input.keyPress(this.playerBody.controls.ragdoll)) {
            return PlayerState.Ragdoll;
        }

        if (Input.keyDown(this.playerBody.controls.down)) {
            return PlayerState.Crouch;
        }

        if (Input.keyDown(this.playerBody.controls.jump) && !this.playerBody.dynamicObject.grounded) {
            return PlayerState.Flap
        }

        return PlayerState.Standard;
    }

    public stateExited(): void {

    }

    public stateDraw(): void {
        this.playerBody.draw();
    }
}

export { PlayerFlap };