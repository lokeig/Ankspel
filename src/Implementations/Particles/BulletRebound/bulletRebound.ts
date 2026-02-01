import { AxisDirection, Vector } from "@common";
import { IParticle } from "@game/Particles";
import { TileMarker } from "./tileMarker";

class BulletReboundVFX implements IParticle {
    
    private marker: TileMarker;

    constructor(pos: Vector, angle: number, normal: AxisDirection) {
        this.marker = new TileMarker(pos, normal);
    }

    public update(deltaTime: number): void {
        this.marker.update(deltaTime);
    }

    public draw(): void {
        this.marker.draw();
    }

    public shouldBeDeleted(): boolean {
        return this.marker.shouldBeDeleted();
    }
}

export { BulletReboundVFX };