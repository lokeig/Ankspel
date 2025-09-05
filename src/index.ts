import { CanvasRender } from "./HMI/canvasRender";
import { Render } from "./HMI/render";
import { GameLoop } from "./Status/GameLoop/gameLoop";
import { Input } from "./Status/GameLoop/MainGame/Common/input";
import { GameServer } from "./Status/GameLoop/Server/Common/server";
import { MultiPeerServer } from "./Status/GameLoop/Server/RTCWebImplementation/multiPeerServer";

Input.init();
Render.set(new CanvasRender("gameCanvas"));
GameServer.set(new MultiPeerServer(new WebSocket("ws://localhost:3000")));
new GameLoop();