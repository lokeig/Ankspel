import { Input } from "../../../Common/input";
import { Controls, Direction, Vector } from "../../../Common/types";
import { Item, ThrowType } from "../../Items/item";


export class PlayerItemHolder {
    holding: Item | null = null;

    public isHoldingItem(): boolean {
        if (this.holding) {
            return true;
        }
        return false;
    }

    public getThrowType(controls: Controls): ThrowType {
        const left = Input.keyDown(controls.left);
        const right = Input.keyDown(controls.right);
        const up = Input.keyDown(controls.up);

        if (Input.keyDown(controls.down)) {
            return ThrowType.drop;
        }

        if (left || right) {
            if (up) {
                return ThrowType.hardDiagonal;
            }
            return ThrowType.hard;
        }

        if (up) {
            return ThrowType.upwards;
        }

        return ThrowType.light;
    }

    public setHoldingPosition(pos: Vector, direction: Direction): void {
        if (!this.holding) {
            return
        }
        this.holding.pos.x = direction === "right" ? pos.x : pos.x - this.holding.width;
        this.holding.pos.y = pos.y;
        

        this.holding.direction = direction;
    }

    public throwItem(controls: Controls): void {
        if (!this.holding) {
            return
        }

        this.holding.throw(this.getThrowType(controls));
        this.holding = null;
    }
    
    public pickUp(item: Item) {
        if (this.holding) {
            return;
        }
        this.holding = item;
        item.owned = true;
    }
}