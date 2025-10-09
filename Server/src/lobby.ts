export class Lobby {
    private host: string;
    private name: string;
    private connectedUsers: Set<string> = new Set();
    private maxSize: number;
    private status: string;

    constructor(name: string, host: string) {
        this.host = host;
        this.name = name;
        this.connectedUsers.add(host);
        this.maxSize = 8;
        this.status = "Open";
    }
    
    public setHost(id: string): void {
        this.host = id;
    }

    public getHost(): string {
        return this.host;
    }

    public getName(): string {
        return this.name;
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

    public setMaxSize(maxSize: number) {
        this.maxSize = maxSize;
    }

    public getMaxSize(): number {
        return this.maxSize;
    }

    public setStatus(newStatus: string): void {
        this.status = newStatus;
    }

    public getStatus(): string {
        return this.status;
    }
}