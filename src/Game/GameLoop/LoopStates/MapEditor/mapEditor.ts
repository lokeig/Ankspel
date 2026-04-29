import { Controls, GameLoopState, Grid, Input, IState, SpriteSheet } from "@common";
import { TileManager } from "@game/Tiles";
import { Vector } from "@math";
import { MainMenu } from "@menu";
import { Images, Render, zIndex } from "@render";

class MapEditor implements IState<GameLoopState> {
    private cameraPos = new Vector();
    private cameraZoom: number = 1;
    private controls: Controls;
    private mousePos: Vector;

    private static cursorSize = 32;
    private static cursorSprite = new SpriteSheet(Images.cursors);
    private static zoomSpeed = 2;
    private static moveSpeed = 500;
    private static minZoom = 0.1;
    private static maxZoom = 10;

    constructor() {
        this.controls = MainMenu.get().getControls(0);
        this.mousePos = Input.getMousePos();
    }

    public stateEntered(): void {

    }

    public stateUpdate(deltaTime: number): void {
        this.handleCamera(deltaTime);

        if (Input.mouseDown()) {
            if (TileManager.getTile(Grid.getGridPos(this.mousePos))) {
                TileManager.deleteTile(Grid.getGridPos(this.mousePos));
            } else {
                TileManager.setTile("iceTile", Grid.getGridPos(this.mousePos));
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
        const backup = this.mousePos.clone();
        this.mousePos = Input.getMousePos();

        if (Input.keyDown("+")) {
            this.cameraZoom += deltaTime * this.cameraZoom * MapEditor.zoomSpeed;
            this.cameraZoom = Math.min(this.cameraZoom, MapEditor.maxZoom);
            this.mousePos = backup;
        }
        if (Input.keyDown("-")) {
            this.cameraZoom -= deltaTime * this.cameraZoom * MapEditor.zoomSpeed;
            this.cameraZoom = Math.max(this.cameraZoom, MapEditor.minZoom);
            this.mousePos = backup;
        }
        const moveSpeed = deltaTime * MapEditor.moveSpeed / this.cameraZoom;
        if (Input.keyDown(this.controls.left)) {
            this.cameraPos.x -= moveSpeed;
            this.mousePos = backup;
        }
        if (Input.keyDown(this.controls.right)) {
            this.cameraPos.x += moveSpeed;
            this.mousePos = backup;
        }
        if (Input.keyDown(this.controls.up)) {
            this.cameraPos.y -= moveSpeed;
            this.mousePos = backup;
        }
        if (Input.keyDown(this.controls.down)) {
            this.cameraPos.y += moveSpeed;
            this.mousePos = backup;
        }
        Render.get().setCamera(this.cameraPos, this.cameraZoom);
    }


    private drawGrid(): void {
        const render = Render.get();

        const lineSkip = Math.floor(1 / (this.cameraZoom * 2)) + 1;

        const lineSize = 4 * lineSkip;
        const gridSize = Grid.size * lineSkip;

        const screenWidth = render.getWidth();
        const screenHeight = render.getHeight();
        const zoom = render.getCameraZoom();

        const xGridCount = Math.floor((screenWidth / (zoom * gridSize)) + 3);
        const yGridCount = Math.floor((screenHeight / (zoom * gridSize)) + 3);

        const cameraPos = render.getCameraPos();
        const offsetX = cameraPos.x + (gridSize - (cameraPos.x % gridSize));
        const offsetY = cameraPos.y + (gridSize - (cameraPos.y % gridSize));

        const color = "#2d2d2d";

        for (let i = -1; i < xGridCount; i++) {
            const x = (i * gridSize) - offsetX;
            Render.get().drawSquare({
                x: x - lineSize / 2,
                y: -cameraPos.y,
                width: lineSize,
                height: screenHeight / this.cameraZoom,
            }, zIndex.Background, 0, color, 1);
        }
        for (let i = -1; i < yGridCount; i++) {
            const y = (i * gridSize) - offsetY;
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
        MapEditor.cursorSprite.draw(this.mousePos, size, false, 0, zIndex.UI);
        Render.get().render();
    }
}

export { MapEditor };