import { Input } from "@common";
import { GameServer, LobbyList } from "@server";
import { Render } from "@render";
import { GameLoop } from "@game/GameLoop";

import { LobbyListCSS } from "@impl/LobbyList/CSS";
import { CanvasRender } from "@impl/Render";
import { MultiPeerServer } from "@impl/Server/WebRTC";
import { MapManager } from "@game/Map";
import { defaultMap } from "@impl/defaultMap";
import { RegisterItems } from "@impl/Items/registerItems";

Input.init();
Render.set(new CanvasRender("gameCanvas"));
MapManager.addMap("defaultMap", defaultMap);
RegisterItems();
GameServer.set(new MultiPeerServer(new WebSocket("ws://localhost:3000")));
LobbyList.set(new LobbyListCSS());
new GameLoop();