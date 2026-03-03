import { IMainMenu } from "./IMainMenu";


class MainMenu {
    private static current: IMainMenu;

    public static set(lobbylistInterface: IMainMenu): void {
        this.current = lobbylistInterface;
    }

    public static get(): IMainMenu {
        return this.current;
    }
}

export { MainMenu };