/**
 * Constant Definitions Here
 *
 * Од оваа линија надолу дефинирање на константи
 * */


import questions from "./questions.js";

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


let gamePhase = "playing"; // playing | success | retryPrompt | bonusRound | finalGameOver

let phaseTimer = 0;

let bonusQuestionsAnswered = 0;
let bonusIndex = 0;
let bonusScore = 0;
let selectedOption = null;
let bonusActive = true;
let minScore = 10

const bonusQuestions = questions

function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}

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

    // TODO Change these to percentages,used for help button center
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

/**
 * Puts two passwords to be later drawn,NOTE: vWidth and vHeight are used AND NOT canvas.width and canvas.height because
 * of screens having higher DPI so canvas needs to be scaled
 */
function spawnTwoPasswords() {
    passwordChoices = [];
    const vWidth = canvas.width / dpr;
    const vHeight = canvas.height / dpr;

    const generators = [generateReallySafe, generateSafe, generateNotSafe];
    const firstIndex = Math.floor(Math.random() * generators.length);
    let secondIndex;
    do { secondIndex = Math.floor(Math.random() * generators.length); } while (secondIndex === firstIndex);

    //TODO Change these so that the password box is always fit good for the text needed
    const boxWidth = Math.max(180, vWidth * 0.25);
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

    if(gamePhase === "bonusRound"){
        minScore+=10;
        return;
    }

    if (gamePhase === "playing") {
        timeLeft -= delta;
        timeElapsed += delta;



        if (timeLeft <= 0) {
            startNewRound();
        }

        if (timeElapsed >= gameDuration) {
            if (score >= minScore) {
                gamePhase = "success";
                phaseTimer = 3;
                minScore += 10;
            } else {
                gamePhase = "retryPrompt";
            }
        }
    }

    if (gamePhase === "success") {
        phaseTimer -= delta;

        if (phaseTimer <= 0) {
            resetMainGame();
        }
    }
}


function resetMainGame() {
    timeElapsed = 0;
    gameRunning = true;
    gamePhase = "playing";
    startNewRound();
    lastTime = Date.now();
    gameLoop();
}
/**
 * Function that draws everything,NOTE: vWidth and vHeight are used AND NOT canvas.width and canvas.height because
 * of screens having higher DPI so canvas needs to be scaled
* */
function draw() {
    // These are your "Game World" dimensions
    const vWidth = canvas.width / dpr;
    const vHeight = canvas.height / dpr;

    ctx.clearRect(0, 0, vWidth, vHeight);

    // if (gameEnded) {
    //     drawGameOver(vWidth, vHeight);
    //     return;
    // }

    console.log(gamePhase)

    if (gamePhase === "success") {
        drawSuccessScreen(vWidth, vHeight);
        return;
    }

    if (gamePhase === "retryPrompt") {
        drawRetryPrompt(vWidth, vHeight);
        return;
    }

    if (gamePhase === "finalGameOver") {
        drawGameOver(vWidth, vHeight);
        return;
    }

    if (gamePhase === "bonusRound") {
        console.log('draw() - (gamePhase === "bonusRound")')
        drawBonusRound(vWidth, vHeight);
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


    ctx.save();
    ctx.font = `bold ${Math.max(16, vWidth * 0.03)}px monospace`;
    // Draw the "Time Remaining" text at the bottom
    const remaining = Math.max(0, Math.ceil(gameDuration - timeElapsed));
    ctx.fillStyle = "#f6f3f3";
    ctx.textAlign = "center";
    ctx.fillText(`Time left: ${remaining}s`, vWidth / 2, vHeight - 20);
    ctx.restore();

    drawInfoButton(vWidth); // Keep this last to stay on top!
}

function drawSuccessScreen(vWidth, vHeight) {

    const gradient = ctx.createLinearGradient(0, 0, 0, vHeight);
    gradient.addColorStop(0, "#020617");
    gradient.addColorStop(1, "#020617");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, vWidth, vHeight);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";


    const cx = vWidth / 2;
    const cy = vHeight * 0.4;
    const r = vWidth * 0.06;

    ctx.strokeStyle = "#22c55e";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();


    ctx.strokeStyle = "#22c55e";
    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.4, cy);
    ctx.lineTo(cx - r * 0.1, cy + r * 0.3);
    ctx.lineTo(cx + r * 0.45, cy - r * 0.35);
    ctx.stroke();


    ctx.fillStyle = "#22c55e";
    ctx.font = `bold ${vWidth * 0.05}px Arial`;
    ctx.fillText(
        "Well done!",
        vWidth / 2,
        vHeight * 0.55
    );


    ctx.fillStyle = "#e5e7eb";
    ctx.font = `${vWidth * 0.028}px Arial`;
    ctx.fillText(
        "Continue with the same energy",
        vWidth / 2,
        vHeight * 0.62
    );
}

function drawRetryPrompt(vWidth, vHeight) {

    ctx.fillStyle = "#020617";
    ctx.fillRect(0, 0, vWidth, vHeight);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";


    ctx.fillStyle = "#facc15"; // warning / chance color
    ctx.font = `bold ${vWidth * 0.055}px Arial`;
    ctx.fillText(
        "One Last Chance",
        vWidth / 2,
        vHeight * 0.32
    );


    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(vWidth * 0.35, vHeight * 0.38);
    ctx.lineTo(vWidth * 0.65, vHeight * 0.38);
    ctx.stroke();


    ctx.fillStyle = "#cbd5f5";
    ctx.font = `${vWidth * 0.03}px Arial`;
    ctx.fillText(
        "You can continue the game once more.",
        vWidth / 2,
        vHeight * 0.44
    );


    drawButton(
        "Try Again", vWidth / 2 - 160, vHeight * 0.56, 150, 52, true
    );

    drawButton(
        "Quit", vWidth / 2 + 10, vHeight * 0.56, 150, 52, false
    );
}

function drawButton(text, x, y, w, h, primary) {
    ctx.fillStyle = primary ? "#22c55e" : "#334155";
    ctx.fillRect(x, y, w, h);


    ctx.strokeStyle = primary ? "#86efac" : "#64748b";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);

    ctx.fillStyle = "#f8fafc";
    ctx.font = "bold 18px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, x + w / 2, y + h / 2);
}



/**
 * Function that draws the Game Over Screen, NOTE: vWidth and vHeight are used AND NOT canvas.width and canvas.height because
 * of screens having higher DPI so canvas needs to be scaled
* */
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

/** Functions that draw the instruction text, NOTE: vWidth and vHeight are used AND NOT canvas.width and canvas.height because
* of screens having higher DPI so canvas needs to be scaled
* */
function drawInstructions(vWidth, vHeight) {
    ctx.fillStyle = "#f6f3f3";
    const scaleFont = Math.max(16, vWidth * 0.025);
    ctx.font = `bold ${scaleFont}px Arial`;
    ctx.textAlign = "center";
    // Positioned relative to top (15% down)
    ctx.fillText("Click the SAFER option", vWidth / 2, vHeight * 0.15);
}

/** Function that draws the Score
* */
function drawScore() {
    ctx.fillStyle = "#f6f3f3";
    ctx.font = `bold 18px Arial`;
    ctx.textAlign = "left";
    ctx.fillText("Score: " + score, 20, 30);
}

/** Function that draws the circular timer,NOTE: vWidth and vHeight are used AND NOT canvas.width and canvas.height because
* of screens having higher DPI so canvas needs to be scaled
* */
function drawTimer(vWidth, vHeight) {
    ctx.save();
    const centerX = vWidth / 2;
    const centerY = vHeight * 0.35; // Moved up slightly from your fixed 280
    const radius = Math.max(25, vWidth * 0.04);

    ctx.font = `bold ${radius * 0.8}px "Courier New", Courier, monospace`;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fillStyle = "#fb0000";
    ctx.fill();

    ctx.strokeStyle = "#ffffff";
    ctx.stroke();


    ctx.fillStyle = "#ffffff";

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(Math.ceil(timeLeft)+"", centerX, centerY);
    ctx.restore();
}

/** Function that Draws the info button and also the info dialog,NOTE: vWidth and vHeight are used AND NOT canvas.width and canvas.height because
* of screens having higher DPI so canvas needs to be scaled
* */
function drawInfoButton(vWidth) {
    if (!info.visible) return;


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


        let tooltipX = info.x - tooltipWidth;
        let tooltipY = info.y + 20;

        ctx.fillStyle = "rgba(15, 23, 42, 0.95)";
        ctx.strokeStyle = "#475569";
        ctx.lineWidth = 2;


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

function drawImages(vWidth, vHeight) {
    const centerX = vWidth / 2;
    const centerY = vHeight * 0.5; // Vertical center of the canvas


    // TODO Change these so that the image will fit correctly on the screen
    // Define how big the images should LOOK on screen (Virtual Pixels)
    const displayWidth = Math.min(300, vWidth * 0.4);
    const displayHeight = displayWidth * (4 / 5); // Maintains 5:4 ratio
    // Spacing between the two images
    const spacing = vWidth * 0.1;

    currentImages.forEach((img, index) => {
        // Calculate X position: one to the left, one to the right
        const x = (index === 0)
            ? centerX - spacing - displayWidth
            : centerX + spacing;

        const y = centerY - (displayHeight / 2);

        img.hitbox = { x, y, w: displayWidth, h: displayHeight };

        // 1. Draw a "Cyber" Frame first
        ctx.strokeStyle = "#00f2ff";
        ctx.lineWidth = 3;
        ctx.strokeRect(x - 5, y - 5, displayWidth + 10, displayHeight + 10);

        // 2. Draw the Image
        // drawImage(image, x, y, width, height) automatically scales
        // any image size down/up to fit your displayWidth/Height
        if (img.complete) {
            ctx.drawImage(img, x, y, displayWidth, displayHeight);
        } else {
            // Placeholder if image is still loading
            ctx.fillStyle = "#1e293b";
            ctx.fillRect(x, y, displayWidth, displayHeight);
        }

        // Save these coordinates for the click listener
        img.renderX = x;
        img.renderY = y;
        img.renderW = displayWidth;
        img.renderH = displayHeight;
    });
}

function drawPasswords() {
    ctx.save(); // 1. Freeze current settings (Timer font, etc.)

    // TODO Fix font so that is correct for canva size
    const scaleFont = Math.max(14, canvas.width * 0.01);
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

    ctx.restore();
}

function gameLoop() {
    if (!gameRunning) return;
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function handlePasswordChoice(text) {

    if (gamePhase === "bonusRound") {
        bonusQuestionsAnswered++;

        if (reallySafePasswords.includes(text)) bonusScore += 1;

        if (bonusQuestionsAnswered >= 5) {
            if (bonusScore >= 3) {
                resetMainGame();
            } else {
                gamePhase = "finalGameOver";
            }
        } else {
            spawnTwoPasswords();
        }
        return;
    }

    if (reallySafePasswords.includes(text)) {
        score += 2;
    } else if (safePasswords.includes(text)) {
        score += 1;
    } else {
        score -= 1;
    }
    startNewRound();
}


function drawBonusRound(vWidth, vHeight) {

    const q = bonusQuestions[bonusIndex];
    console.log('new question')

    ctx.clearRect(0, 0, vWidth, vHeight);

    ctx.fillStyle = "#e0f2fe";
    ctx.textAlign = "center";
    ctx.font = `bold ${Math.max(22, vWidth * 0.04)}px Arial`;
    ctx.fillText(`Bonus Question ${bonusIndex + 1} / 5`, vWidth / 2, 60);

    const cardWidth = Math.min(620, vWidth * 0.9);
    const cardHeight = 120;
    const cardX = (vWidth - cardWidth) / 2;
    const cardY = 90;


    // ctx.fillStyle = "#0ea5e9"; // blue
    // roundRect(cardX, cardY, cardWidth, cardHeight, 16, true, false);


    ctx.strokeStyle = "#7dd3fc";
    ctx.lineWidth = 3;
    roundRect(cardX, cardY, cardWidth, cardHeight, 16, false, true);


    ctx.fillStyle = "#ffffff";
    ctx.font = `bold ${Math.max(18, vWidth * 0.03)}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
        q.question,
        vWidth / 2,
        cardY + cardHeight / 2
    );

    const optionWidth = Math.min(520, vWidth * 0.85);
    const optionHeight = 54;
    const startY = cardY + cardHeight + 40;

    q.options.forEach((opt, i) => {
        const x = (vWidth - optionWidth) / 2;
        const y = startY + i * (optionHeight + 16);

        // Background
        ctx.fillStyle =
            selectedOption === i ? "#22c55e" : "#1e293b";
        roundRect(x, y, optionWidth, optionHeight, 12, true, false);

        // Border
        ctx.strokeStyle = "#64748b";
        ctx.lineWidth = 2;
        roundRect(x, y, optionWidth, optionHeight, 12, false, true);

        // Option text
        ctx.fillStyle = "#f8fafc";
        ctx.font = `bold ${Math.max(16, vWidth * 0.025)}px Arial`;
        ctx.fillText(opt, vWidth / 2, y + optionHeight / 2);
    });

    /* ---------- SCORE ---------- */
    ctx.fillStyle = "#cbd5f5";
    ctx.font = `bold ${Math.max(16, vWidth * 0.025)}px Arial`;
    ctx.fillText(`Score: ${bonusScore}`, vWidth / 2, vHeight - 30);
}

function handleImageChoice(img) {
    if (safeImages.includes(img)) {
        score += 2;
    } else {
        score -= 1;
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



/**
 * TODO - Execution Logic Here
 *
 * Од оваа линија надолу повикување и извршување на функции
 * */


// Start the loading process immediately
loadGameImages();

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

startBtn.addEventListener("click", () => {
    startScreen.style.display = 'none';
    document.getElementById('game-wrapper').style.display = 'flex';
    canvas.style.display = 'block';
    startGame();
});

// canvas.addEventListener("click", (e) => {
//     const rect = canvas.getBoundingClientRect();
//     const mouseX = e.clientX - rect.left;
//     const mouseY = e.clientY - rect.top;
//
//     if (gamePhase === "retryPrompt") {
//         if (isInside(mouseX, mouseY, vWidth / 2 - 150, vHeight * 0.55, 130, 50)) {
//             startBonusRound();
//         }
//         if (isInside(mouseX, mouseY, vWidth / 2 + 20, vHeight * 0.55, 130, 50)) {
//             gamePhase = "finalGameOver";
//         }
//         return;
//     }
//
//     if (currentRoundMode === "passwords") {
//         passwordChoices.forEach(pw => {
//             if (
//                 mouseX >= pw.x &&
//                 mouseX <= pw.x + pw.width &&
//                 mouseY >= pw.y &&
//                 mouseY <= pw.y + pw.height
//             ) {
//                 handlePasswordChoice(pw.text);
//             }
//         });
//     } else if (currentRoundMode === "images") {
//         currentImages.forEach((img) => {
//             // We use the same centering math used in drawImages
//             // const vWidth = canvas.width / dpr;
//             // const vHeight = canvas.height / dpr;
//             // const centerX = vWidth / 2;
//             // const spacing = Math.min(260, vWidth / 2 - 40);
//             //
//             // const imgWidth = 200; // Match your draw size
//             // const imgHeight = 150;
//             // const x = index === 0 ? centerX - spacing - 100 : centerX + spacing - 100;
//             // const y = vHeight * 0.5 - 75;
//             //
//             // if (mouseX >= x && mouseX <= x + imgWidth && mouseY >= y && mouseY <= y + imgHeight) {
//             //     handleImageChoice(img);
//             // }
//             if (img.hitbox &&
//                 mouseX >= img.hitbox.x && mouseX <= img.hitbox.x + img.hitbox.w &&
//                 mouseY >= img.hitbox.y && mouseY <= img.hitbox.y + img.hitbox.h) {
//                 handleImageChoice(img);
//             }
//         });
//     }
// });

// canvas.addEventListener("click", (e) => {
//     const rect = canvas.getBoundingClientRect();
//     const mouseX = e.clientX - rect.left;
//     const mouseY = e.clientY - rect.top;
//
//     const vWidth = canvas.width;
//     const vHeight = canvas.height;
//
//
//     if (gamePhase === "retryPrompt") {
//         console.log('retry prompt')
//         if (isInside(mouseX, mouseY, vWidth / 2 - 150, vHeight * 0.55, 130, 50)) {
//             startBonusRound();
//         }
//
//         if (isInside(mouseX, mouseY, vWidth / 2 + 20, vHeight * 0.55, 130, 50)) {
//             gamePhase = "finalGameOver";
//         }
//         return;
//     }
//
//     if (currentRoundMode === "passwords") {
//         passwordChoices.forEach(pw => {
//             if (
//                 mouseX >= pw.x &&
//                 mouseX <= pw.x + pw.width &&
//                 mouseY >= pw.y &&
//                 mouseY <= pw.y + pw.height
//             ) {
//                 handlePasswordChoice(pw.text);
//             }
//         });
//     }
//
//
//     else if (currentRoundMode === "images") {
//         currentImages.forEach(img => {
//             if (img.hitbox &&
//                 mouseX >= img.hitbox.x && mouseX <= img.hitbox.x + img.hitbox.w &&
//                 mouseY >= img.hitbox.y && mouseY <= img.hitbox.y + img.hitbox.h) {
//                 handleImageChoice(img);
//             }
//         });
//     }
// });

canvas.addEventListener("click", (e) => {

    // if (!bonusActive) return;

    // const rect = canvas.getBoundingClientRect();
    // const mx = e.clientX - rect.left;
    // const my = e.clientY - rect.top;
    //
    // bonusQuestions[bonusIndex].options.forEach((_, i) => {
    //     const y = 220 + i * 70;
    //     const x = canvas.width / 2 - 220;
    //
    //     if (
    //         mx > x &&
    //         mx < x + 440 &&
    //         my > y - 30 &&
    //         my < y + 20
    //     ) {
    //         handleBonusAnswer(i);
    //     }
    // });

    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const cardHeight = 120;
    const cardY = 90;

    const optionWidth = Math.min(520, canvas.width * 0.85);
    const optionHeight = 54;
    const optionGap = 16;

    const startY = cardY + cardHeight + 40;
    const optionX = (canvas.width - optionWidth) / 2;

    bonusQuestions[bonusIndex].options.forEach((_, i) => {
        const optionY = startY + i * (optionHeight + optionGap);

        if (
            mx >= optionX &&
            mx <= optionX + optionWidth &&
            my >= optionY &&
            my <= optionY + optionHeight
        ) {
            handleBonusAnswer(i);
        }
    });


    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const vWidth = canvas.width / dpr;
    const vHeight = canvas.height / dpr;

    if (gamePhase === "retryPrompt") {

        if (isInside(mouseX, mouseY, vWidth / 2 - 160, vHeight * 0.56, 150, 52)) {
            //to do
            console.log('try again clicked')
            startBonusRound();
            return;
        }

        if (isInside(mouseX, mouseY, vWidth / 2 + 10, vHeight * 0.56, 150, 52)) {
            // gamePhase = "finalGameOver";
            score = 0;
            resetMainGame();
            return;
        }
    }

    if (currentRoundMode === "passwords") {
        passwordChoices.forEach(pw => {
            if (isInside(mouseX, mouseY, pw.x, pw.y, pw.width, pw.height)) {
                handlePasswordChoice(pw.text);
            }
        });
    } else if (currentRoundMode === "images") {
        currentImages.forEach(img => {
            if (img.hitbox && isInside(mouseX, mouseY, img.hitbox.x, img.hitbox.y, img.hitbox.w, img.hitbox.h)) {
                handleImageChoice(img);
            }
        });
    }
});

function isInside(mx, my, x, y, w, h) {
    return mx >= x && mx <= x + w && my >= y && my <= y + h;
}


function handleBonusAnswer(index) {
    selectedOption = index;

    const correct = bonusQuestions[bonusIndex].correctIndex;
    if (index === correct) bonusScore++;

    setTimeout(() => {
        selectedOption = null;
        bonusIndex++;

        if (bonusIndex === 5) {
            endBonusRound();
        }
    }, 600);
}

function endBonusRound() {
    bonusActive = false;

    if (bonusScore >= 3) {
        resetMainGame();
    } else {
        gamePhase = "finalGameOver";
    }
}

function startBonusRound() {
    shuffleArray(bonusQuestions);
    bonusIndex = 0;
    bonusScore = 0;
    selectedOption = null;
    bonusActive = true;

    console.log('startBonusRound()')

    gamePhase = "bonusRound";
    timeLeft = Infinity;
}

canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const dx = mouseX - info.x;
    const dy = mouseY - info.y;
    info.hover = Math.sqrt(dx * dx + dy * dy) <= info.radius;
});