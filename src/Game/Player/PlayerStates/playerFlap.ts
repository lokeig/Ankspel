import { Vector } from "@math";
import { EquipmentSlot, IState, PlayerState } from "@common";
import { PlayerCharacter } from "../Character/playerCharacter";
import { PlayerAnim } from "../../Common/Types/playerAnim";

class PlayerFlap implements IState<PlayerState> {
    private player: PlayerCharacter;
    private flapSpeed: number = 90;

    constructor(playerCharacter: PlayerCharacter) {
        this.player = playerCharacter;
    }

    private setCurrentAnimation(): void {
        this.player.animator.setAnimation(PlayerAnim.Flap);
    }

    public stateEntered(): void {
        const armOffset = new Vector(10, 28);
        this.player.armFront.setOffset(armOffset);

        this.player.handleNewState(PlayerState.Flap);
    }

    public stateUpdate(deltaTime: number): void {
        if (!this.player.isLocal()) {
            this.nonLocalUpdate(deltaTime);
            return;
        }
        this.player.standardBody.velocity.y = Math.min(this.player.standardBody.velocity.y, this.flapSpeed);

        const forceRotationUp = this.player.equipment.hasItem(EquipmentSlot.Hand);
        this.player.rotateArm(deltaTime, forceRotationUp);

        this.player.standardBodyUpdate(deltaTime);
        this.setCurrentAnimation();
        this.setEquipmentPosition();
    }

    private setEquipmentPosition(): void {
        const center = this.player.standardBody.getCenter();
        const positions: [EquipmentSlot, Vector][] = [
            [EquipmentSlot.Head, new Vector(-2, -17)],
            [EquipmentSlot.Body, new Vector(0, 1)],
            [EquipmentSlot.Boots, new Vector(0, PlayerCharacter.standardHeight / 2)],
        ];
        positions.forEach(([slot, offset]) => {
            this.player.equipment.setBody(center, offset, this.player.standardBody.direction, 0, slot);
        });
    }

    public stateChange(): PlayerState {
        const controls = this.player.controls;
        if (controls.ragdoll() || this.player.isDead()) {
            return PlayerState.Ragdoll;
        }
        if (controls.down()) {
            return PlayerState.Crouch;
        }
        if (controls.jump() && !this.player.standardBody.grounded) {
            return PlayerState.Flap
        }
        return PlayerState.Standard;
    }

    public stateExited(): void {
    }

    private nonLocalUpdate(deltaTime: number): void {
        this.player.standardBody.velocity.y = Math.min(this.player.standardBody.velocity.y, this.flapSpeed);
        const forceRotationUp = this.player.equipment.hasItem(EquipmentSlot.Hand);
        this.player.rotateArm(deltaTime, forceRotationUp)
        this.player.standardBodyNonLocalUpdate(deltaTime);
        this.setEquipmentPosition();
    }

    public draw(): void {
        this.player.draw();
    }
}

export { PlayerFlap };