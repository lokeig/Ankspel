import { ServerInterface } from "./serverInterface";

class GameServer {
    static serverIF: ServerInterface;

    static set(serverInterface: ServerInterface): void {
        this.serverIF = serverInterface;
    }

    static get(): ServerInterface {
        return this.serverIF;
    }
}

export { GameServer }
