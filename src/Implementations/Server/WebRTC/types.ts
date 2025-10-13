enum WebRTCSignalType {
    Offer = "Offer",
    Answer = "Answer",
    Candidate = "Candidate",
}

type WebRTCMessage =
    | { type: WebRTCSignalType.Offer; offer: RTCSessionDescriptionInit }
    | { type: WebRTCSignalType.Answer; answer: RTCSessionDescriptionInit }
    | { type: WebRTCSignalType.Candidate; candidate: RTCIceCandidateInit };

export { WebRTCSignalType };
export type { WebRTCMessage };