import { Vector } from "@common";
import { Bullet } from "./bullet";

class ShotgunBullet extends Bullet{
    constructor(pos: Vector, angle: number) {
        const speed = 2000;
        const lifespan = 0.07;
        super(pos, angle, speed, lifespan);
    }
}

export { ShotgunBullet };