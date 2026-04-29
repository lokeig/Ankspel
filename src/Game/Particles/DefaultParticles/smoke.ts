import { SpriteSheet, Utility } from "@common";
import { Images, zIndex } from "@render";
import { IParticle } from "../IParticle";
import { Vector } from "@math";
import { ParticleManager } from "../particleManager";

class Smoke implements IParticle {
    private static backSprite = new SpriteSheet(Images.smokeBack);
    private static frontSprite = new SpriteSheet(Images.smokeFront);
    private static drawDimensions = new Vector(44, 42);

    private pos: Vector;
    private scale: number;
    private drawScale: number;
    private angle: number = Utility.Random.getInRange(0, Math.PI);
    private flipped = Utility.Random.trueOrFalse();

    constructor(pos: Vector, scale: number) {
        this.pos = pos;
        this.scale = scale;
        this.drawScale = scale;
    }

    public update(deltaTime: number): void {
        const rotateSpeed = 0.1;
        const decaySpeed = 1;
        const stepsize = 10;
        const riseSpeed = 30;

        this.pos.y -= deltaTime * riseSpeed;
        this.angle += deltaTime * rotateSpeed;
        this.scale -= deltaTime * decaySpeed;
        this.drawScale = Math.round(this.scale * stepsize) / stepsize;
    }

    public draw(): void {
        const size = Smoke.drawDimensions.clone().multiply(this.drawScale);
        size.x = Math.round(size.x);
        size.y = Math.round(size.y);

        const drawPos = this.pos.clone().subtract(size.clone().divide(2));
        drawPos.x = Math.round(drawPos.x);
        drawPos.y = Math.round(drawPos.y);
        
        Smoke.frontSprite.draw(drawPos, size, this.flipped, this.angle, zIndex.Particles - 1);
        Smoke.backSprite.draw(drawPos, size, this.flipped, this.angle, zIndex.Particles - 2);
    }

    public shouldBeDeleted(): boolean {
        return this.scale < 0.2;
    }
}

function addSmokeCloud(pos: Vector, minScale: number, maxScale: number, variance: number, amount: number): void {
    for (let i = 0; i < amount; i++) {
        const offset = new Vector(Utility.Random.getInRange(-variance, variance), Utility.Random.getInRange(-variance, variance));
        pos.add(offset);
        ParticleManager.addParticle(new Smoke(pos.clone(), Utility.Random.getInRange(minScale, maxScale)));
    }
}

export { Smoke, addSmokeCloud };