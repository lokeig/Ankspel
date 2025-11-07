// import { PlayerInput } from "./PlayerInput";
// // import { loadControlsConfig } from ".aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa/InputConfigLoader";
// 'ä'

// export class InputManager {
//     players: PlayerInput[] = [];

//     async init() {
//         const config = await loadControlsConfig();
//         this.players = config.players.map(p => new PlayerInput(p));
//     }

//     update() {
//         const gamepads = navigator.getGamepads();
//         for (const player of this.players) {
//             player.updateKeyboard();
//             player.updateGamepad(gamepads);
//         }
//     }

//     getPlayer(i: number): PlayerInput {
//         return this.players[i];
//     }
// }

// export const inputManager = new InputManager();
