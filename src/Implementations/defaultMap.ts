import { IceTile } from "@impl/Tiles";
import { GameMap } from "@game/Map/map";

const defaultMap = new GameMap();

function fillArea(x: number, y: number, width: number, height: number) {
    for (let i = 0; i < width; i++) {
        for (let j = 0; j < height; j++) {
            defaultMap.setTile(IceTile, { x: x + i, y: y + j });
        }
    }
}

fillArea(5, 14, 25, 2);
fillArea(23, 5, 6, 8);
fillArea(3, 8, 2, 8);
fillArea(9, 11, 2, 4);
fillArea(9, 5, 2, 4);
fillArea(15, 7, 3, 3);

defaultMap.setPlayerSpawn({ x: 8, y: 14 });
defaultMap.setPlayerSpawn({ x: 15, y: 14 });
defaultMap.setPlayerSpawn({ x: 15, y: 4 });
defaultMap.setPlayerSpawn({ x: 16, y: 14 });

defaultMap.setTile(IceTile, { x: 15, y: 6 });

defaultMap.setItem("shotgun", { x: 10, y: 2 });
defaultMap.setItem("shotgun", { x: 20, y: 14 });
defaultMap.setItem("glock", { x: 21, y: 12 });
defaultMap.setItem("grenade", { x: 19, y: 12 });

export { defaultMap };