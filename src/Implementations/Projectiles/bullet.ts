import { Countdown, Vector } from "@common";
import { DynamicObject } from "@core";
import { Render } from "@render";
import { TileManager } from "@game/StaticObjects/Tiles";
import { StaticTrail } from "./Trails/staticTrail";
import { IProjectile } from "@projectile";

class Bullet implements IProjectile {
    private angle: number;
    public body: DynamicObject;
    private lifespan!: Countdown;
    public trail: StaticTrail;

    constructor(pos: Vector, velocity: Vector, lifespan: number) {
        const size = 2;
        this.body = new DynamicObject(pos, size, size);
        this.lifespan = new Countdown(lifespan);

        this.angle = Math.atan2(velocity.y, velocity.x);
        this.body.velocity = velocity.clone();

        const trailLength = 100;
        const trailPos = pos.clone().add(size / 2);
        this.trail = new StaticTrail(trailPos, velocity.clone(), trailLength, size);
        this.trail.setTarget(trailPos);
    }

    public getTrail(): StaticTrail {
        return this.trail;
    }

    public update(deltaTime: number): void {
        const prevPos: Vector = this.body.pos.clone();
        this.body.collidableObjects = TileManager.getNearbyTiles(this.body.pos, this.body.width, this.body.height);
        this.body.pos.x += this.body.velocity.x * deltaTime;
        this.body.pos.y += this.body.velocity.y * deltaTime;

        const dx = this.body.pos.x - prevPos.x;
        const dy = this.body.pos.y - prevPos.y;
        this.angle = Math.atan2(dy, dx);

        this.lifespan.update(deltaTime);
    }

    public shouldBeDeleted(): boolean {
        return this.body.getHorizontalTileCollision() !== undefined || this.lifespan.isDone();
    }

    public draw(): void {
        Render.get().drawSquare({ x: this.body.pos.x, y: this.body.pos.y, width: this.body.width, height: this.body.height }, this.angle, "red");
    }
}

export { Bullet };
