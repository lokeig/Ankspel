"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerMessage = void 0;
var ServerMessage;
(function (ServerMessage) {
    ServerMessage["Forwarded"] = "Forwarded";
    ServerMessage["Connected"] = "Connected";
    ServerMessage["JoinSuccess"] = "JoinSuccess";
    ServerMessage["LeaveSuccess"] = "LeaveSuccess";
    ServerMessage["HostSuccess"] = "HostSuccess";
    ServerMessage["NewHost"] = "NewHost";
    ServerMessage["StartGame"] = "StartGame";
    ServerMessage["LobbyList"] = "LobbyList";
    ServerMessage["UserList"] = "UserList";
    ServerMessage["UserJoined"] = "UserJoined";
    ServerMessage["UserLeft"] = "UserLeft";
})(ServerMessage || (exports.ServerMessage = ServerMessage = {}));
