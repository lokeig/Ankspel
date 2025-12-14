import { Vector } from "@common";
import { Bullet } from "./bullet";

class ShotgunBullet extends Bullet{
    constructor(pos: Vector, angle: number) {
        const speed = 1;
        const lifespan = 15;
        super(pos, angle, speed, lifespan);
    }
}

export { ShotgunBullet };