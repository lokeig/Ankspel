import { Countdown, Vector, PlayerState, InputMode, PlayerAnim, ThrowType } from "@common";
import { PlayerCharacter } from "../Character/playerCharacter";
import { IPlayerState } from "../IPlayerState";
import { GameObject } from "@core";

class PlayerSlide implements IPlayerState {

    private playerCharacter: PlayerCharacter;
    private platformIgnoreTime = new Countdown(0.15);
    private newHeight: number;
    private crouch: boolean;
    private unstuckSpeed: number = 7;

    constructor(playerCharacter: PlayerCharacter, crouch: boolean) {
        this.playerCharacter = playerCharacter;
        this.crouch = crouch;
        this.newHeight = 20;
    }

    public stateEntered(): void {
        this.platformIgnoreTime.setToReady();
        if (this.playerCharacter.movement) {
            this.playerCharacter.movement.moveEnabled = false;
            this.playerCharacter.itemManager.forcedThrowType = ThrowType.drop;
        }
        this.playerCharacter.body.height = this.newHeight;
        this.playerCharacter.body.pos.y += PlayerCharacter.standardHeight - this.playerCharacter.body.height;

        let armOffset = new Vector(16, 42);
        if (this.crouch) {
            armOffset = new Vector(10, 34);
        }
        this.playerCharacter.armFront.setOffset(armOffset);
    }

    public stateUpdate(deltaTime: number): void {
        const animation = this.crouch ? PlayerAnim.crouch : PlayerAnim.slide;
        this.playerCharacter.animator.setAnimation(animation);
        
        if (!this.playerCharacter.body.grounded) {
            this.playerCharacter.body.frictionMultiplier = 0.5;
        } else if (Math.abs(this.playerCharacter.body.velocity.x) > 1.8) {
            this.playerCharacter.body.frictionMultiplier = 1 / 5;
        } else {
            this.playerCharacter.body.frictionMultiplier = 1;
        }
        this.playerCharacter.jump.jumpEnabled = true;
        if (this.playerCharacter.controls.jump(InputMode.Press)) {
            this.platformIgnoreTime.reset();
            if (this.playerCharacter.body.onPlatform()) {
                this.playerCharacter.jump.jumpEnabled = false;
            }
            if (this.playerCharacter.body.grounded && this.playerCharacter.idleCollision()) {
                this.playerCharacter.body.velocity.x = this.unstuckSpeed * this.playerCharacter.body.getDirectionMultiplier();
                this.playerCharacter.jump.jumpEnabled = false;
            }
        }
        this.playerCharacter.body.ignorePlatforms = !this.platformIgnoreTime.isDone();
        this.platformIgnoreTime.update(deltaTime);

        this.playerCharacter.rotateArm(deltaTime);
        this.playerCharacter.update(deltaTime);
    }

    public offlineUpdate(deltaTime: number): void {
        this.playerCharacter.offlineUpdate(deltaTime);
    }

    public stateChange(): PlayerState {
        if (this.playerCharacter.controls.ragdoll() || this.playerCharacter.dead) {
            return PlayerState.Ragdoll;
        }
        if (this.playerCharacter.controls.down() || this.playerCharacter.idleCollision()) {
            if (this.crouch) {
                const maxCrouchSpeed = 3;
                const validCrouch = !this.playerCharacter.body.grounded
                    || Math.abs(this.playerCharacter.body.velocity.x) < maxCrouchSpeed
                    || this.playerCharacter.idleCollision();
                if (validCrouch) {
                    return PlayerState.Crouch;
                }
            }
            return PlayerState.Slide;
        }
        return PlayerState.Standard;
    }

    public getHeadCollision(body: GameObject): boolean {
        const playerBody = this.playerCharacter.body;
        return body.collision(new GameObject(playerBody.pos, playerBody.width / 3, playerBody.height));
    }

    public getBodyCollision(body: GameObject): boolean {
        const playerBody = this.playerCharacter.body;
        const posOffset = playerBody.pos.clone().add(new Vector(playerBody.width / 3, 0));
        return body.collision(new GameObject(posOffset, playerBody.width / 3, playerBody.height));
    }

    public getLegsCollision(body: GameObject): boolean {
        const playerBody = this.playerCharacter.body;
        const posOffset = playerBody.pos.clone().add(new Vector(2 * playerBody.width / 3, 0));
        return body.collision(new GameObject(posOffset, playerBody.width / 3, playerBody.height));
    }

    public stateExited(): void {
        this.playerCharacter.body.pos.y -= PlayerCharacter.standardHeight - this.playerCharacter.body.height;
        this.playerCharacter.body.height = PlayerCharacter.standardHeight;

        this.platformIgnoreTime.reset();
        this.playerCharacter.body.ignorePlatforms = false;
        if (this.playerCharacter.movement) {
            this.playerCharacter.movement.moveEnabled = true;
            this.playerCharacter.itemManager.forcedThrowType = null;
        }
        this.playerCharacter.body.frictionMultiplier = 1;
    }

    public draw(): void {
        this.playerCharacter.draw();
    }
}

export { PlayerSlide };