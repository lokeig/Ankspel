import { Game } from './game';
import { Controls } from './types';


export const images = {
    playerImage: '/assets/player.png',
    tileIce: '/assets/tileIce.png',
    background: '/assets/rainbow.jpg',
    prop: '/assets/props.png'
};

const controls: Controls = {
    jump: " ", // SPACEBAR
    left: "a",
    right: "d",
    down: "s",
    shoot: "r",
    pickup: "e",
};

new Game("gameCanvas", controls);