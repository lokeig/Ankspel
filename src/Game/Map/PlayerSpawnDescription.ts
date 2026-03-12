import { Side } from "@common"
import { Vector } from "@math"

type PlayerSpawnDescription = {
    pos: Vector,
    direction: Side
}

export type { PlayerSpawnDescription };