export type Vector = {
    x: number,
    y: number
}

export type Controls = {
    left: string,
    right: string,
    jump: string,
    down: string
}

export type Neighbours = {
    left: boolean,
    right: boolean,
    top: boolean,
    bot: boolean,
    topLeft: boolean,
    topRight: boolean,
    botLeft: boolean,
    botRight: boolean
}


export type Direction = keyof Neighbours;
