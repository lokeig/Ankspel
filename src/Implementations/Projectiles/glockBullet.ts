import { Vector } from "@common";
import { Bullet } from "./bullet";

class GlockBullet extends Bullet{
    constructor(pos: Vector, angle: number) {
        const speed = 2000;
        const lifespan = 0.25;
        super(pos, angle, speed, lifespan);
    }
}

export { GlockBullet };