import { PeerConnectionManager } from "./peerConnectionManager";
import { Emitter, GameMessage, IServer } from "@game/Server";
import { ClientMessage, CMsgType, ForwardedMessage, ServerMessage, ServerMessageMap } from "@shared";
import { WebRTCMessage, WebRTCSignalType } from "./types";
import { GameMessageMap } from "@game/Server/gameMessage";

class MultiPeerServer implements IServer {
    public gameEvent: Emitter<GameMessageMap> = new Emitter();
    public serverEvent: Emitter<ServerMessageMap> = new Emitter();
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

    private cleanupAllPeers(): void {
        console.log("Cleaning up all peer connections");
        this.peers.forEach((peer: PeerConnectionManager, peerId: string) => {
            console.log(`Closing connection to peer: ${peerId}`);
            peer.close();
        });
        this.peers.clear();
    }

    private addPeer(peerId: string): void {
        if (peerId === this.myID || this.peers.has(peerId)) {
            return;
        }
        console.log(`Creating new peer connection to: ${peerId}`);
        const peer = new PeerConnectionManager(peerId, this.socket);
        this.peers.set(peerId, peer);

        peer.setOnMessage((type: GameMessage, msg: GameMessage) => {
            console.log("Received message " + type + ":", msg);
            this.gameEvent.publish(type, msg);
        });
        const isInitiator = peerId < this.myID!;
        if (isInitiator) {
            console.log(`Initiating connection to ${peerId}`);
            peer.createDataChannel();
            peer.createOffer();
        }
    }

    private removePeer(peerID: string): void {
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

    private handleMessage(event: MessageEvent): void {
        const parsed = JSON.parse(event.data);
        const type: ServerMessage = parsed.type;
        this.serverEvent.publish(type, parsed.msg as ServerMessageMap[typeof type]);

        switch (type) {
            case ServerMessage.forwarded: {
                const data = parsed.msg;
                this.handleForwardedMessage(data as ForwardedMessage<WebRTCMessage>);
                break;
            }

            case ServerMessage.connected: {
                const data = parsed.msg as ServerMessageMap[typeof type];
                this.myID = data.clientID;
                break;
            }

            case ServerMessage.userJoined: {
                const data = parsed.msg as ServerMessageMap[typeof type];
                console.log(`New user joined: ${data.userID}`);
                this.addPeer(data.userID);
                break;
            }

            case ServerMessage.userLeft: {
                const data = parsed.msg as ServerMessageMap[typeof type];
                console.log(`User left: ${data.userID}`);
                this.removePeer(data.userID);
                break;
            }

            case ServerMessage.userList: {
                const data = parsed.msg as ServerMessageMap[typeof type];
                console.log("Here are all other users:", data.users);
                for (const user of data.users) {
                    this.addPeer(user);
                }
                break;
            }

            case ServerMessage.lobbyList: {
                console.log("Got a new lobby-list");
                break;
            }

            case ServerMessage.joinSuccess: {
                console.log(`Joined lobby: ${parsed.lobbyID}`);
                const listUsersMsg: ClientMessage = { type: CMsgType.listUsers };
                this.socket.send(JSON.stringify(listUsersMsg));
                break;
            }

            case ServerMessage.leaveSuccess: {
                console.log(`Left lobby`);
                this.cleanupAllPeers();
                this.host = false;
                break;
            }

            case ServerMessage.hostSuccess: {
                console.log(`Hosted lobby: ${parsed.lobbyID}`);
                this.host = true;
                break;
            }

            case ServerMessage.newHost: {
                console.log(`New host: ${parsed.hostID}`);
                if (parsed.hostID === this.myID) {
                    this.host = true;
                    console.log("You are host");
                }
                break;
            }

            case ServerMessage.startGame: {
                console.log("Starting game");
                break;
            }
        }
    }

    public sendGameMessage<T extends GameMessage>(type: T, msg: GameMessageMap[T]): void {
        // console.log("Sending message: " + type, msg);
        this.peers.forEach((peer: PeerConnectionManager) => {
            peer.sendMessage(type, msg);
        });
    }

    public sendClientMessage(message: ClientMessage): void {
        // console.log("Sending to server: ", message);
        this.socket.send(JSON.stringify(message));
    }

    public  
}

export { MultiPeerServer };