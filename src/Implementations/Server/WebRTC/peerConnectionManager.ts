import { CMsgType, ForwardMessage } from "@shared";
import { WebRTCMessage, WebRTCSignalType } from "./types";
import { GameMessage, GameMessageMap } from "@game/Server";
import { channel } from "diagnostics_channel";

class PeerConnectionManager {
    private peerConnection: RTCPeerConnection;
    private reliableChannel: RTCDataChannel | null = null;
    private unreliableChannel: RTCDataChannel | null = null;

    private pendingCandidates: RTCIceCandidate[] = [];
    private peerId: string;
    private socket: WebSocket;
    private messageCallback: (type: GameMessage, msg: GameMessage) => void = () => { };

    constructor(peerId: string, socket: WebSocket) {
        this.peerId = peerId;
        this.socket = socket;
        this.peerConnection = new RTCPeerConnection({
            iceServers: [
                { urls: "stun:stun.l.google.com:19302" },
                { urls: "stun:stun1.l.google.com:19302" }
            ]
        });

        this.setupConnectionHandlers();
    }

    private setupConnectionHandlers() {
        this.peerConnection.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
            if (event.candidate) {
                const candidateMessage: ForwardMessage<WebRTCMessage> = {
                    type: CMsgType.forward,
                    to: this.peerId,
                    msg: { type: WebRTCSignalType.Candidate, candidate: event.candidate }
                };
                this.socket.send(JSON.stringify(candidateMessage));
            }
        };

        this.peerConnection.ondatachannel = (event: RTCDataChannelEvent) => {
            const channel = event.channel;
            if (channel.label === "reliable") {
                this.reliableChannel = channel;
            } else {
                this.unreliableChannel = channel;
            }
            this.setupDataChannel(channel);
        };
    }

    public createDataChannels() {
        this.reliableChannel = this.peerConnection.createDataChannel("reliable");
        this.unreliableChannel = this.peerConnection.createDataChannel("unreliable", {
            ordered: false,
            maxRetransmits: 0
        });

        this.setupDataChannel(this.reliableChannel);
        this.setupDataChannel(this.unreliableChannel);
    }

    private setupDataChannel(channel: RTCDataChannel) {
        channel.onopen = () => {
            console.log(`DataChannel with ${this.peerId} open`);
        };

        channel.onmessage = (e: MessageEvent) => {
            const msg: { type: GameMessage, gameMessage: GameMessage } = JSON.parse(e.data);
            this.messageCallback(msg.type, msg.gameMessage);
        };

        channel.onclose = () => {
            console.log(`DataChannel with ${this.peerId} closed`);
        };

        channel.onerror = (error) => {
            console.error(`DataChannel error with ${this.peerId}:`, error);
        };
    }

    public setOnMessage(callback: (type: GameMessage, msg: GameMessage) => void) {
        this.messageCallback = callback;
    }

    public async createOffer() {
        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(offer);

        const offerMessage: ForwardMessage<WebRTCMessage> = {
            type: CMsgType.forward,
            to: this.peerId,
            msg: { type: WebRTCSignalType.Offer, offer: offer }
        };
        this.socket.send(JSON.stringify(offerMessage));
    }

    public async handleOffer(offer: RTCSessionDescriptionInit) {
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);

        const answerMessage: ForwardMessage<WebRTCMessage> = {
            type: CMsgType.forward,
            to: this.peerId,
            msg: { type: WebRTCSignalType.Answer, answer }
        };
        this.socket.send(JSON.stringify(answerMessage));

        this.pendingCandidates.forEach((candidate: RTCIceCandidate) => {
            this.peerConnection.addIceCandidate(candidate)
        });
        this.pendingCandidates = [];
    }

    public isConnected(): boolean {
        return (
            this.peerConnection.connectionState === "connected" &&
            this.reliableChannel?.readyState === "open" &&
            this.unreliableChannel?.readyState === "open"
        );
    }

    public async handleAnswer(answer: RTCSessionDescriptionInit) {
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    }

    public async addIceCandidate(candidate: RTCIceCandidateInit) {
        const iceCandidate = new RTCIceCandidate(candidate);
        if (this.peerConnection.remoteDescription) {
            await this.peerConnection.addIceCandidate(iceCandidate);
        } else {
            this.pendingCandidates.push(iceCandidate);
        }
    }

    public close() {
        if (this.reliableChannel) {
            this.reliableChannel.close();
        }
        this.peerConnection.close();
    }

    public sendReliableMessage<T extends GameMessage>(type: T, gameMessage: GameMessageMap[T]) {
        if (this.reliableChannel?.readyState === "open" && this.peerConnection.connectionState === "connected") {
            this.reliableChannel!.send(JSON.stringify({ type, gameMessage }));
        }
    }

    public sendUnreliableMessage<T extends GameMessage>(type: T, gameMessage: GameMessageMap[T]) {
        if (this.unreliableChannel?.readyState === "open" && this.peerConnection.connectionState === "connected") {
            this.unreliableChannel!.send(JSON.stringify({ type, gameMessage }));
        }
    }
}

export { PeerConnectionManager };