import { ServerInterface } from "./serverInterface";

export class GameServer {
    static server: ServerInterface;

    static set(serverInterface: ServerInterface): void {
        this.server = serverInterface;
    }

    static get(): ServerInterface {
        return this.server;
    }
}