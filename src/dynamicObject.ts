import { GameObject } from "./gameobject";
import { Vector } from "./types";
import { Grid } from "./grid";


export abstract class DynamicObject extends GameObject {

    protected nearbyTiles = Grid.getNearbyTiles(this);
    public velocity: Vector = { x: 0, y: 0 };
    public grounded: boolean = false;
    public friction: number = 0.8;
    public gravity: number = 27;
    public ignoreGravity: boolean = false;
    public ignorePlatforms: boolean = false;

    public tileCollision(horizontalCheck: boolean): boolean {
        for (const tile of this.nearbyTiles.values()) {
            if (this.collision(tile)) {
                if (tile.platform) {
                    const belowPlatform = this.pos.y + this.height - (this.velocity.y) > tile.pos.y;
                    if (this.ignorePlatforms || belowPlatform || horizontalCheck) continue; 
                }
                return true;
            }
        }
        return false;
    }

    handleVerticalCollision() {
        this.grounded = false;
        if (this.tileCollision(false)) {
            if (this.velocity.y > 0) {
                this.pos = Grid.snap(this, "bot");
                this.grounded = true;
            } else {
                this.pos = Grid.snap(this, "top");
            }
            this.velocity.y = 0;
        } 
    }
    
    handleHorizontalCollision() {
        if (this.tileCollision(true)) {
            if (this.velocity.x > 0) {
                this.pos = Grid.snap(this, "right");
            } else {
                this.pos = Grid.snap(this, "left");
            }
            this.velocity.x = 0;
        }
    }

    updatePosition(deltaTime: number) {
        this.nearbyTiles = Grid.getNearbyTiles(this);

        if (!this.ignoreGravity) {
            this.velocity.y += this.gravity * deltaTime;
        }
        this.velocity.x *= 1 / (1 + (deltaTime * this.friction));

        this.pos.x += this.velocity.x
        this.handleHorizontalCollision();
        this.pos.y += this.velocity.y
        this.handleVerticalCollision();
    }
}