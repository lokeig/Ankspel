"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SMsgType = void 0;
var SMsgType;
(function (SMsgType) {
    SMsgType["forwarded"] = "forwarded";
    SMsgType["connected"] = "connected";
    SMsgType["joinSuccess"] = "joinSuccess";
    SMsgType["leaveSuccess"] = "leaveSuccess";
    SMsgType["hostSuccess"] = "hostSuccess";
    SMsgType["newHost"] = "newHost";
    SMsgType["startGame"] = "startGame";
    SMsgType["lobbyList"] = "lobbyList";
    SMsgType["userList"] = "userList";
    SMsgType["userJoined"] = "userJoined";
    SMsgType["userLeft"] = "userLeft";
})(SMsgType || (exports.SMsgType = SMsgType = {}));
