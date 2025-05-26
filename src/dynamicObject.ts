import { GameObject } from "./gameobject";
import { Direction, Vector } from "./types";
import { Grid } from "./grid";
import { StaticObject } from "./staticObject";
import { Item } from "./item";

export abstract class DynamicObject extends GameObject {

    protected nearbyTiles: Array<StaticObject> = [];
    protected nearbyItems: Array<Item> = [];

    public velocity: Vector = { x: 0, y: 0 };
    public grounded: boolean = false;
    public friction: number = 10;
    public gravity: number = 27;
    public ignoreGravity: boolean = false;
    public ignorePlatforms: boolean = false;
    public direction: Direction = "left";

    constructor(pos: Vector, width: number, height: number) {
        super(pos, width, height);
    }

    public tileCollision(): boolean {
        for (const tile of this.nearbyTiles.values()) {
            if (!this.collision(tile)) {
                continue;
            }

            if (!tile.platform) {
                return true;
            }
            
            const bottomPosY = Math.floor(this.pos.y + this.height - this.velocity.y);
            const belowPlatform = bottomPosY > tile.pos.y;
            if ( belowPlatform || this.ignorePlatforms) {
                continue;
            }

            return true;
        }
        return false;
    }

    handleVerticalCollision() {
        this.grounded = false;
        if (this.tileCollision()) {
            if (this.velocity.y > 0) {
                this.snapToGrid("bot");
                this.grounded = true;
            } else {
                this.snapToGrid("top");
            }
            this.velocity.y = 0;
        } 
    }
    
    handleHorizontalCollision() {
        if (this.tileCollision()) {
            if (this.velocity.x > 0) {
                this.snapToGrid("right");
            } else {
                this.snapToGrid("bot");
            }
            this.velocity.x = 0;
        }
    }

    physicsPositionUpdate(deltaTime: number) {
        this.setNearby();

        if (!this.ignoreGravity) {
            this.velocity.y += this.gravity * deltaTime;
        }
        this.velocity.x *= 1 / (1 + (deltaTime * this.friction));

        this.pos.y += this.velocity.y
        this.handleVerticalCollision();

        this.pos.x += this.velocity.x
        this.handleHorizontalCollision();
    }

    getGridPos(pos: Vector): Vector {
        return { x: Math.floor(pos.x / Grid.gridSize), y: Math.floor(pos.y / Grid.gridSize) }
    }

    setNearby(): void {        
        this.nearbyTiles = [];
        this.nearbyItems = [];

        const gridOffset = Grid.gridSize * 2;
        let posX = this.pos.x - gridOffset;
        let posY = this.pos.y - gridOffset;

        while (posX < this.pos.x + this.width + gridOffset) {
            posY = this.pos.y - gridOffset;

            while (posY < this.pos.y + this.height + gridOffset) {

                const gridPos = this.getGridPos({ x: posX, y: posY });
                this.addNearbyTile(gridPos);

                posY += Grid.gridSize;
            }
            posX += Grid.gridSize;
        }
    }

    addNearbyTile(gridPos: Vector) {
        const tile = Grid.tileManager.getTile(gridPos);
        if (!tile) {
            return;
        }
            
        this.nearbyTiles.push(tile)

        if (tile.lipLeft)  {
            this.nearbyTiles.push(tile.lipLeft);
        }
        if (tile.lipRight) {
            this.nearbyTiles.push(tile.lipRight);
        }
    }

    addNearbyItem(gridPos: Vector) {
        
    }

    snapToGrid(direction: Direction): void {

        const BR = { x: this.pos.x + this.width, y: this.pos.y + this.height }

        const TLGrid = this.getGridPos(this.pos);
        const BRGrid = this.getGridPos(BR);

        switch (direction) {
            case ("left"): {
                const snappedPos = Grid.tileManager.getWorldPos(Grid.tileManager.shift(TLGrid, "right"));
                this.pos = { x: snappedPos.x, y: this.pos.y };
                break;
            }
            case ("right"): {
                const snappedPos = Grid.tileManager.getWorldPos(Grid.tileManager.shift(BRGrid, "left"));
                this.pos = { x: snappedPos.x + (Grid.gridSize - this.width), y: this.pos.y };
                break;
            }
            case ("top"): {
                const snappedPos = Grid.tileManager.getWorldPos(Grid.tileManager.shift(TLGrid, "bot"));
                this.pos = { x: this.pos.x, y: snappedPos.y };
                break;
            }
            case ("bot"): {
                const snappedPos = Grid.tileManager.getWorldPos(Grid.tileManager.shift(BRGrid, "top"));
                this.pos = { x: this.pos.x, y: snappedPos.y + (Grid.gridSize - this.height) };
                break;
            }
        }        
    }
}