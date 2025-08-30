import { PeerConnectionManager } from "./peerConnectionManager";
import { ServerInterface } from "../Common/serverInterface";
import { ServerMessage } from "../Common/serverMessage";

export class MultiPeerServer implements ServerInterface {
    private peers: Record<string, PeerConnectionManager> = {};
    private receivedMessages: ServerMessage[] = [];
    private myID: string | null = null;

    constructor(private socket: WebSocket) {
        socket.onmessage = e => this.handleMessage(e);
        socket.onopen = () => {
            console.log("Connected to signaling server");

            // Notify the server that we're online
            this.socket.send(JSON.stringify({ type: "join" }));

            // Request a list of all currently online peers
            this.socket.send(JSON.stringify({ type: "list-peers" }));

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

    private addPeer(peerId: string, isInitiator = false) {
        // Check if peer already exists
        if (this.peers[peerId]) {
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

        this.peers[peerId] = peer;
    }

    private handleMessage(event: MessageEvent) {
        const data = JSON.parse(event.data);

        switch (data.type) {
            case "welcome":
                console.log("Connected with ID:", data.id);
                this.myID = data.id;
                break;

            case "peer-joined":
                if (!this.peers[data.id]) {
                    console.log(`New peer joined: ${data.id}, connecting...`);
                }
                break;

            case "peer-list":
                console.log("Here are all other users:", data.peers);
                for (const peer of data.peers.values())
                    if (!this.peers[peer]) {
                        this.addPeer(peer, true);
                    }
                break;

            case "offer":
                if (!this.peers[data.from]) {
                    this.addPeer(data.from, false);
                }
                this.peers[data.from].handleOffer(data.offer);
                break;

            case "answer":
                this.peers[data.from]?.handleAnswer(data.answer);
                break;

            case "candidate":
                this.peers[data.from]?.addIceCandidate(data.candidate);
                break;
        }
    }

    public sendMessage(msg: ServerMessage) {
        Object.values(this.peers).forEach(peer => peer.sendMessage(msg));
    }
}
