import { IMapEditorMenu } from "./IMapEditorMenu";

class MapEditorMenu {
    private static current: IMapEditorMenu;

    public static set(lobbylistInterface: IMapEditorMenu): void {
        this.current = lobbylistInterface;
    }

    public static get(): IMapEditorMenu {
        return this.current;
    }
}

export { MapEditorMenu };