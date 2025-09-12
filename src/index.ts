import { CanvasRender } from "./HMI/canvasRender";
import { Render } from "./HMI/render";
import { GameLoop } from "./Status/Game/GameLoop/gameLoop";
import { Input } from "./Status/Game/Common/input";
import { GameServer } from "./Status/Server/Common/server";
import { MultiPeerServer } from "./Status/Server/RTCWebImplementation/multiPeerServer";

Input.init();
Render.set(new CanvasRender("gameCanvas"));
GameServer.set(new MultiPeerServer(new WebSocket("ws://localhost:3000")));
new GameLoop();