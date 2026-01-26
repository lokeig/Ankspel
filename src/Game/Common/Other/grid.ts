import { Vector } from "../Types/vector";

class Grid {
    public static size: number = 32;

    public static updateMapPositions<T>(objects: Map<string, Set<T>>, getPos: (e: T) => Vector) {
        const movedObjects: Map<string, Set<T>> = new Map();

        for (const [key, objectSet] of objects.entries()) {
            for (const object of objectSet) {

                const newKey = this.key(this.getGridPos(getPos(object)));

                if (key !== newKey) {
                    objectSet.delete(object);

                    if (!movedObjects.has(newKey)) {
                        movedObjects.set(newKey, new Set());
                    }
                    movedObjects.get(newKey)!.add(object);
                }
            }

            if (objectSet.size === 0) {
                objects.delete(key);
            }
        }

        for (const [newKey, objectSet] of movedObjects.entries()) {
            if (!objects.has(newKey)) {
                objects.set(newKey, new Set());
            }
            for (const projectile of objectSet) {
                objects.get(newKey)!.add(projectile);
            }
        }
    }

    public static forNearby(pos: Vector, nextPos: Vector, width: number, height: number, callback: (gridPos: Vector) => void): void {
        const padding = this.size;
        const startX = Math.min(pos.x, nextPos.x) - padding;
        const endX = Math.max(pos.x + width, nextPos.x + width) + padding;
        const startY = Math.min(pos.y, nextPos.y) - padding;
        const endY = Math.max(pos.y + height, nextPos.y + height) + padding;

        const minGrid = this.getGridPos(new Vector(startX, startY));
        const maxGrid = this.getGridPos(new Vector(endX, endY));

        for (let x = minGrid.x; x <= maxGrid.x; x++) {
            for (let y = minGrid.y; y <= maxGrid.y; y++) {
                callback(new Vector(x, y));
            }
        }
    }

    public static getGridPos(pos: Vector): Vector {
        return new Vector(Math.floor(pos.x / this.size), Math.floor(pos.y / this.size));
    }

    public static getWorldPos(gridPos: Vector): Vector {
        return new Vector(gridPos.x * this.size, gridPos.y * this.size);
    }

    public static key(pos: Vector): string {
        return `${pos.x},${pos.y}`;
    }

}

export { Grid };