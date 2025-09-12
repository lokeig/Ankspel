import { PeerConnectionManager } from "./peerConnectionManager";
import { ServerInterface } from "../Common/serverInterface";
import { ServerMessage } from "../Common/MessageTypes/messageType";

export class MultiPeerServer implements ServerInterface {
    private peers: Map<string, PeerConnectionManager> = new Map();
    private receivedMessages: ServerMessage[] = [];
    private myID: string | null = null;

    constructor(private socket: WebSocket) {
        socket.onmessage = e => this.handleMessage(e);
        socket.onopen = () => {
            console.log("Connected to signaling server");

            this.socket.send(JSON.stringify({ type: "join" }));
            this.socket.send(JSON.stringify({ type: "host-lobby", lobbyID: "abc" }));
            this.socket.send(JSON.stringify({ type: "join-lobby", lobbyID: "abc" }));
            this.socket.send(JSON.stringify({ type: "list-users" }));

        };
    }

    public getReceivedMessages(): ServerMessage[] {
        return this.receivedMessages;
    }

    public update(): void {
        this.receivedMessages = [];
    }

    public getID() {
        return this.myID;
    }

    public getPeerIDs(): Array<string> {
        return Array.from(this.peers.keys());
    }

    private addPeer(peerId: string, isInitiator = false) {
        // Check if peer already exists
        if (this.peers.get(peerId)) {
            return;
        }

        const peer = new PeerConnectionManager(peerId, this.socket);

        peer.setOnMessage((msg, from) => {
            console.log("Received message from", from, msg);
            this.receivedMessages.push(msg);
        });

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
                    this.addPeer(data.id, true);
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
                for (const user of data.users.values())
                    if (!this.peers.has(user)) {
                        this.addPeer(user, true);
                    }
                break;

            case "offer":
                if (!this.peers.has(data.from)) {
                    this.addPeer(data.from, false);
                }
                this.peers.get(data.from)!.handleOffer(data.offer);
                break;

            case "answer":
                this.peers.get(data.from)?.handleAnswer(data.answer);
                break;

            case "candidate":
                this.peers.get(data.from)?.addIceCandidate(data.candidate);
                break;

            case "user-joined-lobby":
                console.log(`New user joined: ${data.id}`);
                break;

            case "joined-lobby":
                console.log(`joined lobby: ${data.id}`);
                break;

            case "lobby-not-found":
                console.log(`could not find lobby: ${data.id}`);
                break;

            case "lobby-already-found":
                console.log(`could not host lobby: ${data.id}, lobby already exists`);
                break;

            case "hosted-lobby":
                console.log(`Hosted lobby: ${data.id}`);
                break;

            case "new-host":
                console.log(`New host: ${data.hostID}`);
                break;
        }
    }

    public sendMessage(msg: ServerMessage) {
        msg.id = this.myID!; 
        this.peers.forEach(peer => peer.sendMessage(msg));
    }   
}
