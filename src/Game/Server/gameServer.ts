import { ServerIF } from "./serverIF";

class GameServer {
    static serverIF: ServerIF;

    static set(serverInterface: ServerIF): void {
        this.serverIF = serverInterface;
    }

    static get(): ServerIF {
        return this.serverIF;
    }
}

export { GameServer }
