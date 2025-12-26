import { IServer } from "./IServer";

class Connection {
    private static clients: IServer;

    public static set(server: IServer) {
        this.clients = server;
    }

    public static get(): IServer {
        return this.clients;
    }
}

export { Connection }