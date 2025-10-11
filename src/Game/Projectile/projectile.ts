import { SpriteSheet, Countdown, Vector } from "@common";
import { TileManager } from "@game/StaticObjects/Tiles";
import { DynamicObject } from "@core";
import { StaticTrail } from "./staticTrail";

class Projectile {
    private spriteSheet: SpriteSheet;
    private angle: number;
    public body: DynamicObject;
    private lifespan: Countdown;
    public trail!: StaticTrail;

    constructor(pos: Vector, velocity: Vector, lifespan: number, size: number, spriteSheet: SpriteSheet) {
        this.body = new DynamicObject(pos, size, size);
        const angle = Math.atan2(velocity.y, velocity.x);
        this.angle = angle;
        this.body.velocity = {
            x: velocity.x,
            y: velocity.y
        };
        this.spriteSheet = spriteSheet;
        this.lifespan = new Countdown(lifespan);
    } 

    public update(deltaTime: number) {
        const prevPos: Vector = { x: this.body.pos.x, y: this.body.pos.y };
        
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

    public draw() {

    }
}

export { Projectile };
