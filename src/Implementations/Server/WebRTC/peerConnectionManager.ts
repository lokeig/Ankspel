import { CMsgType, ForwardMessage } from "@shared";
import { WebRTCMessage, WebRTCSignalType } from "./types";
import { GameMessage } from "@server";

class PeerConnectionManager {
    private peerConnection: RTCPeerConnection;
    private dataChannel: RTCDataChannel | null = null;
    private pendingCandidates: RTCIceCandidate[] = [];
    private peerId: string;
    private socket: WebSocket;
    private messageCallback: (msg: GameMessage) => void = () => { };

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
            this.dataChannel = event.channel;
            this.setupDataChannel();
        };
    }

    public createDataChannel(name: string = "game") {
        this.dataChannel = this.peerConnection.createDataChannel(name);
        this.setupDataChannel();
    }

    private setupDataChannel() {
        if (!this.dataChannel) {
            return;
        }

        this.dataChannel.onopen = () => {
            console.log(`DataChannel with ${this.peerId} open`);
        };

        this.dataChannel.onmessage = (e: MessageEvent) => {
            try {
                const msg = JSON.parse(e.data);
                this.messageCallback(msg);
            } catch (error) {
                console.error("Failed to parse message:", error);
            }
        };

        this.dataChannel.onclose = () => {
            console.log(`DataChannel with ${this.peerId} closed`);
        };

        this.dataChannel.onerror = (error) => {
            console.error(`DataChannel error with ${this.peerId}:`, error);
        };
    }

    public setOnMessage(callback: (msg: GameMessage) => void) {
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
        if (this.dataChannel) {
            this.dataChannel.close();
        }
        this.peerConnection.close();
    }

    public sendMessage(msg: GameMessage) {
        if (this.dataChannel?.readyState === "open" && this.peerConnection.connectionState === "connected") {
            this.dataChannel!.send(JSON.stringify(msg));
        }
    }
}

export { PeerConnectionManager };