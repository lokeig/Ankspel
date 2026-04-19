import { Lerp, lerpAngle, Utility } from "@common";

class ItemAngleHelper {
    public worldAngle: number = 0;
    public localAngle: number = 0;
    public rotateSpeed: number = 0;

    private rotateLerp = new Lerp(15, lerpAngle);

    public landPerfectly: boolean = false;

    public updateAngle(deltaTime: number, grounded: boolean): void {
        const angle = this.worldAngle + this.localAngle;
        const normalized = Utility.Angle.normalize(angle);
        if (grounded && normalized !== 0 && normalized !== -Math.PI) {
            this.rotateSpeed = 0;
            if (!this.rotateLerp.isActive()) {
                const target = !this.landPerfectly && Math.abs(normalized) > Math.PI / 2 ? Math.PI : 0;
                this.rotateLerp.startLerp(normalized, target);
            }
        }
        if (this.rotateLerp.isActive()) {
            this.worldAngle = this.rotateLerp.update(deltaTime);
        }

        this.worldAngle += this.rotateSpeed * deltaTime;
    }
}

export { ItemAngleHelper };