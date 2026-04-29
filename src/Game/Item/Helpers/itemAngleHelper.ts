import { Lerp, lerpAngle, Utility } from "@common";

class ItemAngleHelper {
    public world: number = 0;
    public local: number = 0;
    public rotateSpeed: number = 0;
    public landPerfectly: boolean = false;

    private rotateLerp = new Lerp(15, lerpAngle);


    public updateAngle(deltaTime: number, grounded: boolean): void {
        const angle = this.world + this.local;
        const normalized = Utility.Angle.normalize(angle);
        if (grounded && normalized !== 0 && normalized !== -Math.PI) {
            this.rotateSpeed = 0;
            if (!this.rotateLerp.isActive()) {
                const target = !this.landPerfectly && Math.abs(normalized) > Math.PI / 2 ? Math.PI : 0;
                this.rotateLerp.startLerp(normalized, target);
            }
        }
        if (this.rotateLerp.isActive()) {
            this.world = this.rotateLerp.update(deltaTime);
        }

        this.world += this.rotateSpeed * deltaTime;
    }
}

export { ItemAngleHelper };