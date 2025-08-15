import { Vector } from "./Types/vector";

export class Grid {
    public static gridSize: number;

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

        for (const [newKey, projectileSet] of movedObjects.entries()) {
            if (!objects.has(newKey)) {
                objects.set(newKey, new Set());
            }
            for (const projectile of projectileSet) {
                objects.get(newKey)!.add(projectile);
            }
        }
    }

    public static getGridPos(pos: Vector): Vector {
        return { x: Math.floor(pos.x / this.gridSize), y: Math.floor(pos.y / this.gridSize) }
    }

    public static getWorldPos(gridPos: Vector): Vector {
        return { x: gridPos.x * this.gridSize, y: gridPos.y * this.gridSize } 
    }

    public static key(pos: Vector): string {
        return `${pos.x},${pos.y}`;
    }

}