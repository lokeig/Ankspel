export class DataInfo {
    constructor(data, id, socket, users) {
        this.data = data;
        this.clientID = id;
        this.clientSocket = socket;
        this.connectedUsers = users;
    }
}