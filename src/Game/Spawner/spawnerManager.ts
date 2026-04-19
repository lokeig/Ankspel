import { SpawnerDescription } from "@game/Map";
import { Spawner } from "./spawner";
import { IItem, Ownership } from "@item";
import { Connection, GameMessage } from "@server";
import { GameObject } from "@core";

class SpawnerManager {
    private static spawners: Spawner[] = [];
    private static id: number = 0;
    private static idToSpawner = new Map<number, Spawner>();

    public static update(deltaTime: number): void {
        this.spawners.forEach(spawner => spawner.update(deltaTime));
    }

    public static draw(): void {
        this.spawners.forEach(spawner => spawner.draw());
    }

    public static create(config: SpawnerDescription): void {
        const id = this.id++;
        const newSpawner = new Spawner(config, id);
        this.spawners.push(newSpawner);

        this.idToSpawner.set(id, newSpawner);

        Connection.get().sendGameMessage(GameMessage.AddSpawner, { config, id });
    }

    public static spawn(config: SpawnerDescription, id: number): void {
        const newSpawner = new Spawner(config, id);
        this.spawners.push(newSpawner);
        this.idToSpawner.set(id, newSpawner);
    }

    public static reset(): void {
        this.spawners = [];
    }

    public static getSpawnerFromId(id: number): Spawner | undefined {
        return this.idToSpawner.get(id);
    }

    public static getSpawnerItems(body: GameObject): IItem[] {
        const result: IItem[] = [];
        this.spawners.forEach(spawner => {
            const contains = spawner.getContaining();
            if (!contains) {
                return;
            }
            if (contains.body === body) {
                return;
            }
            if (contains.ownership === Ownership.InSpawner) {
                result.push(contains);
            }
        })
        return result;
    }
}

export { SpawnerManager };