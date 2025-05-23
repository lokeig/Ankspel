import { GameObject } from "./gameobject";
import { Vector } from "./types";
import { Grid } from "./grid";


export abstract class DynamicObject extends GameObject {

    protected nearbyTiles = Grid.getNearbyTiles(this);
    public velocity: Vector = { x: 0, y: 0 };
    public grounded: boolean = false;
    public friction: number = 10;
    public gravity: number = 27;
    public ignoreGravity: boolean = false;
    public ignorePlatforms: boolean = false;

    public tileCollision(horizontalCheck: boolean): boolean {
        for (const tile of this.nearbyTiles.values()) {
            if (!this.collision(tile)) {
                continue;
            }

            if (!tile.platform) {
                return true;
            }
            
            const bottomPosY = Math.floor(this.pos.y + this.height - this.velocity.y);
            const belowPlatform = bottomPosY > tile.pos.y;
            if (horizontalCheck || belowPlatform || this.ignorePlatforms) {
                continue;
            }

            return true;
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