import { GameLoop } from "@game/GameLoop";
import { Render } from "@render";
import { LobbyListCSS } from "@impl/LobbyList/CSS";
import { CanvasRender } from "@impl/Render";
import { MultiPeerServer } from "@impl/Server/WebRTC";
import { GameServer, LobbyList } from "@server";
import { Input } from "@common";
import { MapManager } from "@game/Map";
import { defaultMap } from "@impl/defaultMap";

Input.init();
Render.set(new CanvasRender("gameCanvas"));
MapManager.addMap("defaultMap", defaultMap)
GameServer.set(new MultiPeerServer(new WebSocket("ws://localhost:3000")));
LobbyList.set(new LobbyListCSS())
new GameLoop();