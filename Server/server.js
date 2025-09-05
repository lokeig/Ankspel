import { WebSocketServer, WebSocket } from "ws";
import { v4 as uuidv4 } from "uuid";

const PORT = 3000;
const server = new WebSocketServer({ port: PORT });

// Keep track of connected peers
const peers = new Map();

server.on("connection", (socket) => {
    let id = null;

    console.log("New client connected");

    socket.on("message", (message) => {
        const text = message.toString();
        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            console.warn("Invalid JSON:", text);
            return;
        }

        switch (data.type) {
            case "join":
                join(socket);
                break;

            case "list-peers":
                listPeers(socket);
                break;

            case "offer":
                offer(data, socket);
                break;

            case "answer":
                answer(data, socket);
                break;

            case "candidate":
                candidate(data);
                break;

            default:
                console.warn("Unknown message type:", data.type);
        }
    });

    function join(socket) {
        id = uuidv4();
        peers.set(id, socket);

        // Send back assigned ID
        socket.send(
            JSON.stringify({
                type: "welcome",
                id,
            })
        );

        broadcast(
            {
                type: "peer-joined",
                id,
            },
            socket
        );
    }
    
    function listPeers(socket) {
        if (socket && id) {
            socket.send(
                JSON.stringify({
                    type: "peer-list",
                    peers: Array.from(peers.keys()).filter((pid) => pid !== id),
                })
            );
        }
    }

    function offer(data, socket) {
        const target = peers.get(data.to);
        if (target && target.readyState === WebSocket.OPEN) {
            target.send(
                JSON.stringify({
                    ...data,
                    from: id,
                })
            );
        }
    }

    function answer(data, socket) {
        const target = peers.get(data.to);
        if (target && target.readyState === WebSocket.OPEN) {
            target.send(
                JSON.stringify({
                    ...data,
                    from: id,
                })
            );
        }
    }

    function candidate(data) {
        const target = peers.get(data.to);
        if (target && target.readyState === WebSocket.OPEN) {
            target.send(
                JSON.stringify({
                    ...data,
                    from: id,
                })
            );
        }
    }

    function broadcast(msg, exclude) {
        const text = JSON.stringify(msg);
        peers.forEach((peer) => {
            if (peer !== exclude && peer.readyState === WebSocket.OPEN) {
                peer.send(text);
            }
        });
    }

    socket.on("close", () => {
        console.log(`Client disconnected: ${id}`);
        if (id) {
            peers.delete(id);
            broadcast({ type: "peer-left", id }, socket);
        }
    });


});

console.log(
    `WebSocket signaling server running on ws://localhost:${PORT}`
);
