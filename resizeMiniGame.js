export function resizeMiniGameCanvas(canvas, ctx, game, displayWidth, displayHeight, dpr) {

    const BASE_WIDTH = 600;
    const zoom = Math.max(0.5, displayWidth / BASE_WIDTH);

    const controls = document.getElementById('mobile-controls');
    if (controls) {
        // This passes the JS number to the CSS --ui-scale variable
        controls.style.setProperty('--ui-scale', zoom + "");
    }

    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;

    canvas.style.width = displayWidth + "px";
    canvas.style.height = displayHeight + "px";

    game.set_viewport(
        (canvas.width / dpr) / zoom,
        (canvas.height / dpr) / zoom
    );

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr * zoom, dpr * zoom);

    ctx.imageSmoothingEnabled = false;

    if (game.current_map) {
        game.force_camera_center();
    }
}