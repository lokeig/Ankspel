import { Emitter, ServerInterface } from "@server";
import { PeerConnectionManager } from "./peerConnectionManager";
import { ClientMessage, CMsgType, ForwardedMessage, SMsgType, ServerMessage } from "@shared";
import { WebRTCMessage, WebRTCSignalType } from "./types";

class MultiPeerServer implements ServerInterface {
    public emitter: Emitter = new Emitter();
    private peers: Map<string, PeerConnectionManager> = new Map();
    private receivedMessages: any[] = [];
    private myID: string | null = null;
    private socket: WebSocket;
    private host: boolean = false;

    constructor(socket: WebSocket) {
        this.socket = socket;

        this.socket.onmessage = (e: MessageEvent) => this.handleMessage(e);
        this.socket.onopen = () => {
            console.log("Connected to signaling server");
            const connectMsg: ClientMessage = { type: CMsgType.connect };
            const listLobbiesMsg: ClientMessage = { type: CMsgType.listLobbies };
            this.socket.send(JSON.stringify(connectMsg));
            this.socket.send(JSON.stringify(listLobbiesMsg));
        };
    }

    public isHost(): boolean {
        return this.host;
    }

    public sendToServer(message: ClientMessage): void {
        this.socket.send(JSON.stringify(message));
    }

    private cleanupAllPeers(): void {
        console.log("Cleaning up all peer connections");
        this.peers.forEach((peer: PeerConnectionManager, peerId: string) => {
            console.log(`Closing connection to peer: ${peerId}`);
            peer.close();
        });
        this.peers.clear();
    }

    private addPeer(peerId: string) {
        if (peerId === this.myID || this.peers.has(peerId)) {
            return;
        }

        console.log(`Creating new peer connection to: ${peerId}`);
        const peer = new PeerConnectionManager(peerId, this.socket);
        this.peers.set(peerId, peer);

        peer.setOnMessage((msg: any, from: string) => {
            console.log("Received message from", from, msg);
            this.receivedMessages.push(msg);
        });

        const isInitiator = peerId < this.myID!;

        if (isInitiator) {
            console.log(`Initiating connection to ${peerId}`);
            peer.createDataChannel();
            peer.createOffer();
        }
    }

    private handleForwardedMessage(data: ForwardedMessage<WebRTCMessage>): void {
        switch (data.msg.type) {
            case WebRTCSignalType.Offer:
                console.log(`Received offer from ${data.from}`);
                if (!this.peers.has(data.from)) {
                    this.addPeer(data.from);
                }
                this.peers.get(data.from)!.handleOffer(data.msg.offer);
                break;

            case WebRTCSignalType.Answer:
                console.log(`Received answer from ${data.from}`);
                this.peers.get(data.from)?.handleAnswer(data.msg.answer);
                break;

            case WebRTCSignalType.Candidate:
                this.peers.get(data.from)?.addIceCandidate(data.msg.candidate);
                break;
        }
    }

    private handleMessage(event: MessageEvent) {
        const data: ServerMessage = JSON.parse(event.data);

        switch (data.type) {
            case SMsgType.forwarded:
                this.handleForwardedMessage(data as ForwardedMessage<WebRTCMessage>);
                break;

            case SMsgType.connected:
                console.log("Connected with ID:", data.clientID);
                this.myID = data.clientID;
                break;

            case SMsgType.userJoined:
                console.log(`New user joined: ${data.userID}, connecting...`);
                this.addPeer(data.userID);
                break;

            case SMsgType.userLeft:
                console.log(`User left: ${data.userID}`);
                const peer = this.peers.get(data.userID);
                peer?.close();
                this.peers.delete(data.userID);

                break;

            case SMsgType.userList:
                console.log("Here are all other users:", data.users);
                for (const user of data.users.values()) {
                    this.addPeer(user);
                }
                break;

            case SMsgType.lobbyList:
                console.log("Got a new lobby-list");
                this.emitter.emit("refresh-lobbies", data.lobbies);
                break;

            case SMsgType.joinSuccess:
                console.log(`Joined lobby: ${data.lobbyID}`);
                this.emitter.emit("joined-lobby", data.lobbyID);

                const listUsersMsg: ClientMessage = { type: CMsgType.listUsers };
                this.socket.send(JSON.stringify(listUsersMsg));
                break;

            case SMsgType.leaveSuccess:
                console.log(`Left lobby`);
                this.cleanupAllPeers();
                this.emitter.emit("left-lobby", null);
                this.host = false;
                break;

            case SMsgType.hostSuccess:
                console.log(`Hosted lobby: ${data.lobbyID}`);
                this.host = true;
                this.emitter.emit("hosting-lobby", data.lobbyID);
                break;

            case SMsgType.newHost:
                console.log(`New host: ${data.hostID}`);
                if (data.hostID === this.myID) {
                    this.host = true;
                    this.emitter.emit("hosting-lobby", null);
                    console.log("You are host!");
                }
                break;

            case SMsgType.startGame:
                console.log("Starting lobby");
                this.emitter.emit("start-game", null);
        }
    }

    public sendMessage(msg: any) {
        msg.id = this.myID;
        this.peers.forEach((peer: PeerConnectionManager) => {
            peer.sendMessage(msg);
        });
    }
}

export { MultiPeerServer };