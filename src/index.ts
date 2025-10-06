import { CanvasRender } from "./HMI/canvasRender";
import { Render } from "./HMI/render";
import { GameLoop } from "./Status/Game/GameLoop/gameLoop";
import { Input } from "./Status/Game/Common/input";
import { GameServer } from "./Status/Server/server";
import { MultiPeerServer } from "./Status/Implementations/Server/WebRTC/multiPeerServer";
import { LobbyList } from "./Status/Game/GameLoop/States/Lobby/LobbyList/lobbylist";
import { LobbyListCSS } from "./Status/Implementations/LobbyList/CSS/lobbyListCSS";

Input.init();
Render.set(new CanvasRender("gameCanvas"));
GameServer.set(new MultiPeerServer(new WebSocket("ws://localhost:3000")));
LobbyList.set(new LobbyListCSS("lobbylist"))
new GameLoop();