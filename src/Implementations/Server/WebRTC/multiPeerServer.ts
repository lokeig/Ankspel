import { Emitter, ServerInterface } from "@server";
import { PeerConnectionManager } from "./peerConnectionManager";
import { ClientMessage, CMsgType, ForwardedMessage, SMsgType, ServerMessage } from "@shared";
import { WebRTCMessage, WebRTCSignalType } from "./types";
import { Utility } from "@common";

class MultiPeerServer implements ServerInterface {
    private peers: Map<string, PeerConnectionManager> = new Map();
    private receivedMessages: any[] = [];
    private myID: string | null = null;
    public emitter: Emitter = new Emitter();
    private socket: WebSocket;
    private isInLobby: boolean = false;

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

    public getReceivedMessages(): ServerMessage[] {
        return this.receivedMessages;
    }

    public sendToServer(message: ClientMessage): void {
        this.socket.send(JSON.stringify(message));
    }

    public clearMessages(): void {
        this.receivedMessages = [];
    }

    public getID(): string | null {
        return this.myID;
    }

    private cleanupAllPeers(): void {
        console.log("Cleaning up all peer connections");
        this.peers.forEach((peer, peerId) => {
            console.log(`Closing connection to peer: ${peerId}`);
            peer.close();
        });
        this.peers.clear();
    }

    private addPeer(peerId: string) {
        if (peerId === this.myID) {
            return;
        }

        if (this.peers.has(peerId)) {
            const existingPeer = this.peers.get(peerId)!;
            if (existingPeer.isConnected() || existingPeer.isConnecting()) {
                console.log(`Peer ${peerId} is already connecting`);
                return;
            } else {
                console.log(`new connection to ${peerId}`);
                existingPeer.close();
                this.peers.delete(peerId);
            }
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
            setTimeout(() => {
                if (this.peers.has(peerId)) {
                    peer.createDataChannel();
                    peer.createOffer();
                }
            }, Utility.Random.getRandomNumber(100, 500));
        }
    }

    private handleForwardedMessage(data: ForwardedMessage<WebRTCMessage>): void {
        if (!this.isInLobby) {
            console.log("Ignoring webrtc not in lobby");
            return;
        }

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
                if (peer) {
                    peer.close();
                    this.peers.delete(data.userID);
                }
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
                this.isInLobby = true;
                this.emitter.emit("joined-lobby", data.lobbyID);
                setTimeout(() => {
                    const listUsersMsg: ClientMessage = { type: CMsgType.listUsers };
                    this.socket.send(JSON.stringify(listUsersMsg));
                }, 200);
                break;

            case SMsgType.leaveSuccess:
                console.log(`Left lobby`);
                this.isInLobby = false;
                this.cleanupAllPeers();
                this.emitter.emit("left-lobby", null);
                break;

            case SMsgType.hostSuccess:
                console.log(`Hosted lobby: ${data.lobbyID}`);
                this.isInLobby = true;
                this.emitter.emit("hosting-lobby", data.lobbyID);
                break;

            case SMsgType.newHost:
                console.log(`New host: ${data.hostID}`);
                if (data.hostID === this.myID) {
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