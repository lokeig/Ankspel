import { CMsgType, ForwardMessage } from "@shared";
import { WebRTCMessage, WebRTCSignalType } from "./types";

class PeerConnectionManager {
    private peerConnection: RTCPeerConnection;
    private dataChannel: RTCDataChannel | null = null;
    private pendingCandidates: RTCIceCandidate[] = [];
    private peerId: string;
    private socket: WebSocket;
    private messageCallback: (msg: any, from: string) => void = () => { };

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
                this.messageCallback(msg, this.peerId);
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

    public setOnMessage(callback: (msg: any, from: string) => void) {
        this.messageCallback = callback;
    }

    public isConnected(): boolean {
        return this.dataChannel?.readyState === "open" &&
            this.peerConnection.connectionState === "connected";
    }

    public isConnecting(): boolean {
        return this.peerConnection.connectionState === "connecting" ||
            this.peerConnection.connectionState === "new";
    }

    public async createOffer() {
        try {
            const offer = await this.peerConnection.createOffer();
            await this.peerConnection.setLocalDescription(offer);

            const offerMessage: ForwardMessage<WebRTCMessage> = {
                type: CMsgType.forward,
                to: this.peerId,
                msg: { type: WebRTCSignalType.Offer, offer: offer }
            };
            this.socket.send(JSON.stringify(offerMessage));
        } catch (error) {
            console.error("Error creating offer:", error);
        }
    }

    async handleOffer(offer: RTCSessionDescriptionInit) {
        try {
            if (this.peerConnection.signalingState === "have-local-offer") {
                await this.peerConnection.setLocalDescription({ type: "rollback" });
            }

            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await this.peerConnection.createAnswer();
            await this.peerConnection.setLocalDescription(answer);

            const answerMessage: ForwardMessage<WebRTCMessage> = {
                type: CMsgType.forward,
                to: this.peerId,
                msg: { type: WebRTCSignalType.Answer, answer }
            };
            this.socket.send(JSON.stringify(answerMessage));

            this.pendingCandidates.forEach(candidate => {
                this.peerConnection.addIceCandidate(candidate).catch(console.error);
            });
            this.pendingCandidates = [];
        } catch (error) {
            console.error("Error handling offer:", error);
        }
    }

    async handleAnswer(answer: RTCSessionDescriptionInit) {
        try {
            if (this.peerConnection.signalingState === "have-local-offer") {
                await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
            }
        } catch (error) {
            console.error("Error handling answer:", error);
        }
    }

    public async addIceCandidate(candidate: RTCIceCandidateInit) {
        try {
            const iceCandidate = new RTCIceCandidate(candidate);
            if (this.peerConnection.remoteDescription) {
                await this.peerConnection.addIceCandidate(iceCandidate);
            } else {
                this.pendingCandidates.push(iceCandidate);
            }
        } catch (error) {
            console.error("Error adding ICE candidate:", error);
        }
    }

    public close() {
        if (this.peerConnection.connectionState === "closed") {
            return;
        }
        if (this.dataChannel && this.dataChannel.readyState !== "closed") {
            this.dataChannel.close();
        }
        this.dataChannel = null;
        this.peerConnection.close();
    }

    public sendMessage(msg: any) {
        if (this.isConnected()) {
            this.dataChannel!.send(JSON.stringify(msg));
        }
    }
}

export { PeerConnectionManager };