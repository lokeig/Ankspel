import { ServerMessage } from "@server";

class PeerConnectionManager {

    private peerConnection: RTCPeerConnection;
    private dataChannel: RTCDataChannel | null = null;
    private pendingCandidates: RTCIceCandidate[] = [];
    private peerId: string;

    private messageCallback: (msg: ServerMessage, from: string) => void = () => { };

    constructor(peerId: string, private socket: WebSocket) {
        this.peerId = peerId;
        this.peerConnection = new RTCPeerConnection({
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
        });

        this.peerConnection.onicecandidate = event => {
            if (event.candidate) {
                this.socket.send(JSON.stringify({
                    type: "candidate",
                    to: this.peerId,
                    candidate: event.candidate
                }));
            }
        };

        this.peerConnection.ondatachannel = event => {
            this.dataChannel = event.channel;
            this.setupDataChannel();
        };
    }

    public createDataChannel(name = "game") {
        this.dataChannel = this.peerConnection.createDataChannel(name);
        this.setupDataChannel();
    }

    private setupDataChannel() {
        if (!this.dataChannel) {
            return;
        }
        this.dataChannel.onopen = () => {
            console.log(`DataChannel with ${this.peerId} open`);
        }
        this.dataChannel.onmessage = e => {
            try {
                const msg: ServerMessage = JSON.parse(e.data);
                this.messageCallback(msg, this.peerId);
            } catch {
                console.warn("Invalid message format", e.data);
            }
        };
    }

    public setOnMessage(callback: (msg: ServerMessage, from: string) => void) {
        this.messageCallback = callback;
    }

    public async createOffer() {
        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(offer);

        this.socket.send(JSON.stringify({
            type: "offer",
            to: this.peerId,
            offer: offer
        }));
    }

    async handleOffer(offer: RTCSessionDescriptionInit) {
        if (this.peerConnection.signalingState === "have-local-offer") {
            await this.peerConnection.setLocalDescription({ type: "rollback" });
        }

        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);

        this.socket.send(JSON.stringify({
            type: "answer",
            to: this.peerId,
            answer: answer
        }));

        this.pendingCandidates.forEach(c => this.peerConnection.addIceCandidate(c));
        this.pendingCandidates = [];
    }


    async handleAnswer(answer: RTCSessionDescriptionInit) {
        if (this.peerConnection.signalingState === "have-local-offer") {
            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        }
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
            this.dataChannel = null;
        }
        this.peerConnection.close();
    }

    public sendMessage(msg: ServerMessage) {
        if (this.dataChannel?.readyState === "open") {
            this.dataChannel.send(JSON.stringify(msg));
        }
    }
}

export { PeerConnectionManager };