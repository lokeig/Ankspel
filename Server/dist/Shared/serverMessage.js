"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerMessage = void 0;
var ServerMessage;
(function (ServerMessage) {
    ServerMessage["forwarded"] = "forwarded";
    ServerMessage["connected"] = "connected";
    ServerMessage["joinSuccess"] = "joinSuccess";
    ServerMessage["leaveSuccess"] = "leaveSuccess";
    ServerMessage["hostSuccess"] = "hostSuccess";
    ServerMessage["newHost"] = "newHost";
    ServerMessage["startGame"] = "startGame";
    ServerMessage["lobbyList"] = "lobbyList";
    ServerMessage["userList"] = "userList";
    ServerMessage["userJoined"] = "userJoined";
    ServerMessage["userLeft"] = "userLeft";
})(ServerMessage || (exports.ServerMessage = ServerMessage = {}));
