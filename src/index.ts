import { Input } from "@common";
import { Connection, MainMenu } from "@game/Server";
import { Render } from "@render";
import { GameLoop } from "@game/GameLoop";

import { MainMenuCSS } from "@impl/LobbyList/CSS";
import { CanvasRender } from "@impl/Render";
import { MultiPeerServer } from "@impl/Server/WebRTC";
import { MapManager } from "@game/Map";
import { defaultMap} from "@impl/Maps";
import { RequestAnimationFrameTimer } from "@impl/FrameTimer/requestAnimationFrame";
import { HTMLAudio } from "@impl/Audio/HTMLAudio";
import { AudioManager } from "@game/Audio/audioManager";
import { registerDefaultNames } from "@impl/register";

Input.init();
Render.set(new CanvasRender("gameCanvas"));
AudioManager.set(new HTMLAudio());


MapManager.addMap(defaultMap);
registerDefaultNames();

Connection.set(new MultiPeerServer(new WebSocket("https://ankspel.onrender.com")));
MainMenu.set(new MainMenuCSS());
new GameLoop(new RequestAnimationFrameTimer()).init();