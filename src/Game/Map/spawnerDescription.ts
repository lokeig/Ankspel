import { Vector } from "@math";

type SpawnerDescription = {
    possibleItems: string[],
    startSpawned: boolean,
    timeBetweenSpawn: number,
    pos: Vector
};

export type { SpawnerDescription };