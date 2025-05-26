import { Game } from './game';
import { Controls } from './types';

const controls: Controls = {
    jump: " ", // SPACEBAR
    left: "a",
    right: "d",
    down: "s",
    shoot: "r",
    pickup: "e",
};

new Game("gameCanvas", controls);