"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CMsgType = void 0;
var CMsgType;
(function (CMsgType) {
    CMsgType["forward"] = "forward";
    CMsgType["connect"] = "connect";
    CMsgType["joinLobby"] = "joinLobby";
    CMsgType["leaveLobby"] = "leaveLobby";
    CMsgType["hostLobby"] = "hostLobby";
    CMsgType["startLobby"] = "startLobby";
    CMsgType["listLobbies"] = "listLobbies";
    CMsgType["listUsers"] = "listUsers";
})(CMsgType || (exports.CMsgType = CMsgType = {}));
