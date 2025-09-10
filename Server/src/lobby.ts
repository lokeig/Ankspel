export class Lobby {
    private host: string;
    private connectedUsers: Set<string> = new Set();

    constructor(host: string) {
        this.host = host;
        this.connectedUsers.add(host);
    }

    public setHost(id: string): void {
        this.host = id;
    }

    public getHost(): string {
        return this.host;
    }

    public addUser(id: string) {
        if (this.connectedUsers.size === 0) {
            this.host = id
        }
        this.connectedUsers.add(id);
    }

    public getUsers(): Set<string> {
        return this.connectedUsers;
    }

    public setNewHost(): string | null {
        const newHost = [...this.connectedUsers][0];
        this.host = newHost;
        return newHost;
    }

    public removeUser(id: string) {
        this.connectedUsers.delete(id);
    }
}