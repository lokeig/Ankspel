
function resize(canvas: HTMLCanvasElement): void {
    const padding = 100;
    canvas.width = window.innerWidth - padding;
    canvas.height = window.innerHeight - padding;
}

function resizeCanvas(id: string): void {
    const canvas = document.getElementById(id) as HTMLCanvasElement;
    resize(canvas);
    window.addEventListener("resize", () => resize(canvas));
}

export { resizeCanvas };