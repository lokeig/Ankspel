import { Emitter, GameMessage, GMsgType, ServerInterface } from "@game/Server";
import { PeerConnectionManager } from "./peerConnectionManager";
import { ClientMessage, CMsgType, ForwardedMessage, SMsgType, ServerMessage } from "@shared";
import { WebRTCMessage, WebRTCSignalType } from "./types";
import { GameMessageMap } from "@game/Server/gameMessage";

class MultiPeerServer implements ServerInterface {
    public emitter: Emitter = new Emitter();
    private peers: Map<string, PeerConnectionManager> = new Map();
    private myID!: string;
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

    public getID(): string {
        return this.myID;
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

        peer.setOnMessage((type: GMsgType, msg: GameMessage) => {
            console.log("Received message " + type + ":", msg);
            this.emitter.publish(type, msg);
        });

        const isInitiator = peerId < this.myID!;

        if (isInitiator) {
            console.log(`Initiating connection to ${peerId}`);
            peer.createDataChannel();
            peer.createOffer();
        }

        this.emitter.publish(GMsgType.newPlayer, { local: false, id: peerId });
    }

    private removePeer(peerID: string) {
        const peer = this.peers.get(peerID);
        peer?.close();
        this.peers.delete(peerID);
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
                this.emitter.publish(GMsgType.newPlayer, { local: true, id: data.clientID });
                break;

            case SMsgType.userJoined:
                console.log(`New user joined: ${data.userID}, connecting...`);
                this.addPeer(data.userID);
                break;

            case SMsgType.userLeft:
                console.log(`User left: ${data.userID}`);
                this.removePeer(data.userID);
                break;

            case SMsgType.userList:
                console.log("Here are all other users:", data.users);
                for (const user of data.users.values()) {
                    this.addPeer(user);
                }
                break;

            case SMsgType.lobbyList:
                console.log("Got a new lobby-list");
                this.emitter.publish(GMsgType.refreshLobbies, { lobbies: data.lobbies });
                break;

            case SMsgType.joinSuccess:
                console.log(`Joined lobby: ${data.lobbyID}`);
                this.emitter.publish(GMsgType.inLobby, { lobbyID: data.lobbyID });
                const listUsersMsg: ClientMessage = { type: CMsgType.listUsers };
                this.socket.send(JSON.stringify(listUsersMsg));
                break;

            case SMsgType.leaveSuccess:
                console.log(`Left lobby`);
                this.cleanupAllPeers();
                this.emitter.publish(GMsgType.noLobby, {});
                this.host = false;
                break;

            case SMsgType.hostSuccess:
                console.log(`Hosted lobby: ${data.lobbyID}`);
                this.host = true;
                this.emitter.publish(GMsgType.hostingLobby, { lobbyID: data.lobbyID });
                break;

            case SMsgType.newHost:
                console.log(`New host: ${data.hostID}`);
                if (data.hostID === this.myID) {
                    this.host = true;
                    this.emitter.publish(GMsgType.hostingLobby, { lobbyID: null });
                    console.log("You are host!");
                }
                break;

            case SMsgType.startGame:
                const map = "defaultMap";
                this.sendMessage(GMsgType.loadMap, { name: map });
                this.emitter.publish(GMsgType.loadMap, { name: map });
                break;
        }
    }

    public sendMessage<T extends GMsgType>(type: T, msg: GameMessageMap[T]) {
        this.peers.forEach((peer: PeerConnectionManager) => {
            peer.sendMessage(type, msg);
        });
    }
}

export { MultiPeerServer };