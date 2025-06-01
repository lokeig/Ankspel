import { Cooldown } from "../../Common/cooldown";
import { SpriteSheet } from "../../Common/sprite";
import { Vector } from "../../Common/types";
import { Item } from "./item";

enum ShotgunState {
    loaded,
    empty,
    reloading
}

export class Shotgun extends Item {

    private bulletFireAmount: number = 7;
    private bulletAngleVariation: number = 30;
    private bulletSpeed: number = 5;
    private knockbackAmount: number = 0;
    private reloadTime = new Cooldown(0.2);

    private ammo: number = 2;

    private handleOffset: number = 0;
    private maxHandleOffset: number = 10;

    private handOffset: Vector = { x: 0, y: 0 };
    private holdOffset: Vector = { x: 0, y: 0 };
    private pipeOffset: Vector = { x: 0, y: 0 };

    private currentState: ShotgunState = ShotgunState.loaded; 

    constructor(pos: Vector, spriteSheet: SpriteSheet){
        super(pos, 54, 15, spriteSheet, 64)

        this.drawCol = 0;
        this.drawRow = 0;
    }

    public interact(): Vector {
        switch (this.currentState) {
            case (ShotgunState.loaded): {
                return this.shoot();
            }

            case (ShotgunState.empty): {
                return this.reload();
            }

            case (ShotgunState.reloading): {
                return { x: 0, y: 0 }
            }
        }
    };

    public itemUpdate(deltaTime: number): void {
        switch (this.currentState) {
            case (ShotgunState.loaded): {
                if (this.ammo < 1) {
                    this.delete = true;
                }
                break;
            }

            case (ShotgunState.empty): {
                break;
            }

            case (ShotgunState.reloading): {
                this.reloadTime.update(deltaTime);
                if (this.reloadTime.isReady()) {
                    this.currentState = ShotgunState.loaded;
                    this.handleOffset = 0;
                } else  {
                    const reloadPercentage = this.reloadTime.getPercentageReady();
                    this.setHandlePosition(reloadPercentage);
                }
                break;
            }
        }
    }

    private setHandlePosition(percentage: number) {
        if (percentage < 0.5) {
            this.handleOffset = -this.maxHandleOffset * (percentage * 2);
        } else {
            this.handleOffset = -this.maxHandleOffset + (this.maxHandleOffset * (percentage - 0.5) * 2)
        }
    }

    private shoot(): Vector {
        if (this.ammo < 1) {
            return { x: 0, y: 0 };
        }
        
        this.ammo -= 1;
        this.currentState = ShotgunState.empty;

        return { x: 15, y: 2 };
    }

    private reload(): Vector {
        this.reloadTime.reset();
        this.currentState = ShotgunState.reloading;
        return { x: 0, y: 0 };
    }

    public shouldBeDeleted(): boolean {
        return !this.owned && this.grounded && this.velocity.x < 1 && this.delete;
    }

    draw() {
        const flip = this.direction === "left";

        const drawPosX = this.pos.x + ((this.width - this.drawSize) / 2);
        const drawPosY = this.pos.y + ((this.height - this.drawSize) / 2);

        this.spriteSheet.draw(0, 0, { x: drawPosX, y: drawPosY }, this.drawSize, flip);

        // Handle
        const direcMult = flip ? 1 : -1
        this.spriteSheet.draw(1, 0, { x: drawPosX + (this.handleOffset * direcMult), y: drawPosY }, this.drawSize, flip);
    }
}