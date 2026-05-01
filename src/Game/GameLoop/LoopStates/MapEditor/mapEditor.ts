import { Controls, GameLoopState, Grid, Input, IState, SpriteSheet } from "@common";
import { ITile, TileManager } from "@game/Tiles";
import { IItem } from "@item";
import { Vector } from "@math";
import { MainMenu } from "@menu";
import { Images, Render, zIndex } from "@render";

class MapEditor implements IState<GameLoopState> {
    private cameraPos = new Vector();
    private cameraZoom: number = 1;
    private controls: Controls;
    private deleteMode: boolean = false;


    private tiles: Array<ITile> = [];
    private items: Array<IItem> = [];

    private selection: string = "natureTile";

    private static cursorSize = 32;
    private static cursorSprite = new SpriteSheet(Images.cursors);
    private static zoomSpeed = 0.05;
    private static moveSpeed = 700;
    private static minZoom = 0.5;
    private static maxZoom = 10;

    constructor() {
        this.controls = MainMenu.get().getControls(0);
    }

    public stateEntered(): void {

    }

    public stateUpdate(deltaTime: number): void {
        this.handleCamera(deltaTime);
        if (Input.mouseClick()) {
            if (TileManager.getTile(Grid.getGridPos(Input.getMousePos()))) {
                this.deleteMode = true;
            } else {
                this.deleteMode = false;
            }
        }
        if (Input.mouseDown()) {
            if (this.deleteMode) {
                TileManager.deleteTile(Grid.getGridPos(Input.getMousePos()));
            } else {
                TileManager.setTile(this.selection, Grid.getGridPos(Input.getMousePos()));
            }
        }
        Input.update();
    }


    public stateChange(): GameLoopState {
        return GameLoopState.Editor;
    }

    public stateExited(): void {

    }

    private handleCamera(deltaTime: number): void {
        const mousePos = Input.getMousePos();
        const scroll = Input.getScroll();
        const zoomInAmount = (deltaTime * scroll * MapEditor.zoomSpeed) * this.cameraZoom;
        if (zoomInAmount !== 0) {
            const oldZoom = this.cameraZoom;
            this.cameraZoom -= zoomInAmount;
            this.cameraZoom = Math.max(Math.min(this.cameraZoom, MapEditor.maxZoom), MapEditor.minZoom);

            const factor = (1 / oldZoom - 1 / this.cameraZoom);
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

    public draw(): void {
        const size = MapEditor.cursorSize / this.cameraZoom;
        this.drawGrid();
        TileManager.draw();
        MapEditor.cursorSprite.draw(Input.getMousePos(), size, false, 0, zIndex.UI);
        Render.get().render();
    }
}

export { MapEditor };