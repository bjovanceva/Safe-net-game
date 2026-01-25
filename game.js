/**
 * Constant Definitions Here
 *
 * Од оваа линија надолу дефинирање на константи
 * */


import questions from "./data/questions.js"
import images_description from "./data/images_description.js";
import {WEAK_PASSWORDS} from "./data/weak_passwords.js"

import {Game2D} from "./2d_game.js";
import {resizeMiniGameCanvas} from "./resizeMiniGame.js";

const startScreen = document.getElementById("start-screen")
const startBtn = document.getElementById("start-btn")
const canvas = document.getElementById("gameCanvas")
const ctx = canvas.getContext("2d")

const dpr = window.devicePixelRatio || 1

const SCORE_FONT_SIZE = 18
const PASSWORDS_FONT_SIZE = 22
const TOTAL_TIMER_FONT_SIZE = 18
const TIMER_RADIUS_SIZE = 20
const INFO_BUTTON_RADIUS_SIZE = 18
const INSTRUCTION_TEXT_FONT_SIZE = 20
const RETRY_BUTTON_TEXT_FONT_SIZE = 18
const GAME_OVER_TEXT_FONT_SIZE = 36

const BONUS_ROUND_HEADER_TEXT_FONT_SIZE = 26
const BONUS_ROUND_BODY_TEXT_FONT_SIZE = 20
const BONUS_ROUND_SCORE_TEXT_FONT_SIZE = 18


const PLAYING_PHASE = "playing"
const SUCCESS_PHASE = "success"
const RETRY_PROMPT_PHASE = "retryPrompt"
const BONUS_ROUND_PHASE = "bonusRound"
const FINAL_GAME_OVER_PHASE = "finalGameOver"
// const MINI_GAME_PHASE = "miniGame"

const SYMBOLS = "!@#$%&*"

const PASSWORDS_MODE = "passwords"
const IMAGES_MODE = "images"


let mainRafId = null;

let score = 0
let gameRunning = false
let passwordChoices = []
let currentImages = []
let roundTime = 5
let timeLeft = roundTime
let lastTime = Date.now()
let reallySafePasswords = []
let safePasswords = []
let notSafePasswords = []


let currentRoundMode = PASSWORDS_MODE

const gameDuration = 20
let roundDuration = 5

let timeElapsed = 0
let gameEnded = false

let isMiniGameFinished = false


let gamePhase = PLAYING_PHASE // playing | success | retryPrompt | bonusRound | finalGameOver

let phaseTimer = 0

// let bonusQuestionsAnswered = 0
let bonusIndex = 0
let bonusScore = 0
let bonusActive = true

let bonusLocked = false;
let bonusTimeoutId = null;

let selectedOption = null
let minScore = 10
let successSequence = 0

let restartButton = null

let mouseData = null

const bonusQuestions = questions

// Arrays to hold the successfully loaded image objects
const safeImages = []
const unsafeImages = []

// How many images to try loading (e.g., checks good1_final up to good20_final)
const MAX_IMAGES_TO_CHECK_GOOD = 20
const MAX_IMAGES_TO_CHECK_BAD = 20

const {game: game, canvas: canvas2D, ctx: ctx2D, StartMiniGame, isHappyEnd} = Game2D(endMiniGame)

const info = {
    x: canvas.width - 40,
    y: 40,
    radius: 18,
    open: false,
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
- Does NOT include: Name, Birth year, Username

TIPS:
- Numbers and special characters are in the color 
  Green so that they can be noticed easily`
}

/**
 * TODO - Function Definition Logic Here
 *
 * Од оваа линија надолу дефинирање на функции
 * */


//Function that loads images and stores them in the arrays as 'Image' objects
function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load: ${src}`));
        img.src = src;

        const key = src
            .split("/")
            .pop()
            .replace(".jpg", "");

        img.description = images_description[key];
    });
}

async function loadGameImages() {
    const safeSources = [];
    const unsafeSources = [];

    for (let i = 1; i <= MAX_IMAGES_TO_CHECK_GOOD; i++) {
        safeSources.push(`images/safe/good${i}_final.jpg`);
    }
    for (let i = 1; i <= MAX_IMAGES_TO_CHECK_BAD; i++) {
        unsafeSources.push(`images/unsafe/bad${i}_final.jpg`);
    }

    // Load all, but don’t die if some fail
    const safeResults = await Promise.allSettled(safeSources.map(loadImage));
    const unsafeResults = await Promise.allSettled(unsafeSources.map(loadImage));

    safeImages.length = 0;
    unsafeImages.length = 0;

    // console.log(safeResults[0].value.description)

    for (const r of safeResults) if (r.status === "fulfilled") safeImages.push(r.value);
    for (const r of unsafeResults) if (r.status === "fulfilled") unsafeImages.push(r.value);

    // Hard requirement: must have at least 1 of each
    console.log(safeImages.length)
    console.log(unsafeImages.length)
    if (safeImages.length === 0 || unsafeImages.length === 0) {
        throw new Error("Not enough images loaded (need at least 1 safe and 1 unsafe).");
    }
}

//Resizes the canvas to the correct size, auto-called when window is resized
function resizeCanvas() {
    const topArea = document.getElementById("top-area")
    const maxWidthVW = 90 // Max 90% of screen width
    const maxHeightVH = 85 // Max 85% of screen height (leaving room for top-area)
    const aspectRatio = 17 / 11

    // 1. Calculate size based on Width
    let widthByWidth = window.innerWidth * (maxWidthVW / 100)
    if (widthByWidth > 900) widthByWidth = 900
    let heightByWidth = widthByWidth / aspectRatio

    let heightByHeight = window.innerHeight * (maxHeightVH / 100)
    let widthByHeight = heightByHeight * aspectRatio

    let displayWidth, displayHeight
    if (widthByHeight <= widthByWidth) {
        displayWidth = widthByHeight
        displayHeight = heightByHeight
    } else {
        displayWidth = widthByWidth
        displayHeight = heightByWidth
    }


    canvas.width = displayWidth * dpr
    canvas.height = displayHeight * dpr


    canvas.style.width = displayWidth + "px"
    canvas.style.height = displayHeight + "px"

    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.scale(dpr, dpr)


    resizeMiniGameCanvas(
        canvas2D,
        ctx2D,
        game,
        displayWidth,
        displayHeight,
        dpr
    )


    topArea.style.height = "10vh" // Use vh for consistency

    info.x = displayWidth - (displayWidth / 30)
    info.y = (displayWidth / 30)
    info.radius = INFO_BUTTON_RADIUS_SIZE / (900 / displayWidth)


    const vWidth = canvas.width / dpr
    const vHeight = canvas.height / dpr
    const {boxWidth, boxHeight, spacing} = getPasswordBoxDimensions(vWidth, vHeight)

    const [p1, p2] = passwordChoices

    if (p1 !== undefined) {
        p1.x = (vWidth / 2) - spacing - (boxWidth / 2)
        p1.y = vHeight * 0.5
        p1.width = boxWidth
        p1.height = boxHeight
    }
    if (p2 !== undefined) {
        p2.x = (vWidth / 2) + spacing - (boxWidth / 2)
        p2.y = vHeight * 0.5
        p2.width = boxWidth
        p2.height = boxHeight
    }

    draw()
}

function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]]
    }
}

function startGame() {
    gamePhase = PLAYING_PHASE
    if (!isMiniGameFinished) {
        score = 0
    }
    gameRunning = true
    gameEnded = false
    timeElapsed = 0
    startNewRound()
    startMainLoop()
}


function randomChar(type) {
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    const lower = "abcdefghijklmnopqrstuvwxyz"
    const numbers = "0123456789"

    if (type === "upper") return upper[Math.floor(Math.random() * upper.length)]
    if (type === "lower") return lower[Math.floor(Math.random() * lower.length)]
    if (type === "number") return numbers[Math.floor(Math.random() * numbers.length)]
    if (type === "symbol") return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
}

function generateReallySafe() {
    let pw = ""
    const types = ["upper", "lower", "number", "symbol"]
    for (let i = 0; i < 12; i++) {
        pw += randomChar(types[Math.floor(Math.random() * types.length)])
    }
    reallySafePasswords.push(pw)
    return pw
}

function generateSafe() {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let pw = ""
    for (let i = 0; i < 10; i++) {
        pw += chars[Math.floor(Math.random() * chars.length)]
    }
    safePasswords.push(pw)
    return pw
}

function generateNotSafe() {

    let pw = WEAK_PASSWORDS[Math.floor(Math.random() * WEAK_PASSWORDS.length)]
    notSafePasswords.push(pw)
    return pw
}

function getPasswordBoxDimensions(vWidth, vHeight) {
    const boxWidth = vWidth / 3.5
    const boxHeight = vHeight / 9
    const spacing = vWidth * 0.2 // 20% distance from center
    return {boxWidth, boxHeight, spacing}
}

/**
 * Puts two passwords to be later drawn,NOTE: vWidth and vHeight are used AND NOT `canvas.width` and `canvas.height` because
 * of screens having higher DPI so canvas needs to be scaled
 */
function spawnTwoPasswords() {
    roundTime = 5
    roundDuration = 5

    passwordChoices = []
    const vWidth = canvas.width / dpr
    const vHeight = canvas.height / dpr

    const generators = [generateReallySafe, generateSafe, generateNotSafe]
    const firstIndex = Math.floor(Math.random() * generators.length)
    let secondIndex
    do {
        secondIndex = Math.floor(Math.random() * generators.length)
    } while (secondIndex === firstIndex)

    const {boxWidth, boxHeight, spacing} = getPasswordBoxDimensions(vWidth, vHeight)

    passwordChoices.push({
        text: generators[firstIndex](),
        x: (vWidth / 2) - spacing - (boxWidth / 2),
        y: vHeight * 0.5,
        width: boxWidth,
        height: boxHeight
    })

    passwordChoices.push({
        text: generators[secondIndex](),
        x: (vWidth / 2) + spacing - (boxWidth / 2),
        y: vHeight * 0.5,
        width: boxWidth,
        height: boxHeight
    })

    passwordChoices.sort(() => Math.random() - 0.5)
}

function spawnTwoImages() {
    if (safeImages.length === 0 || unsafeImages.length === 0) {
        currentRoundMode = PASSWORDS_MODE;
        spawnTwoPasswords();
        return;
    }

    roundTime = 10
    timeLeft = 10
    roundDuration = 10
    timeElapsed -= 5


    currentImages = [];
    const safeImg = safeImages[Math.floor(Math.random() * safeImages.length)];
    const unsafeImg = unsafeImages[Math.floor(Math.random() * unsafeImages.length)];

    currentImages.push(safeImg, unsafeImg);
    currentImages.sort(() => Math.random() - 0.5);
}

function startMiniGame() {
    stopMainLoop()
    gameRunning = false

    canvas.style.display = 'none'
    canvas2D.style.display = "block"

    initTouchControlsIfMobile(game)
    game.running = true

    StartMiniGame()
}

function endMiniGame() {
    canvas.style.display = 'block'
    canvas2D.style.display = "none"

    const controls = document.getElementById('mobile-controls');
    if (controls) {
        controls.remove(); // Completely removes the elements from the DOM
    }


    isMiniGameFinished = true
    let isHappy = isHappyEnd();
    console.log("HappyEnd")
    console.log(isHappy)
    if (isHappy) {
        score += 10
    }

    minScore = score + 10
    successSequence = 0

    startGame()
}

function update() {
    const now = Date.now()
    const delta = (now - lastTime) / 1000
    lastTime = now


    if (info.open) return;

    if (gamePhase === BONUS_ROUND_PHASE) {
        return
    }

    if (gamePhase === PLAYING_PHASE) {
        timeLeft -= delta
        timeElapsed += delta


        if (timeLeft <= 0) {
            startNewRound()
        }

        if (timeElapsed >= gameDuration) {
            if (score >= minScore) {
                gamePhase = SUCCESS_PHASE
                phaseTimer = 3
                minScore = score + 10;
                successSequence += 1
            } else {
                gamePhase = RETRY_PROMPT_PHASE
                minScore = 10
                successSequence = 0
            }
        }
    }

    if (gamePhase === SUCCESS_PHASE) {
        phaseTimer -= delta

        if (phaseTimer <= 0) {
            if (successSequence > 1) {
                startMiniGame()
            } else {
                resetMainGame()
            }

        }
    }
}

function resetMainGame() {
    timeElapsed = 0
    gameRunning = true
    gamePhase = PLAYING_PHASE
    startNewRound()
    lastTime = Date.now()
    startMainLoop()
}

function drawTotalTimer(vWidth, vHeight, aspect_size) {

    const font_size = Math.round(TOTAL_TIMER_FONT_SIZE / aspect_size)

    ctx.save()
    ctx.font = `bold ${font_size}px monospace`
    // Draw the "Time Remaining" text at the bottom
    const remaining = Math.max(0, Math.ceil(gameDuration - timeElapsed))
    ctx.fillStyle = "#f6f3f3"
    ctx.textAlign = "center"
    ctx.fillText(`Time left: ${remaining}s`, vWidth / 2, vHeight - 20)
    ctx.restore()
}

/**
 * Function that draws everything,NOTE: vWidth and vHeight are used AND NOT canvas.width and canvas.height because
 * of screens having higher DPI so canvas needs to be scaled
 * */
function draw() {
    const vWidth = canvas.width / dpr
    const vHeight = canvas.height / dpr

    const aspect_size = (900 / vWidth)

    ctx.clearRect(0, 0, vWidth, vHeight)

    const blurred = info.open

    if (blurred) {
        ctx.save()
        ctx.filter = `blur(${8 / aspect_size}px)`
    }


    if (gamePhase === SUCCESS_PHASE) {
        drawSuccessScreen(vWidth, vHeight)
        return
    }

    if (gamePhase === RETRY_PROMPT_PHASE) {
        drawRetryPrompt(vWidth, vHeight, aspect_size)
        return
    }

    if (gamePhase === FINAL_GAME_OVER_PHASE) {
        drawGameOver(vWidth, vHeight, aspect_size)
        return
    }

    if (gamePhase === BONUS_ROUND_PHASE) {
        // console.log('draw() - (gamePhase === "bonusRound")')
        drawBonusRound(vWidth, vHeight, aspect_size)
        return
    }

    drawInstructions(vWidth, vHeight, aspect_size)
    drawScore(vWidth, aspect_size)
    drawTimer(vWidth, vHeight, aspect_size)

    if (currentRoundMode === PASSWORDS_MODE) {
        drawPasswords(vWidth, vHeight, aspect_size)
    } else if (currentRoundMode === IMAGES_MODE) {
        drawImages(vWidth, vHeight, aspect_size)
    }

    drawTotalTimer(vWidth, vHeight, aspect_size)

    if (blurred) {
        ctx.restore()
    }

    drawInfoButton(vWidth, vHeight, aspect_size)
}

function drawSuccessScreen(vWidth, vHeight) {

    const gradient = ctx.createLinearGradient(0, 0, 0, vHeight)
    gradient.addColorStop(0, "#020617")
    gradient.addColorStop(1, "#020617")
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, vWidth, vHeight)

    ctx.textAlign = "center"
    ctx.textBaseline = "middle"


    const cx = vWidth / 2
    const cy = vHeight * 0.4
    const r = vWidth * 0.06

    ctx.strokeStyle = "#22c55e"
    ctx.lineWidth = 6
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.stroke()


    ctx.strokeStyle = "#22c55e"
    ctx.lineWidth = 6
    ctx.lineCap = "round"
    ctx.beginPath()
    ctx.moveTo(cx - r * 0.4, cy)
    ctx.lineTo(cx - r * 0.1, cy + r * 0.3)
    ctx.lineTo(cx + r * 0.45, cy - r * 0.35)
    ctx.stroke()


    ctx.fillStyle = "#22c55e"
    ctx.font = `bold ${vWidth * 0.05}px Arial`
    ctx.fillText(
        "Well done!",
        vWidth / 2,
        vHeight * 0.55
    )


    ctx.fillStyle = "#e5e7eb"
    ctx.font = `${vWidth * 0.028}px Arial`
    ctx.fillText(
        "Continue with the same energy",
        vWidth / 2,
        vHeight * 0.62
    )
}

function drawRetryPrompt(vWidth, vHeight, aspect_size) {

    const bgGrad = ctx.createRadialGradient(vWidth / 2, vHeight / 2, 10, vWidth / 2, vHeight / 2, vWidth);
    bgGrad.addColorStop(0, "#0f172a");
    bgGrad.addColorStop(1, "#020617");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, vWidth, vHeight);


    ctx.fillStyle = "rgba(0, 242, 255, 0.03)";
    for (let i = 0; i < vHeight; i += 4) {
        ctx.fillRect(0, i, vWidth, 1);
    }

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";


    ctx.save();
    ctx.shadowBlur = 15;
    ctx.shadowColor = "#facc15";
    ctx.fillStyle = "#facc15";
    ctx.font = `bold ${vWidth * 0.06}px monospace`; // Monospace font
    ctx.fillText("CRITICAL SYSTEM FAILURE", vWidth / 2, vHeight * 0.3);
    ctx.restore();

    // 4. Sub-header text
    ctx.fillStyle = "#94a3b8";
    ctx.font = `${vWidth * 0.03}px monospace`;
    ctx.fillText("> INITIALIZING RECOVERY OPTIONS...", vWidth / 2, vHeight * 0.4);

    // Button sizing - making them wider for the long text
    const buttonW = vWidth * 0.35;
    const buttonH = Math.round(60 / aspect_size);
    const button_spacing = Math.round(20 / aspect_size);


    drawCyberButton(
        "RECOVERY_PROTOCOL", vWidth / 2 - buttonW - button_spacing, vHeight * 0.56, buttonW, buttonH, true, aspect_size
    );

    drawCyberButton(
        "TERMINATE_REBOOT", vWidth / 2 + button_spacing, vHeight * 0.56, buttonW, buttonH, false, aspect_size
    );
}

function drawCyberButton(text, x, y, w, h, primary, aspect_size) {
    ctx.save();


    let color
    let hover
    if(mouseIsInside(x,y,w,h)){
        color = primary ? "#22c55e" : "#ef4444";
        hover = true
    }
    else {
        color = primary ? "#10652e" : "#9a2a2a";
        hover = false
    }
    const fontSize = Math.round(RETRY_BUTTON_TEXT_FONT_SIZE / aspect_size);


    ctx.fillStyle = "rgba(15, 23, 42, 0.8)";
    ctx.strokeStyle = color;
    ctx.shadowBlur = hover ? 15 : 0;
    ctx.shadowColor = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 4 / aspect_size);
    ctx.fill();
    ctx.stroke();


    ctx.lineWidth = 4 / aspect_size;


    ctx.beginPath();
    ctx.moveTo(x, y + 15 / aspect_size);
    ctx.lineTo(x, y);
    ctx.lineTo(x + 15 / aspect_size, y);
    ctx.stroke();


    ctx.beginPath();
    ctx.moveTo(x + w - 15 / aspect_size, y + h);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x + w, y + h - 15 / aspect_size);
    ctx.stroke();


    ctx.shadowBlur = 10 / aspect_size;
    ctx.shadowColor = color;
    ctx.fillStyle = "#f8fafc";
    ctx.font = `bold ${fontSize}px monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, x + w / 2, y + h / 2);

    ctx.restore();
}

/**
 * Function that draws the Game Over Screen, NOTE: vWidth and vHeight are used AND NOT canvas.width and canvas.height because
 * of screens having higher DPI so canvas needs to be scaled
 * */
function drawGameOver(vWidth, vHeight, aspect_size) {
    ctx.save()
    // 1. Background: Deep slate with a slight transparency for a "HUD overlay" feel
    ctx.fillStyle = "rgba(10, 15, 28, 0.95)";
    ctx.fillRect(0, 0, vWidth, vHeight);

    // 2. Neon "Game Over" Text
    const scaleFont = Math.round(GAME_OVER_TEXT_FONT_SIZE / aspect_size);
    ctx.font = `bold ${scaleFont}px "Courier New", monospace`; // Cyber Monospace
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";


    ctx.shadowBlur = 15 / aspect_size;
    ctx.shadowColor = "#ff0055"; // Hot pink neon glow
    ctx.fillStyle = "#ff0055";
    ctx.fillText(`GAME OVER`, vWidth / 2, vHeight / 2 - (20 / aspect_size));


    ctx.shadowBlur = 0;
    ctx.fillStyle = "#00f2ff";
    ctx.font = `bold ${Math.round(20 / aspect_size)}px "Courier New", monospace`;
    ctx.fillText(`SYSTEM_RECOVERY: Score ${score}`, vWidth / 2, vHeight / 2 + (20 / aspect_size));


    const btnW = Math.max(200, vWidth / 4);
    const btnH = 50 / aspect_size;
    const btnX = (vWidth - btnW) / 2;
    const btnY = vHeight / 2 + (80 / aspect_size);

    restartButton = {x: btnX, y: btnY, w: btnW, h: btnH};

    let isHover = mouseIsInside(
        restartButton.x,
        restartButton.y,
        restartButton.w,
        restartButton.h)

    ctx.shadowColor = isHover ? "#ff0000" : "#c52222";
    ctx.shadowBlur = isHover ? 25 / aspect_size : 0


    ctx.beginPath();
    ctx.moveTo(btnX + (15 / aspect_size), btnY);
    ctx.lineTo(btnX + btnW, btnY);
    ctx.lineTo(btnX + btnW, btnY + btnH - (15 / aspect_size));
    ctx.lineTo(btnX + btnW - (15 / aspect_size), btnY + btnH);
    ctx.lineTo(btnX, btnY + btnH);
    ctx.lineTo(btnX, btnY + (15 / aspect_size));
    ctx.closePath();




    ctx.fillStyle = isHover ? "rgba(255,0,0,0.2)" :"rgba(197,34,34,0.2)";
    ctx.fill();
    ctx.shadowBlur = 0
    ctx.strokeStyle = isHover ? "#ff0000" : "#c52222";
    ctx.lineWidth = 2 / aspect_size;


    ctx.stroke();
    ctx.fillStyle = isHover ? "#ff0000": "#c52222";
    ctx.font = `bold ${Math.round(18 / aspect_size)}px "Courier New", monospace`;

    ctx.fillText("REBOOT_SYSTEM", vWidth / 2, btnY + btnH / 2);
    ctx.restore()
}

/** Functions that draw the instruction text, NOTE: vWidth and vHeight are used AND NOT canvas.width and canvas.height because
 * of screens having higher DPI so canvas needs to be scaled
 * */
function drawInstructions(vWidth, vHeight, aspect_size) {
    ctx.save();

    const scaleFont = Math.round(INSTRUCTION_TEXT_FONT_SIZE / aspect_size);
    // const yPos = vHeight * 0.15;
    const yPos = vHeight * 0.15 - (40 / aspect_size);

    // 1. Draw a subtle "Underline" or accent bar
    ctx.strokeStyle = "rgba(0, 242, 255, 0.3)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(vWidth * 0.3, yPos + (15 / aspect_size));
    ctx.lineTo(vWidth * 0.7, yPos + (15 / aspect_size));
    ctx.stroke();

    // 2. Mission Text with a "Terminal" prefix
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `bold ${scaleFont}px "Courier New", Courier, monospace`;

    // Glowing Effect
    ctx.shadowBlur = 8 / aspect_size;
    ctx.shadowColor = "#00f2ff";
    ctx.fillStyle = "#00f2ff";

    // We add "> " to make it look like a command line
    ctx.fillText("> SELECT_SAFER_PROTOCOL", vWidth / 2, yPos);

    ctx.restore();
}

/** Function that draws the Score */
function drawScore(vWidth, aspect_size) {
    ctx.save();
    let font_size = Math.round(SCORE_FONT_SIZE / aspect_size);
    const text_x = 20 / aspect_size;
    const text_y = 35 / aspect_size;

    // 1. Draw a small decorative HUD bracket behind the score
    ctx.strokeStyle = "#00f2ff";
    ctx.lineWidth = 2 / aspect_size;
    ctx.beginPath();
    ctx.moveTo(text_x - (5 / aspect_size), text_y - (15 / aspect_size));
    ctx.lineTo(text_x - (5 / aspect_size), text_y + (10 / aspect_size));
    ctx.lineTo(text_x + (10 / aspect_size), text_y + (10 / aspect_size));
    ctx.stroke();

    // 2. Draw the Score Text
    ctx.fillStyle = "#00f2ff";
    ctx.font = `bold ${font_size}px "Courier New", Courier, monospace`;
    ctx.textAlign = "left";

    // Use padding to move text away from the bracket
    ctx.fillText("SCORE_" + score.toString().padStart(4, '0'), text_x + (5 / aspect_size), text_y);

    ctx.restore();
}

/** Function that draws the circular timer,NOTE: `vWidth` and `vHeight` are used AND NOT `canvas.width` and `canvas.height` because
 * of screens having higher DPI so canvas needs to be scaled
 * */
function drawTimer(vWidth, vHeight, aspect_size) {
    ctx.save();
    const centerX = vWidth / 2;
    const centerY = vHeight * 0.28; // Slightly higher to clear the center play area
    const radius = Math.round(TIMER_RADIUS_SIZE / aspect_size);

    // 1. Draw Background Glow
    ctx.shadowBlur = 15 * (TIMER_RADIUS_SIZE / 25) / aspect_size;
    ctx.shadowColor = "#fb0000";

    // 2. The Inner Core (The Circle)
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(251, 0, 0, 0.2)"; // Semi-transparent red
    ctx.fill();
    ctx.strokeStyle = "#fb0000";
    ctx.lineWidth = 3 / aspect_size;
    ctx.stroke();


    const startAngle = -Math.PI / 2;
    const progress = timeLeft / roundDuration; // Assuming you have roundDuration (e.g., 5s)
    const endAngle = startAngle + (Math.PI * 2 * progress);

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 6 / aspect_size, startAngle, endAngle);
    ctx.strokeStyle = "#00f2ff"; // Cyber blue progress
    ctx.lineWidth = 4 / aspect_size;
    ctx.lineCap = "round";
    ctx.stroke();

    // 4. The Timer Text
    ctx.shadowBlur = 0; // Don't glow the text too much, or it's unreadable
    ctx.fillStyle = "#ffffff";
    ctx.font = `bold ${radius * 0.9}px "Courier New", Courier, monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    // Adding +2 for that visual vertical centering fix
    ctx.fillText(Math.ceil(timeLeft) + "", centerX, centerY + (2 / aspect_size));

    ctx.restore();
}

/** Function that Draws the info button and also the info dialog,NOTE: vWidth and vHeight are used AND NOT canvas.width and canvas.height because
 * of screens having higher DPI so canvas needs to be scaled
 * */
function drawInfoButton(vWidth, vHeight, aspect_size) {
    if (!info.visible) return;

    ctx.save();


    ctx.beginPath();
    ctx.arc(info.x, info.y, info.radius, 0, Math.PI * 2);
    ctx.fillStyle = "#0f172a";
    ctx.fill();

    let strokeStyle
    let shadowColor
    if(mouseIsInsideCircle(info.x,info.y,info.radius)){
        strokeStyle = info.open ? "#ff0000" : "#00f2ff"
        shadowColor = info.open ? "#ff0000" : "#00f2ff"
    }else {
        strokeStyle = info.open ? "#8e0000" : "#1e293b"
        shadowColor = info.open ? "#8e0000" : "#00f2ff"
    }



    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = 2 / aspect_size;
    ctx.shadowBlur = info.open ? 15 / aspect_size : 0;
    ctx.shadowColor = shadowColor;
    ctx.stroke();

    ctx.shadowBlur = 0;
    // ctx.fillStyle = info.open ? "#00f2ff" : "#f8fafc";
    ctx.fillStyle = info.open ? "#ff0000" : "#f8fafc";
    ctx.font = `bold ${info.radius * 1.2}px monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    if (info.open) {
        ctx.fillText("x", info.x, info.y);
    } else {
        ctx.fillText("?", info.x, info.y);
    }

    ctx.restore();

    if (info.open) {
        drawInfoPopup(vWidth, aspect_size);
    }
}

function drawInfoPopup(vWidth, aspect_size) {
    const padding = 20 / aspect_size;
    const tooltipWidth = 450 / aspect_size;
    const lines = info.text.split("\n");
    const lineHeight = 18 / aspect_size; // Increased for better readability
    const tooltipHeight = lines.length * lineHeight + padding * 3;

    let tooltipX = info.x - tooltipWidth;
    let tooltipY = info.y + (30 / aspect_size);


    ctx.save();


    ctx.fillStyle = "rgba(10, 20, 40, 0.95)";
    ctx.strokeStyle = "#00f2ff";
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.roundRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight, 4 / aspect_size);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "rgba(0, 242, 255, 0.2)";
    ctx.fillRect(tooltipX, tooltipY, tooltipWidth, 25 / aspect_size);

    ctx.fillStyle = "#00f2ff";
    ctx.font = `bold ${10 / aspect_size}px monospace`;

    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText("DATA_STREAMS // HELP_PROMPT", tooltipX + (10 / aspect_size), tooltipY + (12 / aspect_size));


    ctx.strokeStyle = "#00f2ff";
    ctx.lineWidth = 3 / aspect_size;
    const bLen = 10 / aspect_size;

    ctx.beginPath();
    ctx.moveTo(tooltipX + tooltipWidth - bLen, tooltipY + tooltipHeight);
    ctx.lineTo(tooltipX + tooltipWidth, tooltipY + tooltipHeight);
    ctx.lineTo(tooltipX + tooltipWidth, tooltipY + tooltipHeight - bLen);
    ctx.stroke();

    // 4. Drawing the Text
    ctx.fillStyle = "#f8fafc";
    ctx.font = `${14 / aspect_size}px monospace`;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";

    lines.forEach((line, i) => {
        // Adding a small bullet point for each line
        ctx.fillStyle = "#00f2ff";
        ctx.fillText(">", tooltipX + padding, tooltipY + (padding * 1.5) + i * lineHeight);

        ctx.fillStyle = "#f8fafc";
        ctx.fillText(line, tooltipX + padding + 15, tooltipY + (padding * 1.5) + i * lineHeight);
    });

    ctx.restore();
}

// function splitTextThreeLines(text) {
//     const words = text.split(" ");
//     const third = Math.ceil(words.length / 3);
//
//     const line1 = words.slice(0, third).join(" ");
//     const line2 = words.slice(third, third * 2).join(" ");
//     const line3 = words.slice(third * 2).join(" ");
//
//     return [line1, line2, line3];
// }

function drawImages(vWidth, vHeight, aspect_size) {
    const centerX = vWidth / 2;
    const centerY = vHeight * 0.5;
    const displayWidth = vWidth / 2.6;
    const displayHeight = displayWidth * (4 / 5);
    const spacing = vWidth * 0.07;

    currentImages.forEach((img, index) => {
        const x = (index === 0) ? centerX - spacing - displayWidth : centerX + spacing;
        const y = centerY - (displayHeight / 2);


        // 1) Draw "Analysis" Brackets (unchanged)
        // ctx.strokeStyle = "#00f2ff";
        // ctx.lineWidth = 2 / aspect_size;


        // 2) Draw image (first)
        if (img.complete) {
            ctx.drawImage(img, x, y, displayWidth, displayHeight);
            ctx.strokeStyle = "rgba(255,255,255,0.2)";
            ctx.strokeRect(x, y, displayWidth, displayHeight);
        } else {
            ctx.fillStyle = "#1e293b";
            ctx.fillRect(x, y, displayWidth, displayHeight);
        }

        // 3) Description box + text (second)
        const font_size_scaled = Math.round(12 / aspect_size);
        const framePaddingX = 20 / aspect_size;
        const framePaddingY = 15 / aspect_size;

        // set font BEFORE measuring/wrapping
        ctx.font = `${font_size_scaled}px monospace`;

        // wrap width: subtract LEFT+RIGHT padding (use X padding, not Y)
        const maxTextWidth = displayWidth - (2 * framePaddingX);
        const lines = wrapTextToLines(img.description, ctx, maxTextWidth);

        const lineHeightPx = Math.round(font_size_scaled * 1.3);

        // default = 2 lines tall (even if only 1 line)
        const defaultLines = 2;
        const textLinesForHeight = Math.max(lines.length, defaultLines);

        const textBlockHeight = textLinesForHeight * lineHeightPx;
        const descHeight = textBlockHeight + (2 * framePaddingY);

        // ALIGNMENT RULE:
        // desc box vertical center == image bottom edge
        const imgBottom = y + displayHeight;
        const descY = imgBottom - (descHeight / 2);

        // make it slightly wider than image (your earlier plan) OR keep same width:
        const descWidth = displayWidth; // wider than image
        const descX = x;

        const wholeHeight = displayHeight + (descHeight / 2)
        img.hitbox = {x, y, w: displayWidth, h: wholeHeight};

        // draw box
        ctx.lineWidth = 2 / aspect_size;
        ctx.shadowBlur = 0;
        ctx.shadowColor = "#00f2ff";

        ctx.fillStyle = "rgba(15,23,42,1)";
        ctx.strokeStyle = "#00f2ff";
        drawCutCornerRect(descX, descY, descWidth, descHeight, 10 / aspect_size, true, true);

        if (mouseIsInside(img.hitbox.x, img.hitbox.y, img.hitbox.w, img.hitbox.h)) {
            ctx.save()
            ctx.strokeStyle = "#00f2ff";
            ctx.lineWidth = 2 / aspect_size

            ctx.beginPath();

            ctx.moveTo(x - (8 / aspect_size), y - (8 / aspect_size));
            ctx.lineTo(x + displayWidth + (8 / aspect_size), y - (8 / aspect_size));
            ctx.lineTo(x + displayWidth + (8 / aspect_size), descY + descHeight + (8 / aspect_size));
            ctx.lineTo(x - (8 / aspect_size), descY + descHeight + (8 / aspect_size));
            ctx.lineTo(x - (8 / aspect_size), y - (8 / aspect_size));
            ctx.stroke();
            ctx.restore()

        } else {
            ctx.save()
            const bLen = 15 / aspect_size;
            ctx.strokeStyle = "#00f2ff";
            ctx.lineWidth = 2 / aspect_size

            // Top Left
            ctx.beginPath();
            ctx.moveTo(x - (8 / aspect_size), y - (8 / aspect_size) + bLen);
            ctx.lineTo(x - (8 / aspect_size), y - (8 / aspect_size));
            ctx.lineTo(x - (8 / aspect_size) + bLen, y - (8 / aspect_size));
            ctx.stroke();

            // Top Right
            ctx.beginPath();
            ctx.moveTo(x + displayWidth + (8 / aspect_size) - bLen, y - (8 / aspect_size));
            ctx.lineTo(x + displayWidth + (8 / aspect_size), y - (8 / aspect_size));
            ctx.lineTo(x + displayWidth + (8 / aspect_size), y - (8 / aspect_size) + bLen);
            ctx.stroke();

            // Bottom Left
            ctx.beginPath();
            ctx.moveTo(x - (8 / aspect_size), descY + descHeight + (8 / aspect_size) - bLen);
            ctx.lineTo(x - (8 / aspect_size), descY + descHeight + (8 / aspect_size));
            ctx.lineTo(x - (8 / aspect_size) + bLen, descY + descHeight + (8 / aspect_size));
            ctx.stroke();

            // Bottom Right
            ctx.beginPath();
            ctx.moveTo(x + displayWidth + (8 / aspect_size) - bLen, descY + descHeight + (8 / aspect_size));
            ctx.lineTo(x + displayWidth + (8 / aspect_size), descY + descHeight + (8 / aspect_size));
            ctx.lineTo(x + displayWidth + (8 / aspect_size), descY + descHeight + (8 / aspect_size) - bLen);
            ctx.stroke();

            ctx.restore()
        }

        ctx.shadowBlur = 0;

        // draw centered text
        ctx.save();
        ctx.fillStyle = "#00f2ff";
        ctx.font = `${font_size_scaled}px monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const t_x_center = descX + (descWidth / 2);
        const t_y_center = descY + (descHeight / 2);

        // center *actual* lines within the box (even if defaultHeight is 2 lines)
        const actualTextHeight = lines.length * lineHeightPx;
        let text_y = t_y_center - (actualTextHeight / 2) + (lineHeightPx / 2);

        for (let i = 0; i < lines.length; i++) {
            ctx.fillText(lines[i], t_x_center, text_y + (i * lineHeightPx));
        }

        ctx.restore();
    });
}

function drawPasswords(vWidth, vHeight, aspect_size) {
    ctx.save();
    const scaleFont = Math.round(PASSWORDS_FONT_SIZE / aspect_size);
    ctx.font = `bold ${scaleFont}px monospace`; // Cyber standard
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";

    passwordChoices.forEach((pw) => {
        ctx.save()

        ctx.fillStyle = "#0f172a";
        ctx.strokeStyle = "#334155";
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.roundRect(pw.x, pw.y, pw.width, pw.height, 4 / aspect_size);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#00f2ff";

        if (mouseIsInside(pw.x, pw.y, pw.width, pw.height)) {
            ctx.save();
            ctx.strokeStyle = "#00f2ff";
            ctx.lineWidth = 4 / aspect_size;
            ctx.shadowBlur = 10 / aspect_size;
            ctx.shadowColor = "#00f2ff";
            ctx.strokeRect(pw.x, pw.y, pw.width, pw.height);
            ctx.restore();
        } else {
            ctx.fillRect(pw.x, pw.y, 4 / aspect_size, pw.height);
        }


        let totalTextWidth = ctx.measureText(pw.text).width;
        let startX = pw.x + (pw.width / 2) - (totalTextWidth / 2);

        ctx.shadowBlur = 8 / aspect_size;
        for (let char of pw.text) {
            // const isSpecial = SYMBOLS.includes(char) || (char >= '0' && char <= '9');
            // ctx.fillStyle = isSpecial ? "#22c55e" : "#f8fafc";
            // ctx.shadowColor = isSpecial ? "#22c55e" : "transparent";

            ctx.fillStyle = "#f8fafc";
            ctx.fillText(char, startX, pw.y + pw.height / 2);
            startX += ctx.measureText(char).width;
        }

        if (mouseData) {
            const {mx, my} = mouseData
            if (isInside(mx, my, pw.x, pw.y, pw.width, pw.height)) {

            }
        }
        ctx.restore()
    });
    ctx.restore();
}

function gameLoop() {
    if (!gameRunning) {
        mainRafId = null
        return
    }

    update()
    draw()

    mainRafId = requestAnimationFrame(gameLoop)
}

function startMainLoop() {
    if (mainRafId !== null) return; // already running
    mainRafId = requestAnimationFrame(gameLoop);
}

function stopMainLoop() {
    if (mainRafId !== null) {
        cancelAnimationFrame(mainRafId);
        mainRafId = null;
    }
}

function handlePasswordChoice(text) {

    if (reallySafePasswords.includes(text)) {
        score += 2
    } else if (safePasswords.includes(text)) {
        score += 1
    } else {
        score -= 1
    }
    startNewRound()
}

function wrapTextToLines(text, context, maxWidth) {
    const words = text.split(' ')
    let line = ''
    let lines = []

    // 1. Break text into lines
    for (let n = 0; n < words.length; n++) {
        let testLine = line + words[n] + ' '
        let metrics = context.measureText(testLine)
        let testWidth = metrics.width
        if (testWidth > maxWidth && n > 0) {
            lines.push(line)
            line = words[n] + ' '
        } else {
            line = testLine
        }
    }
    lines.push(line)
    return lines;
}

function wrapText(context, text, x, y, maxWidth, lineHeight) {
    let lines = wrapTextToLines(text, context, maxWidth);

    // 2. Draw each line
    // We adjust the Y start point so the group of lines is vertically centered
    let totalHeight = lines.length * lineHeight
    let startY = y - (totalHeight / 2) + (lineHeight / 2)

    for (let k = 0; k < lines.length; k++) {
        context.fillText(lines[k], x, startY + (k * lineHeight))
    }
}

function drawCutCornerRect(x, y, w, h, cut, stroke = true, fill = true) {
    ctx.beginPath();
    ctx.moveTo(x + cut, y);
    ctx.lineTo(x + w - cut, y);
    ctx.lineTo(x + w, y + cut);
    ctx.lineTo(x + w, y + h - cut);
    ctx.lineTo(x + w - cut, y + h);
    ctx.lineTo(x + cut, y + h);
    ctx.lineTo(x, y + h - cut);
    ctx.lineTo(x, y + cut);
    ctx.closePath();

    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
}

function drawBonusRound(vWidth, vHeight, aspect_size) {
    const q = bonusQuestions[bonusIndex];

    // 1. Background (Dark Gradient for consistency)
    const bgGrad = ctx.createRadialGradient(vWidth / 2, vHeight / 2, 10, vWidth / 2, vHeight / 2, vWidth);
    bgGrad.addColorStop(0, "#0f172a");
    bgGrad.addColorStop(1, "#020617");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, vWidth, vHeight);

    // 2. Header: "DECRYPTION_PHASE"
    const header_y = 50 / aspect_size;
    const headerFont = Math.round(BONUS_ROUND_HEADER_TEXT_FONT_SIZE / aspect_size);

    ctx.fillStyle = "#00f2ff"; // Cyber Cyan
    ctx.textAlign = "center";
    ctx.font = `bold ${headerFont}px monospace`;
    ctx.fillText(`DECRYPTION_PHASE // [${bonusIndex + 1}/5]`, vWidth / 2, header_y);

    // Subtle line under header
    ctx.strokeStyle = "rgba(0, 242, 255, 0.3)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(vWidth * 0.2, header_y + (15 / aspect_size));
    ctx.lineTo(vWidth * 0.8, header_y + (15 / aspect_size));
    ctx.stroke();

    // 3. The Question Panel
    const cardWidth = vWidth * 0.85;
    const cardHeight = 130 / aspect_size;
    const cardX = (vWidth - cardWidth) / 2;
    const cardY = 80 / aspect_size;

    // Panel Background
    ctx.fillStyle = "rgba(30, 41, 59, 0.6)"; // Semi-transparent dark blue
    ctx.strokeStyle = "#00f2ff";
    ctx.lineWidth = 2;
    drawCutCornerRect(cardX, cardY, cardWidth, cardHeight, 15 / aspect_size, true, true);

    // "SYSTEM_QUERY" Label
    ctx.fillStyle = "#94a3b8";
    ctx.font = `bold ${12 / aspect_size}px monospace`;
    ctx.textAlign = "left";
    ctx.fillText("SYSTEM_QUERY:", cardX + (10 / aspect_size), cardY + (20 / aspect_size));

    // The Actual Question Text
    const bodyFont = Math.round(BONUS_ROUND_BODY_TEXT_FONT_SIZE / aspect_size);
    ctx.fillStyle = "#ffffff";
    ctx.font = `${bodyFont}px monospace`; // Monospace for terminal look
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const padding = 40 / aspect_size;
    const lineHeight = bodyFont * 1.3;

    wrapText(
        ctx,
        q.question,
        vWidth / 2,
        cardY + (cardHeight / 2) + (10 / aspect_size), // Slight offset due to "SYSTEM_QUERY" label
        cardWidth - padding,
        lineHeight
    );

    // 4. The Options (Buttons)
    const optionWidth = vWidth * 0.7;
    const optionHeight = 55 / aspect_size;
    const startY = cardY + cardHeight + (30 / aspect_size);
    const optionGap = 18 / aspect_size;
    const x = (vWidth - optionWidth) / 2;

    q.options.forEach((opt, i) => {
        ctx.save()
        const y = startY + i * (optionHeight + optionGap);
        const isSelected = selectedOption === i;

        // Button Styles
        ctx.lineWidth = 2 / aspect_size;
        if (isSelected) {
            // Selected: Green Glow
            ctx.shadowBlur = 15 / aspect_size;
            if(i === q.correctIndex){
                ctx.shadowColor = "#21c02c";
                ctx.fillStyle = "rgb(20,104,5)"
                ctx.strokeStyle = "#21c02c";
            }
            else {
                ctx.shadowColor = "#c02121";
                ctx.fillStyle = "rgb(104,5,5)"
                ctx.strokeStyle = "#c02121";
            }


        } else {

            if(mouseIsInside(x,y,optionWidth,optionHeight)){
                ctx.shadowBlur = 5;
                ctx.fillStyle = "rgb(5,92,104)"
                ctx.strokeStyle = "#475569"; // Slate border
            }
            else {
                ctx.shadowBlur = 0;
                ctx.fillStyle = "rgba(15, 23, 42, 0.8)";
                ctx.strokeStyle = "#475569"; // Slate border
            }

        }

        drawCutCornerRect(x, y, optionWidth, optionHeight, 10 / aspect_size, true, true);
        ctx.shadowBlur = 0;

        ctx.fillStyle = isSelected ? "#ffffff" : "#cbd5f5";
        ctx.font = `bold ${bodyFont * 0.9}px monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const prefix = String.fromCharCode(65 + i); // 65 is 'A'
        ctx.fillText(`[${prefix}] ${opt}`, vWidth / 2, y + optionHeight / 2);
        ctx.restore()
    });

    // 5. Score Readout (Bottom HUD)
    const scoreFont = Math.round(BONUS_ROUND_SCORE_TEXT_FONT_SIZE / aspect_size);
    ctx.fillStyle = "#00f2ff";
    ctx.textAlign = "center";
    ctx.font = `bold ${scoreFont}px monospace`;
    ctx.fillText(`DATA_RECOVERED: ${bonusScore}`, vWidth / 2, vHeight - (20 / aspect_size));
}

function handleImageChoice(img) {
    if (safeImages.includes(img)) {
        score += 2
    } else {
        score -= 1
    }
    startNewRound()
}

function imagesReady() {
    return safeImages.length > 0 && unsafeImages.length > 0;
}

function startNewRound() {
    const canUseImages = imagesReady();

    if (canUseImages && Math.random() > 0.5) {
        currentRoundMode = IMAGES_MODE
        spawnTwoImages()
    } else {
        currentRoundMode = PASSWORDS_MODE
        spawnTwoPasswords()
    }

    timeLeft = roundTime
    lastTime = Date.now()
}

function mouseIsInside(x, y, w, h) {
    if (mouseData) {
        const {mx, my} = mouseData
        return isInside(mx, my, x, y, w, h)
    }

    return false
}

function mouseIsInsideCircle(x, y, radius) {
    if (mouseData) {
        const {mx, my} = mouseData
        const dx = mx - x
        const dy = my - y
        return Math.sqrt(dx * dx + dy * dy) <= radius
    }
    return false
}

function isInside(mx, my, x, y, w, h) {
    return mx >= x && mx <= x + w && my >= y && my <= y + h
}

function handleBonusAnswer(index) {
    if (bonusLocked) return
    bonusLocked = true

    selectedOption = index

    const q = bonusQuestions[bonusIndex]
    if (index === q.correctIndex) bonusScore++

    if (bonusTimeoutId !== null) clearTimeout(bonusTimeoutId)

    bonusTimeoutId = setTimeout(() => {
        selectedOption = null;
        bonusIndex++;

        bonusLocked = false

        if (bonusIndex >= 5) {
            endBonusRound()
        }
    }, 600);
}


function endBonusRound() {
    bonusActive = false

    if (bonusScore >= 3 && bonusScore < 5) {
        score += bonusScore;
        resetMainGame()
    } else if (bonusScore === 5) {
        score += bonusScore;
        startMiniGame()
    }
    // if (bonusScore >=1) {
    //     score += bonusScore;
    //     startMiniGame()
    // }
    else {
        gamePhase = FINAL_GAME_OVER_PHASE
    }
}

function startBonusRound() {
    shuffleArray(bonusQuestions)
    bonusIndex = 0
    bonusScore = 0
    selectedOption = null
    bonusActive = true

    gamePhase = BONUS_ROUND_PHASE
    timeLeft = Infinity
}

function setupMobileControls(game) {

    if (document.getElementById('mobile-controls')) return;

    const overlay = document.createElement('div');
    overlay.id = 'mobile-controls';
    overlay.innerHTML = `
        <div class="d-pad">
            <div class="cyber-btn btn-arrow" data-key="left">←</div>
            <div class="cyber-btn btn-arrow" data-key="right">→</div>
        </div>
        <div class="action-pad">
            <div class="cyber-btn btn-jump" data-key="up">▲</div>
        </div>
    `;


    document.body.appendChild(overlay);

    const setKey = (key, state) => {
        if (game && game.key) {
            game.key[key] = state;
        }
    };

    const buttons = overlay.querySelectorAll('.cyber-btn');

    buttons.forEach(btn => {
        const key = btn.getAttribute('data-key');


        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            btn.classList.add('pressed');
            setKey(key, true);
        }, {passive: false});

        // Touch End
        btn.addEventListener('touchend', (e) => {
            e.preventDefault();
            btn.classList.remove('pressed');
            setKey(key, false);
        });

        btn.addEventListener('mousedown', () => {
            btn.classList.add('pressed');
            setKey(key, true);
        });

        btn.addEventListener('mouseup', () => {
            btn.classList.remove('pressed');
            setKey(key, false);
        });
        btn.addEventListener('mouseleave', () => {
            btn.classList.remove('pressed');
            setKey(key, false);
        });
    });
}

function initTouchControlsIfMobile(game) {

    const isTouchDevice = (
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        navigator.msMaxTouchPoints > 0
    );

    const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isTouchDevice || isMobileUA) {
        setupMobileControls(game);
    }
}

/**
 * TODO - Execution Logic Here
 *
 * Од оваа линија надолу повикување и извршување на функции
 * */

canvas2D.style.display = 'none';

window.addEventListener("resize", resizeCanvas)
resizeCanvas()

startBtn.addEventListener("click", async () => {

    startBtn.disabled = true;
    startBtn.textContent = "Loading...";

    try {
        await loadGameImages();
    } catch (err) {
        console.error(err);
        startBtn.textContent = "Missing images!!!";
        return;
    }

    startScreen.style.display = 'none'
    document.getElementById('game-wrapper').style.display = 'flex'
    canvas.style.display = 'block'

    startBtn.textContent = "Start Game";
    startBtn.disabled = false;

    startGame()
})


canvas.addEventListener("click", (e) => {

    const rect = canvas.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top

    const dx = mx - info.x
    const dy = my - info.y

    const wasHovering = info.open;
    if (Math.sqrt(dx * dx + dy * dy) <= info.radius) {
        info.open = !info.open
    }

    if (wasHovering && !info.open) {
        lastTime = Date.now();
    }
    // With this we will not register clicks to score when the info panel is open
    if (wasHovering) return;

    const vWidth = canvas.width / dpr
    const vHeight = canvas.height / dpr

    const aspect_size = 900 / vWidth

    const cardHeight = 130 / aspect_size;
    const cardY = 80 / aspect_size;

    const optionWidth = vWidth * 0.7;
    const optionHeight = 55 / aspect_size;
    const startY = cardY + cardHeight + (30 / aspect_size);
    const optionGap = 18 / aspect_size;

    const optionX = (vWidth - optionWidth) / 2

    if (gamePhase === FINAL_GAME_OVER_PHASE && restartButton) {
        if (
            isInside(
                mx,
                my,
                restartButton.x,
                restartButton.y,
                restartButton.w,
                restartButton.h
            )
        ) {
            score = 0
            resetMainGame()

            // startMiniGame()
        }
    }

    if (gamePhase === BONUS_ROUND_PHASE) {
        bonusQuestions[bonusIndex].options.forEach((_, i) => {
            const optionY = startY + i * (optionHeight + optionGap);

            if (
                mx >= optionX &&
                mx <= optionX + optionWidth &&
                my >= optionY &&
                my <= optionY + optionHeight
            ) {
                handleBonusAnswer(i)
            }
        })
    }


    if (gamePhase === RETRY_PROMPT_PHASE) {

        const buttonW = vWidth * 0.35;
        const buttonH = Math.round(60 / aspect_size);
        const button_spacing = Math.round(20 / aspect_size);

        if (isInside(mx, my, vWidth / 2 - buttonW - button_spacing, vHeight * 0.56, buttonW, buttonH)) {
            //to do
            console.log('try again clicked')
            startBonusRound()
            return
        }

        if (isInside(mx, my, vWidth / 2 + button_spacing, vHeight * 0.56, buttonW, buttonH)) {
            // gamePhase = FINAL_GAME_OVER_PHASE
            score = 0

            resetMainGame()
            return
        }
    }

    if (currentRoundMode === PASSWORDS_MODE) {
        passwordChoices.forEach(pw => {
            if (isInside(mx, my, pw.x, pw.y, pw.width, pw.height)) {
                handlePasswordChoice(pw.text)
            }
        })
    } else if (currentRoundMode === IMAGES_MODE) {
        currentImages.forEach(img => {
            if (img.hitbox && isInside(mx, my, img.hitbox.x, img.hitbox.y, img.hitbox.w, img.hitbox.h)) {
                handleImageChoice(img)
            }
        })
    }
})

canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    mouseData = {
        mx,
        my
    }
})

canvas.addEventListener("mouseleave", () => {
    mouseData = null
});

