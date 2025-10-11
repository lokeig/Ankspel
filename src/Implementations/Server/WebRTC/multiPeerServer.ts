import { Emitter, ServerInterface, ServerMessage } from "@server";
import { PeerConnectionManager } from "./peerConnectionManager";

class MultiPeerServer implements ServerInterface {
    private peers: Map<string, PeerConnectionManager> = new Map();
    private receivedMessages: ServerMessage[] = [];
    private myID: string | null = null;
    public emitter: Emitter = new Emitter();

    constructor(private socket: WebSocket) {
        socket.onmessage = e => this.handleMessage(e);
        socket.onopen = () => {
            console.log("Connected to signaling server");

            socket.send(JSON.stringify({ type: "join" }));
            socket.send(JSON.stringify({ type: "list-lobbies" }));
        };
    }

    public getReceivedMessages(): ServerMessage[] {
        return this.receivedMessages;
    }

    public sendToServer(message: any): void {
        this.socket.send(JSON.stringify(message));
    }

    public clearMessages(): void {
        this.receivedMessages = [];
    }

    public getID() {
        return this.myID;
    }

    private addPeer(peerId: string) {
        let isInitiator = false;
        if (this.peers.get(peerId)) return;

        const peer = new PeerConnectionManager(peerId, this.socket);

        peer.setOnMessage((msg, from) => {
            console.log("Received message from", from, msg);
            this.receivedMessages.push(msg);
        });

        if (this.myID && peerId < this.myID) {
            isInitiator = true;
        }

        if (isInitiator) {
            peer.createDataChannel();
            peer.createOffer();
        }

        this.peers.set(peerId, peer);
    }

    private handleMessage(event: MessageEvent) {
        const data = JSON.parse(event.data);

        switch (data.type) {
            case "welcome":
                console.log("Connected with ID:", data.id);
                this.myID = data.id;
                break;

            case "user-joined":
                if (!this.peers.has(data.id)) {
                    console.log(`New user joined: ${data.id}, connecting...`);
                    this.addPeer(data.id);
                }
                break;

            case "user-left":
                if (this.peers.has(data.id)) {
                    console.log(`user left: ${data.id}`);
                    this.peers.get(data.id)?.close();
                    this.peers.delete(data.id);
                }

                break;

            case "user-list":
                console.log("Here are all other users:", data.users);
                for (const user of data.users.values()) {
                    if (!this.peers.has(user)) {
                        this.addPeer(user);
                    }
                }
                break;

            case "lobby-list":
                console.log("Got a new lobby-list");
                this.emitter.emit("refresh-lobbies", data.lobbies);
                break;

            case "offer":
                if (!this.peers.has(data.from)) {
                    this.addPeer(data.from);
                }
                this.peers.get(data.from)!.handleOffer(data.offer);
                break;

            case "answer":
                this.peers.get(data.from)?.handleAnswer(data.answer);
                break;

            case "candidate":
                this.peers.get(data.from)?.addIceCandidate(data.candidate);
                break;

            case "joined-lobby":
                console.log(`joined lobby: ${data.id}`);
                this.socket.send(JSON.stringify({ type: "list-users" }));
                this.emitter.emit("joined-lobby", data.id);
                break;

            case "left-lobby":
                console.log(`left lobby`);
                this.emitter.emit("left-lobby", null);
                break;

            case "hosted-lobby":
                console.log(`Hosted lobby: ${data.id}`);
                this.emitter.emit("hosting-lobby", data.id);
                break;

            case "new-host":
                console.log(`New host: ${data.hostID}`);
                if (data.hostID === this.myID) {
                    this.emitter.emit("hosting-lobby", null);
                    console.log("You are host!");
                }
                break;

            case "lobby-starting":
                console.log("Starting lobby");
                this.emitter.emit("start-game", null);
        }
    }

    public sendMessage(msg: ServerMessage) {
        msg.id = this.myID!;
        this.peers.forEach(peer => peer.sendMessage(msg));
    }
}

export { MultiPeerServer };