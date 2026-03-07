import { SpawnerDescription } from "@game/Map";
import { Spawner } from "./spawner";
import { Utility } from "@common";
import { IItem } from "@item";

class SpawnManager {
    private static spawners: Spawner[] = [];

    public static update(deltaTime: number): void {
        this.spawners.forEach(spawner => spawner.update(deltaTime));
    }

    public static draw(): void {
        this.spawners.forEach(spawner => spawner.draw());
    }

    public static addSpawner(config: SpawnerDescription): void {
        const seed = Utility.Random.seed();
        const newSpawner = new Spawner(config, seed);
        this.spawners.push(newSpawner);
    }

    public static reset(): void {
        this.spawners = [];
    }

    public static getSpawnerItems(): IItem[] {
        const result: IItem[] = [];
        this.spawners.forEach(spawner => {
            const contains = spawner.getContaining();
            if (contains) {
                result.push(contains);
            }
        })
        return result;
    }
}

export { SpawnManager };