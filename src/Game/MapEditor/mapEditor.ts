import { Controls, Frame, Grid, Input, SelectionType, Side, SpriteSheet } from "@common";
import { TileManager } from "@game/Tiles";
import { Vector } from "@math";
import { MapEditorMenu } from "@menu";
import { ImageInfo, Images, preloadAll, Render, zIndex } from "@render";
import { IItem, ItemManager } from "@item";
import { Spawner } from "@game/Spawner";
import { Player } from "@player";
import { FrameHandler } from "@game/GameLoop";
import { GameMap } from "@game/Map/gameMap";

class MapEditor {
    private cameraPos = new Vector();
    private cameraZoom: number = 1;
    private controls: Controls;

    private deleteMode: boolean = false;
    private flipMode: boolean = false;
    private lastTime: number = 0;
    private selection: SelectionType | null = null;
    private frameHandler: FrameHandler;

    private items: Map<string, IItem> = new Map();
    private parallax: [Vector, ImageInfo, Frame] | null = null;
    private playerSpawns: Map<string, Player> = new Map();
    private spawners: Map<string, Spawner> = new Map();

    private static zoomSpeed: number = 0.05;
    private static moveSpeed: number = 700;
    private static minZoom: number = 0.5;
    private static maxZoom: number = 10;
    private static parallaxSheet = new SpriteSheet(Images.backgroundIcons);

    constructor(controls: Controls, frameHandler: FrameHandler) {
        this.controls = controls;
        this.frameHandler = frameHandler;
        MapEditorMenu.get().show();
    }

    public update(deltaTime: number): void {
        this.selection = MapEditorMenu.get().getSelection();
        this.spawners.forEach(spawner => spawner.update(deltaTime));
        this.handleCamera(deltaTime);
        if (Input.mouseClick()) {
            this.setDeleteMode(Grid.getGridPos(Input.getMousePos()));
        }
        if (Input.mouseDown()) {
            this.placeSelection(Grid.getGridPos(Input.getMousePos()));
        }
        if (Input.keyPress("h")) {
            this.flipMode = !this.flipMode;
        }
        Input.update();
    }

    public exit(): void {
        MapEditorMenu.get().hide();
    }

    private setDeleteMode(pos: Vector): void {
        switch (this.selection) {
            case SelectionType.Tile: {
                this.deleteMode = !!TileManager.getTile(pos);
                break;
            }
            case SelectionType.Item: {
                this.deleteMode = this.items.has(Grid.key(pos));
                break;
            }
            case SelectionType.PlayerSpawn: {
                this.deleteMode = this.playerSpawns.has(Grid.key(pos));
                break;
            }
            case SelectionType.Spawner: {
                this.deleteMode = this.spawners.has(Grid.key(pos));
                break;
            }
        }
    }

    private placeSelection(pos: Vector): void {
        switch (this.selection) {
            case SelectionType.Tile: {
                if (this.deleteMode) {
                    TileManager.deleteTile(pos);
                } else {
                    TileManager.setTile(MapEditorMenu.get().getCurrentName(), pos);
                }
                break;
            }
            case SelectionType.Item: {
                if (this.deleteMode) {
                    this.items.delete(Grid.key(pos));
                    return;
                }
                const item = ItemManager.createNewRaw(MapEditorMenu.get().getCurrentName(), pos);
                if (!item) {
                    return;
                }
                this.items.set(Grid.key(pos), item);
                if (this.flipMode) {
                    item.body.direction = Side.Left;
                }
                break;
            }
            case SelectionType.PlayerSpawn: {
                if (this.deleteMode) {
                    this.playerSpawns.delete(Grid.key(pos));
                } else {
                    const player = new Player(-1, "#ffffff", "dummy");
                    const direction = this.flipMode ? Side.Left : Side.Right;
                    player.setSpawn({ pos, direction });
                    this.playerSpawns.set(Grid.key(pos), player);
                }
                break;
            }
            case SelectionType.Spawner: {
                if (this.deleteMode) {
                    this.spawners.delete(Grid.key(pos));
                } else {
                    const info = MapEditorMenu.get().getSpawner(pos);
                    const spawner = new Spawner(info, -1);
                    if (info.possibleItems.length > 0) {
                        const firstItem = info.possibleItems[0];
                        spawner.setContaining(ItemManager.createNewRaw(firstItem, new Vector())!);
                    }
                    this.spawners.set(Grid.key(pos), spawner);
                }
                break;
            }
            case SelectionType.Parallax: {
                const [image, frame] = MapEditorMenu.get().getParallaxIcon();
                this.parallax = [pos, image, frame];
                break;
            }
        }
    }

    private handleCamera(deltaTime: number): void {
        if (Input.keyPress(this.controls.jump)) {
            this.cameraPos.set(0, 0);
        }
        const mousePos = Input.getMousePos();
        const scroll = Input.getScroll();
        const zoomInAmount = (deltaTime * scroll * MapEditor.zoomSpeed) * this.cameraZoom;
        if (zoomInAmount !== 0) {
            const oldZoom = this.cameraZoom;
            this.cameraZoom -= zoomInAmount;
            this.cameraZoom = Math.max(Math.min(this.cameraZoom, MapEditor.maxZoom), MapEditor.minZoom);

            const factor = 1 / oldZoom - 1 / this.cameraZoom;
            this.cameraPos.x += (mousePos.x - this.cameraPos.x) * factor;
            this.cameraPos.y += (mousePos.y - this.cameraPos.y) * factor;
        }
        const moveSpeed = deltaTime * MapEditor.moveSpeed / this.cameraZoom;
        if (Input.keyDown(this.controls.left)) {
            this.cameraPos.x -= moveSpeed;
        }
        if (Input.keyDown(this.controls.right)) {
            this.cameraPos.x += moveSpeed;
        }
        if (Input.keyDown(this.controls.up)) {
            this.cameraPos.y -= moveSpeed;
        }
        if (Input.keyDown(this.controls.down)) {
            this.cameraPos.y += moveSpeed;
        }
        Render.get().setCamera(this.cameraPos, this.cameraZoom);
    }

    public getMap(): GameMap {
        const map = new GameMap();
        TileManager.getTiles().forEach(tile => map.setTile(tile, ))
        return map;
    }

    private drawGrid(): void {
        const render = Render.get();

        const gridScale = 1;

        const lineSize = 4 * gridScale;
        const size = Grid.size * gridScale;

        const screenWidth = render.getWidth();
        const screenHeight = render.getHeight();
        const zoom = render.getCameraZoom();

        const xGridCount = Math.floor((screenWidth / (zoom * size)) + 3);
        const yGridCount = Math.floor((screenHeight / (zoom * size)) + 3);

        const cameraPos = render.getCameraPos();
        const offsetX = cameraPos.x + (size - (cameraPos.x % size));
        const offsetY = cameraPos.y + (size - (cameraPos.y % size));

        const color = "#2d2d2d";

        for (let i = -1; i < xGridCount; i++) {
            const x = (i * size) - offsetX;
            Render.get().drawSquare({
                x: x - lineSize / 2,
                y: -cameraPos.y,
                width: lineSize,
                height: screenHeight / this.cameraZoom,
            }, zIndex.Background, 0, color, 1);
        }
        for (let i = -1; i < yGridCount; i++) {
            const y = (i * size) - offsetY;
            Render.get().drawSquare({
                x: -cameraPos.x,
                y: y - lineSize / 2,
                width: screenWidth / this.cameraZoom,
                height: lineSize,
            }, zIndex.Background, 0, color, 1);
        }
    }

    private drawParallax(): void {
        if (!this.parallax) {
            return;
        }
        const [pos, image, frame] = this.parallax;
        MapEditor.parallaxSheet.setImage(image);
        const drawSize = new Vector(image.frameWidth, image.frameHeight).multiply(2);
        MapEditor.parallaxSheet.draw(Grid.getWorldPos(pos), drawSize, false, 0, zIndex.Background, frame);
    }

    public draw(): void {
        Render.get().clear();
        this.drawGrid();
        this.drawParallax();
        TileManager.draw();
        this.spawners.forEach(spawner => spawner.draw());
        this.playerSpawns.forEach(spawn => spawn.draw());
        this.items.forEach(item => item.draw());
        Render.get().render();
    }

    private gameLoop = (currentTime: number) => {
        if (this.lastTime === 0) {
            this.lastTime = currentTime;
            this.frameHandler.newFrame(this.gameLoop);
            return;
        }
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        Render.get().clear();

        this.update(deltaTime);
        this.draw();

        this.frameHandler.newFrame(this.gameLoop);
    };

    public async init(): Promise<void> {
        await preloadAll();
        this.frameHandler.newFrame(this.gameLoop);
    }
}

export { MapEditor };