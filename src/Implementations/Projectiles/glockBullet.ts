import { Vector } from "@common";
import { Bullet } from "./bullet";
import { Render } from "@render";

class GlockBullet extends Bullet {
    constructor(pos: Vector, angle: number) {
        const speed = 1000;
        const lifespan = 0.25;
        super(pos, angle, speed, lifespan);
    }

    public draw(): void {
        super.draw()
        this.body.getNearbyTiles().forEach(tile => {
            Render.get().drawSquare({
                x: tile.pos.x,
                y: tile.pos.y,
                width: tile.width,
                height: tile.height
            }, 0, "red");
        });
    }
}

export { GlockBullet };