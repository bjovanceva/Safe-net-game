/**
 * Constant Definitions Here
 *
 * Од оваа линија надолу дефинирање на константи
 * */

const startScreen = document.getElementById("start-screen");
const startBtn = document.getElementById("start-btn");
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const dpr = window.devicePixelRatio || 1;

let score = 0;
let gameRunning = false;
let passwordChoices = [];
let currentImages = [];
let roundTime = 5;
let timeLeft = roundTime;
let lastTime = Date.now();
let reallySafePasswords = []
let safePasswords = []
let notSafePasswords = []

let currentRoundMode = "passwords";

let gameDuration = 20;
let timeElapsed = 0;
let gameEnded = false;

const info = {
    x: canvas.width - 40,
    y: 40,
    radius: 18,
    hover: false,
    visible: true,
    text: `A password is SAFE if it meets ALL of 
these rules:

Length
- At least 8 characters

Character variety
- Contains at least 3 of these 4 types:
  Uppercase (A–Z)
  Lowercase (a–z)
  Number (0–9)
  Special character (! @ # $ % & *)

No common patterns
- Does NOT contain: "1234", "password", 
"qwerty", "admin"
- No repeated characters like "aaaa"

No personal info
- Does NOT include: Name, Birth year, 
Username`
};

// Arrays to hold the successfully loaded image objects
const safeImages = [];
const unsafeImages = [];

// How many images to try loading (e.g., checks good1_final up to good20_final)
// You can increase this number as you add more images to your folder.
const maxImagesToCheckGood = 7;
const maxImagesToCheckBad = 8;

/**
 * TODO - Function Definition Logic Here
 *
 * Од оваа линија надолу дефинирање на функции
 * */

//Function that loads images and stores them in the arrays as 'Image' objects
function loadGameImages() {

    // Cycle for loading and saving bad images to array
    for (let i = 1; i <= maxImagesToCheckBad; i++) {
        // --- Try to load UNSAFE images ---
        const uImg = new Image();
        uImg.src = `images/unsafe/bad${i}_final.jpg`;

        uImg.onload = () => {
            unsafeImages.push(uImg);
        };
    }

    // Cycle for loading and saving good images to array
    for (let i = 1; i <= maxImagesToCheckGood; i++) {

        // --- Try to load SAFE images ---
        const sImg = new Image();
        // Construct the path: images/safe/good[i]_final.jpg
        sImg.src = `images/safe/good${i}_final.jpg`;

        // Only add to the game array if the file actually exists and loads
        sImg.onload = () => {
            safeImages.push(sImg);
        };
        // Optional: If you use .png instead of .jpg for some, 
        // you would need a more complex loader or ensure all are converted to .jpg
    }
}

//Resizes the canvas to the correct size, auto-called when window is resized
function resizeCanvas() {
    const topArea = document.getElementById("top-area");
    const maxWidthVW = 90; // Max 90% of screen width
    const maxHeightVH = 85; // Max 85% of screen height (leaving room for top-area)
    const aspectRatio = 17 / 11;

    // 1. Calculate size based on Width
    let widthByWidth = window.innerWidth * (maxWidthVW / 100);
    if (widthByWidth > 900) widthByWidth = 900;
    let heightByWidth = widthByWidth / aspectRatio;

    // 2. Calculate size based on Height
    let heightByHeight = window.innerHeight * (maxHeightVH / 100);
    let widthByHeight = heightByHeight * aspectRatio;

    // 3. Pick the smaller one so it fits both ways
    let displayWidth, displayHeight;
    if (widthByHeight <= widthByWidth) {
        displayWidth = widthByHeight;
        displayHeight = heightByHeight;
    } else {
        displayWidth = widthByWidth;
        displayHeight = heightByWidth;
    }

    const dpr = window.devicePixelRatio || 1;

    // Set internal resolution (High-DPI)
    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;

    // Set CSS display size (Visual size)
    canvas.style.width = displayWidth + "px";
    canvas.style.height = displayHeight + "px";

    // Reset and scale
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    // Adjust top area and UI positions
    topArea.style.height = "10vh"; // Use vh for consistency
    info.x = displayWidth - 30;
    info.y = 30;
}

function startGame() {
    score = 0;
    gameRunning = true;
    gameEnded = false;
    timeElapsed = 0;
    startNewRound();
    gameLoop();
}

function randomChar(type) {
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const symbols = "!@#$%&*";

    if (type === "upper") return upper[Math.floor(Math.random() * upper.length)];
    if (type === "lower") return lower[Math.floor(Math.random() * lower.length)];
    if (type === "number") return numbers[Math.floor(Math.random() * numbers.length)];
    if (type === "symbol") return symbols[Math.floor(Math.random() * symbols.length)];
}

function generateReallySafe() {
    let pw = "";
    const types = ["upper", "lower", "number", "symbol"];
    for (let i = 0; i < 12; i++) {
        pw += randomChar(types[Math.floor(Math.random() * types.length)]);
    }
    reallySafePasswords.push(pw);
    return pw;
}

function generateSafe() {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let pw = "";
    for (let i = 0; i < 10; i++) {
        pw += chars[Math.floor(Math.random() * chars.length)];
    }
    safePasswords.push(pw)
    return pw;
}

function generateNotSafe() {
    const weak = [
        "123456",
        "password",
        "qwerty",
        "admin123",
        "111111",
        "abc123",
        "letMeIn"
    ];

    let pw = weak[Math.floor(Math.random() * weak.length)];
    notSafePasswords.push(pw);
    return pw;
}

// function isSafePassword(pw) {
//     const hasUpper = /[A-Z]/.test(pw);
//     const hasLower = /[a-z]/.test(pw);
//     const hasNumber = /[0-9]/.test(pw);
//     const hasSymbol = /[!@#$%&*]/.test(pw);
//
//     const variety = [hasUpper, hasLower, hasNumber, hasSymbol].filter(Boolean).length;
//     const weakPatterns = ["1234", "password", "qwerty", "admin"];
//
//     if (pw.length < 8) return false;
//     if (variety < 3) return false;
//     if (weakPatterns.some(p => pw.toLowerCase().includes(p))) return false;
//
//     return true;
// }

function spawnTwoPasswords() {
    passwordChoices = [];
    const vWidth = canvas.width / dpr;
    const vHeight = canvas.height / dpr;

    const generators = [generateReallySafe, generateSafe, generateNotSafe];
    const firstIndex = Math.floor(Math.random() * generators.length);
    let secondIndex;
    do { secondIndex = Math.floor(Math.random() * generators.length); } while (secondIndex === firstIndex);

    const boxWidth = Math.max(180, vWidth * 0.3);
    const boxHeight = 60;
    const spacing = vWidth * 0.2; // 20% distance from center

    passwordChoices.push({
        text: generators[firstIndex](),
        x: (vWidth / 2) - spacing - (boxWidth / 2),
        y: vHeight * 0.5,
        width: boxWidth,
        height: boxHeight
    });

    passwordChoices.push({
        text: generators[secondIndex](),
        x: (vWidth / 2) + spacing - (boxWidth / 2),
        y: vHeight * 0.5,
        width: boxWidth,
        height: boxHeight
    });

    passwordChoices.sort(() => Math.random() - 0.5);
}

function spawnTwoImages() {
    currentImages = [];

    const safeImg = safeImages[Math.floor(Math.random() * safeImages.length)];
    const unsafeImg = unsafeImages[Math.floor(Math.random() * unsafeImages.length)];

    currentImages.push(safeImg, unsafeImg);


    currentImages.sort(() => Math.random() - 0.5);
}

function roundRect(x, y, w, h, r, fill, stroke) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();

    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
}

function update() {
    const now = Date.now();
    const delta = (now - lastTime) / 1000;
    lastTime = now;

    timeLeft -= delta;
    timeElapsed += delta;

    if (timeLeft <= 0) {
        startNewRound();
    }


    if (timeElapsed >= gameDuration) {
        gameEnded = true;
        gameRunning = false;
    }
}

function draw() {
    // These are your "Game World" dimensions
    const vWidth = canvas.width / dpr;
    const vHeight = canvas.height / dpr;

    ctx.clearRect(0, 0, vWidth, vHeight);

    if (gameEnded) {
        drawGameOver(vWidth, vHeight);
        return;
    }

    // Pass the virtual sizes down to the helpers
    drawInstructions(vWidth, vHeight);
    drawScore();
    drawTimer(vWidth, vHeight);

    if (currentRoundMode === "passwords") {
        drawPasswords(vWidth, vHeight);
    } else if (currentRoundMode === "images") {
        drawImages(vWidth, vHeight);
    }

    // Draw the "Time Remaining" text at the bottom
    const remaining = Math.max(0, Math.ceil(gameDuration - timeElapsed));
    ctx.fillStyle = "#f6f3f3";
    ctx.textAlign = "center";
    ctx.fillText(`Time left: ${remaining}s`, vWidth / 2, vHeight - 20);

    drawInfoButton(vWidth); // Keep this last to stay on top!
}

function drawGameOver(vWidth, vHeight) {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, vWidth, vHeight);

    ctx.fillStyle = "#ffffff";
    const scaleFont = Math.max(24, vWidth * 0.05);
    ctx.font = `bold ${scaleFont}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`Game Over! Score: ${score}`, vWidth / 2, vHeight / 2);
}

function drawInstructions(vWidth, vHeight) {
    ctx.fillStyle = "#f6f3f3";
    const scaleFont = Math.max(16, vWidth * 0.025);
    ctx.font = `bold ${scaleFont}px Arial`;
    ctx.textAlign = "center";
    // Positioned relative to top (15% down)
    ctx.fillText("Click the SAFER option", vWidth / 2, vHeight * 0.15);
}

function drawScore() {
    ctx.fillStyle = "#f6f3f3";
    ctx.font = `bold 18px Arial`;
    ctx.textAlign = "left";
    ctx.fillText("Score: " + score, 20, 30);
}

function drawTimer(vWidth, vHeight) {
    const centerX = vWidth / 2;
    const centerY = vHeight * 0.35; // Moved up slightly from your fixed 280
    const radius = Math.max(25, vWidth * 0.04);

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fillStyle = "#fb0000";
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#ffffff";
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.font = `bold ${radius * 0.8}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(Math.ceil(timeLeft), centerX, centerY);
}

function drawInfoButton(vWidth) {
    if (!info.visible) return;

    // Reset shadow for the button
    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = 8;

    const gradient = ctx.createRadialGradient(info.x, info.y, info.radius / 2, info.x, info.y, info.radius);
    gradient.addColorStop(0, "#334155");
    gradient.addColorStop(1, "#0f172a");

    ctx.beginPath();
    ctx.arc(info.x, info.y, info.radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.shadowBlur = 0; // Turn off shadow for text

    ctx.fillStyle = "white";
    ctx.font = `bold ${info.radius}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("?", info.x, info.y);

    if (info.hover) {
        const padding = 15;
        const tooltipWidth = 320;
        const lines = info.text.split("\n");
        const lineHeight = 13;
        const tooltipHeight = lines.length * lineHeight + padding * 2;

        // Ensure tooltip doesn't go off the right edge
        let tooltipX = info.x - tooltipWidth;
        let tooltipY = info.y + 20;

        ctx.fillStyle = "rgba(15, 23, 42, 0.95)";
        ctx.strokeStyle = "#475569";
        ctx.lineWidth = 2;

        // Using your existing rounded rect function
        roundHelpScreenRect(ctx, tooltipX, tooltipY, tooltipWidth, tooltipHeight, 10, true, true);

        const scaleFont = Math.min(14, vWidth * 0.015);
        ctx.fillStyle = "#f8fafc";
        ctx.font = `${scaleFont}px Arial`;
        ctx.textAlign = "left";
        // ctx.textBaseline = "top";
        lines.forEach((line, i) => {
            ctx.fillText(line, tooltipX + padding, tooltipY + padding + i * lineHeight);
        });
    }
}

function drawImages() {
    const centerX = canvas.width / 2;
    const y = canvas.height * 0.5; // vertical center
    const spacing = Math.min(260, canvas.width / 2 - 40);

    currentImages.forEach((img, index) => {
        if (!img.complete) return;


        let imgWidth = img.naturalWidth;
        let imgHeight = img.naturalHeight;

        const maxWidth = canvas.width / 2 - 40;
        const maxHeight = canvas.height * 0.5;
        const scale = Math.min(maxWidth / imgWidth, maxHeight / imgHeight, 1);

        imgWidth *= scale;
        imgHeight *= scale;


        const x = index === 0
            ? centerX - spacing - imgWidth / 2
            : centerX + spacing - imgWidth / 2;
        const drawY = y - imgHeight / 2;

        ctx.globalAlpha = 0.9;
        ctx.drawImage(img, x, drawY, imgWidth, imgHeight);
        ctx.globalAlpha = 1;
    });
}

function drawPasswords() {
    const scaleFont = Math.max(14, canvas.width * 0.02);
    ctx.font = `bold ${scaleFont}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    passwordChoices.forEach((pw) => {
        const r = 12;

        ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 4;

        const gradient = ctx.createLinearGradient(
            pw.x,
            pw.y,
            pw.x,
            pw.y + pw.height
        );
        gradient.addColorStop(0, "#334155");
        gradient.addColorStop(1, "#1e293b");

        ctx.fillStyle = gradient;
        roundRect(pw.x, pw.y, pw.width, pw.height, r, true, false);

        ctx.shadowColor = "transparent";
        ctx.strokeStyle = "#f8fafc";
        ctx.lineWidth = 2;
        roundRect(pw.x, pw.y, pw.width, pw.height, r, false, true);

        ctx.fillStyle = "#f8fafc";
        ctx.fillText(pw.text, pw.x + pw.width / 2, pw.y + pw.height / 2);

    });
}

function gameLoop() {
    if (!gameRunning) return;
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function handlePasswordChoice(text) {
    if (reallySafePasswords.includes(text)) {
        score += 2;
    } else if (safePasswords.includes(text)) {
        score += 1;
    } else {
        score -= 1;
    }
    startNewRound();
}

function handleImageChoice(img) {
    if (safeImages.includes(img)) {
        score += 2; // safe image
    } else {
        score += 0; // unsafe image
    }
    startNewRound();
}

function startNewRound() {

    if (Math.random() < 0.5) {
        currentRoundMode = "passwords";
        spawnTwoPasswords();
    } else {
        currentRoundMode = "images";
        spawnTwoImages();
    }

    timeLeft = roundTime;
    lastTime = Date.now();
}

function roundHelpScreenRect(ctx, x, y, width, height, radius, fill, stroke) {
    if (typeof stroke === "undefined") stroke = true;
    if (typeof radius === "undefined") radius = 5;
    if (typeof radius === "number") {
        radius = {tl: radius, tr: radius, br: radius, bl: radius};
    } else {
        const defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0};
        for (let side in defaultRadius) {
            radius[side] = radius[side] || defaultRadius[side];
        }
    }
    ctx.beginPath();
    ctx.moveTo(x + radius.tl, y);
    ctx.lineTo(x + width - radius.tr, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
    ctx.lineTo(x + width, y + height - radius.br);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
    ctx.lineTo(x + radius.bl, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
    ctx.lineTo(x, y + radius.tl);
    ctx.quadraticCurveTo(x, y, x + radius.tl, y);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
}

//
// function startCountdown() {
//     waiting = true;
//     countdown = 5;
//     passwordChoices = [];
//
//     const interval = setInterval(() => {
//         countdown--;
//
//         if (countdown <= 0) {
//             clearInterval(interval);
//             waiting = false;
//             spawnTwoPasswords();
//         }
//     }, 1000);
// }
//
// function drawCountdown() {
//     if (!waiting) return;
//
//     ctx.fillStyle = "#f97316";
//     ctx.font = "26px Arial";
//     ctx.textAlign = "center";
//     ctx.fillText(
//         `${countdown}`,
//         canvas.width / 2,
//         canvas.height / 2
//     );
// }

// const title = document.getElementById("game-title");
//
//
// let fireworkInterval = setInterval(() => {
//     createFireworkBurst();
//     createFireworkBurst();
// }, 600);
//
// function createFireworkBurst() {
//     const rect = title.getBoundingClientRect();
//
//
//     const x =
//         rect.left +
//         Math.random() * rect.width +
//         (Math.random() > 0.5 ? -40 : 40);
//
//     const y =
//         rect.top +
//         Math.random() * rect.height +
//         (Math.random() > 0.5 ? -30 : 30);
//
//     for (let i = 0; i < 30; i++) {
//         const particle = document.createElement("div");
//         particle.classList.add("firework");
//
//         const angle = Math.random() * Math.PI * 2;
//         const distance = Math.random() * 150 + 50;
//
//         particle.style.left = `${x}px`;
//         particle.style.top = `${y}px`;
//         particle.style.backgroundColor = randomColor();
//
//         particle.style.setProperty("--dx", `${Math.cos(angle) * distance}px`);
//         particle.style.setProperty("--dy", `${Math.sin(angle) * distance}px`);
//
//         document.body.appendChild(particle);
//
//         setTimeout(() => particle.remove(), 1200);
//     }
// }
//
// function randomColor() {
//     const colors = [
//         "#22c55e", // green
//         "#38bdf8", // blue
//         "#facc15", // yellow
//         "#f472b6", // pink
//         "#a78bfa", // purple
//         "#fb7185"  // red
//     ];
//     return colors[Math.floor(Math.random() * colors.length)];
// }


// Add these variables to your global scope
const drops = [];
const fontSize = 16;


/**
 * Execution Logic Here
 *
 * Од оваа линија надолу повикување и извршување на функции
 * */


// Start the loading process immediately
loadGameImages();

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

startBtn.addEventListener("click", () => {
    startScreen.style.display = "none";
    canvas.style.display = "block";
    startGame();
});

canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (currentRoundMode === "passwords") {
        passwordChoices.forEach(pw => {
            if (
                mouseX >= pw.x &&
                mouseX <= pw.x + pw.width &&
                mouseY >= pw.y &&
                mouseY <= pw.y + pw.height
            ) {
                handlePasswordChoice(pw.text);
            }
        });
    } else if (currentRoundMode === "images") {
        currentImages.forEach((img, index) => {
            // We use the same centering math used in drawImages
            const vWidth = canvas.width / dpr;
            const vHeight = canvas.height / dpr;
            const centerX = vWidth / 2;
            const spacing = Math.min(260, vWidth / 2 - 40);

            const imgWidth = 200; // Match your draw size
            const imgHeight = 150;
            const x = index === 0 ? centerX - spacing - 100 : centerX + spacing - 100;
            const y = vHeight * 0.5 - 75;

            if (mouseX >= x && mouseX <= x + imgWidth && mouseY >= y && mouseY <= y + imgHeight) {
                handleImageChoice(img);
            }
        });
    }
});









canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const dx = mouseX - info.x;
    const dy = mouseY - info.y;
    info.hover = Math.sqrt(dx * dx + dy * dy) <= info.radius;
});