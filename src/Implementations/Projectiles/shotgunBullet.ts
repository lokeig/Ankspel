import { SeededRNG, Vector } from "@common";
import { Bullet } from "./bullet";

class ShotgunBullet extends Bullet {
    constructor(pos: Vector, angle: number, seed?: number) {
        const speed = 2600;
        const rng = new SeededRNG(seed!);
        const distance = rng.getInRange(7, 9);
        super(pos, angle, speed, distance);
    }
}

export { ShotgunBullet };