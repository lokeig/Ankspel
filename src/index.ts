import { GameLoop } from "@game/GameLoop";
import { Render } from "@render";
import { LobbyListCSS } from "@impl/LobbyList/CSS";
import { CanvasRender } from "@impl/Render";
import { MultiPeerServer } from "@impl/Server/WebRTC";
import { GameServer, LobbyList } from "@server";
import { Input } from "@common";

Input.init();
Render.set(new CanvasRender("gameCanvas"));
GameServer.set(new MultiPeerServer(new WebSocket("ws://localhost:3000")));
LobbyList.set(new LobbyListCSS())
new GameLoop();