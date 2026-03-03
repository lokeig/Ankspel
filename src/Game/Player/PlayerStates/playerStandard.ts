import { Vector } from "@math";
import { PlayerState, InputMode, IState, EquipmentSlot } from "@common";
import { PlayerCharacter } from "../Character/playerCharacter";
import { PlayerAnim } from "../../Common/Types/playerAnim";

class PlayerStandard implements IState<PlayerState> {

    private player: PlayerCharacter;
    constructor(player: PlayerCharacter) {
        this.player = player;
    }

    private setCurrentAnimation() {
        const animator = this.player.animator;
        if (!this.player.standardBody.grounded) {
            if (this.player.standardBody.velocity.y < 0) {
                animator.setAnimation(PlayerAnim.Jump);
            } else {
                animator.setAnimation(PlayerAnim.Fall);
            }
            return;
        }
        const left = this.player.controls.left(); const right = this.player.controls.right();
        if ((left && this.player.standardBody.velocity.x > 20) || right && this.player.standardBody.velocity.x < -20) {
            animator.setAnimation(PlayerAnim.Turn);
        } else if (Math.abs(this.player.standardBody.velocity.x) > 20) {
            animator.setAnimation(PlayerAnim.Walk);
        } else {
            animator.setAnimation(PlayerAnim.Idle);
        };
    }

    public stateEntered(): void {
        const armOffset = new Vector(10, 28);
        this.player.armFront.setOffset(armOffset);

        this.player.equipment.getAllEquippedItems().forEach((item) => {
            if (item && item.interactions().getOnPlayerState()) {
                item.interactions().getOnPlayerState()!(PlayerState.Standard);
            }
        });
    }

    public stateUpdate(deltaTime: number): void {
        if (!this.player.isLocal()) {
            this.nonLocalUpdate(deltaTime);
            return;
        }
        this.player.rotateArm(deltaTime);
        this.player.update(deltaTime);
        this.setCurrentAnimation();
        
        this.setEquipmentLocation();
    }

    private setEquipmentLocation() {
        const center = this.player.standardBody.getCenter();
        const positions: [EquipmentSlot, Vector][] = [
            [EquipmentSlot.Head, new Vector(0, -21)],
            [EquipmentSlot.Body, new Vector(2, 1)],
            [EquipmentSlot.Boots, new Vector(0, PlayerCharacter.standardHeight / 2)],
        ];
        positions.forEach(([slot, offset]) => {
            this.player.equipment.setBody(center, offset, this.player.standardBody.direction, 0, slot);
        });
    }

    private nonLocalUpdate(deltaTime: number): void {
        this.player.rotateArm(deltaTime);
        this.player.nonLocalUpdate(deltaTime);
        this.setEquipmentLocation();
    }

    public stateChange(): PlayerState {
        if (this.player.controls.ragdoll() || this.player.isDead()) {
            return PlayerState.Ragdoll;
        }
        if (this.player.controls.jump(InputMode.Press) && !this.player.standardBody.grounded && !this.player.jump.isJumping) {
            return PlayerState.Flap;
        }
        if (this.player.controls.down()) {
            if (Math.abs(this.player.standardBody.velocity.x) < 180 || !this.player.standardBody.grounded) {
                return PlayerState.Crouch;
            } else {
                return PlayerState.Slide
            }
        }
        return PlayerState.Standard;
    }

    public stateExited(): void {

    }

    public draw(): void {
        this.player.draw();
    }
}

export { PlayerStandard };