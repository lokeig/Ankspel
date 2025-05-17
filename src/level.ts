import { Grid } from "./grid";
import { Prop } from "./prop";
import { SpriteSheet } from "./sprite";
import { tileType } from "./tile";
import { Vector } from "./types";

type tileValues = {
    pos: Vector,
    type: tileType,
}

export class Level {
    private playerSpawns: Array<Vector>;
    private tiles: Array<tileValues>;
    private props: Array<Prop>;

    constructor(playerSpawns: Array<Vector>, tiles: Array<tileValues>, props: Array<Prop>) {
        this.playerSpawns = playerSpawns;
        this.tiles = tiles;
        this.props = props;
    }

    initializeLevel(): void {
        Grid.tiles = new Map();
        for (const tile of this.tiles.values()) {
            const imgSrc = `/assets/tile${tileType[tile.type]}.png`;
            Grid.setTile(tile.pos, new SpriteSheet(imgSrc, 16), tile.type)
        }
    }
}

