import { Input } from "@common";
import { Connection, LobbyList } from "@game/Server";
import { Render } from "@render";
import { GameLoop } from "@game/GameLoop";

import { LobbyListCSS } from "@impl/LobbyList/CSS";
import { CanvasRender } from "@impl/Render";
import { MultiPeerServer } from "@impl/Server/WebRTC";
import { MapManager } from "@game/Map";
import { RegisterItems } from "@impl/Items/registerItems";
import { defaultMap, defaultMap2, defaultMap3, defaultMap4 } from "@impl/Maps";

Input.init();
Render.set(new CanvasRender("gameCanvas"));

MapManager.addMap(defaultMap);
// MapManager.addMap(defaultMap2);
// MapManager.addMap(defaultMap3);
// MapManager.addMap(defaultMap4);


RegisterItems();
Connection.set(new MultiPeerServer(new WebSocket("ws://localhost:3000")));
LobbyList.set(new LobbyListCSS());
new GameLoop();