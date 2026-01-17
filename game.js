/**
 * Constant Definitions Here
 *
 * Од оваа линија надолу дефинирање на константи
 * */


import questions from "./data/questions.js"
import {WEAK_PASSWORDS} from "./data/weak_passwords.js"

import {Game2D} from "./2d_game.js"

const startScreen = document.getElementById("start-screen")
const startBtn = document.getElementById("start-btn")
const canvas = document.getElementById("gameCanvas")
const ctx = canvas.getContext("2d")

const dpr = window.devicePixelRatio || 1

const SCORE_FONT_SIZE = 18
const PASSWORDS_FONT_SIZE = 18
const TOTAL_TIMER_FONT_SIZE = 18
const TIMER_RADIUS_SIZE = 25
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
const MINI_GAME_OVER_PHASE = "finalGameOver"

const SYMBOLS = "!@#$%&*"

const PASSWORDS_MODE = "passwords"
const IMAGES_MODE = "images"

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

let gameDuration = 3
let timeElapsed = 0
let gameEnded = false



let gamePhase = PLAYING_PHASE // playing | success | retryPrompt | bonusRound | finalGameOver

let phaseTimer = 0

let bonusQuestionsAnswered = 0
let bonusIndex = 0
let bonusScore = 0
let selectedOption = null
let bonusActive = true
let minScore = 10

const bonusQuestions = questions

function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]]
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
- Does NOT include: Name, Birth year, Username

TIPS:
- Numbers and special characters are in the color 
  Green so that they can be noticed easily`
}

// Arrays to hold the successfully loaded image objects
const safeImages = []
const unsafeImages = []

// How many images to try loading (e.g., checks good1_final up to good20_final)
// You can increase this number as you add more images to your folder.
const MAX_IMAGES_TO_CHECK_GOOD = 7
const MAX_IMAGES_TO_CHECK_BAD = 8


const {game,canvas: canvas2D,ctx:ctx2D,Loop} = Game2D()

canvas2D.style.display = 'none';

/**
 * TODO - Function Definition Logic Here
 *
 * Од оваа линија надолу дефинирање на функции
 * */

//Function that loads images and stores them in the arrays as 'Image' objects
function loadGameImages() {

    // Cycle for loading and saving bad images to array
    for (let i = 1; i <= MAX_IMAGES_TO_CHECK_BAD; i++) {
        // --- Try to load UNSAFE images ---
        const uImg = new Image()
        uImg.src = `images/unsafe/bad${i}_final.jpg`

        uImg.onload = () => {
            unsafeImages.push(uImg)
        }
    }

    // Cycle for loading and saving good images to array
    for (let i = 1; i <= MAX_IMAGES_TO_CHECK_GOOD; i++) {

        // --- Try to load SAFE images ---
        const sImg = new Image()
        // Construct the path: images/safe/good[i]_final.jpg
        sImg.src = `images/safe/good${i}_final.jpg`

        // Only add to the game array if the file actually exists and loads
        sImg.onload = () => {
            safeImages.push(sImg)
        }
        // Optional: If you use .png instead of .jpg for some, 
        // you would need a more complex loader or ensure all are converted to .jpg
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

    // 2. Calculate size based on Height
    let heightByHeight = window.innerHeight * (maxHeightVH / 100)
    let widthByHeight = heightByHeight * aspectRatio

    // 3. Pick the smaller one so it fits both ways
    let displayWidth, displayHeight
    if (widthByHeight <= widthByWidth) {
        displayWidth = widthByHeight
        displayHeight = heightByHeight
    } else {
        displayWidth = widthByWidth
        displayHeight = heightByWidth
    }

    // Set internal resolution (High-DPI)
    canvas.width = displayWidth * dpr
    canvas.height = displayHeight * dpr

    // Set CSS display size (Visual size)
    canvas.style.width = displayWidth + "px"
    canvas.style.height = displayHeight + "px"


    // Reset and scale
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

    // Adjust top area and UI positions
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

function startGame() {
    score = 0
    gameRunning = true
    gameEnded = false
    timeElapsed = 0
    startNewRound()
    gameLoop()
}

function resizeMiniGameCanvas(canvas, ctx, game, displayWidth, displayHeight, dpr) {

    // internal resolution (Hi-DPI safe)
    canvas.width  = displayWidth * dpr
    canvas.height = displayHeight * dpr

    // visual size
    canvas.style.width  = displayWidth + "px"
    canvas.style.height = displayHeight + "px"

    // viewport for Clarity camera
    game.set_viewport(
        canvas.width / dpr,
        canvas.height / dpr
    )

    // reset & scale context
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.scale(dpr, dpr)

    // pixel-perfect
    ctx.imageSmoothingEnabled = false
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
    const boxWidth = vWidth / 5
    const boxHeight = vHeight / 10
    const spacing = vWidth * 0.2 // 20% distance from center
    return {boxWidth, boxHeight, spacing}
}

/**
 * Puts two passwords to be later drawn,NOTE: vWidth and vHeight are used AND NOT canvas.width and canvas.height because
 * of screens having higher DPI so canvas needs to be scaled
 */
function spawnTwoPasswords() {
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
    currentImages = []

    const safeImg = safeImages[Math.floor(Math.random() * safeImages.length)]
    const unsafeImg = unsafeImages[Math.floor(Math.random() * unsafeImages.length)]

    currentImages.push(safeImg, unsafeImg)


    currentImages.sort(() => Math.random() - 0.5)
}

function roundRect(x, y, w, h, r, fill, stroke) {
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.quadraticCurveTo(x + w, y, x + w, y + r)
    ctx.lineTo(x + w, y + h - r)
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
    ctx.lineTo(x + r, y + h)
    ctx.quadraticCurveTo(x, y + h, x, y + h - r)
    ctx.lineTo(x, y + r)
    ctx.quadraticCurveTo(x, y, x + r, y)
    ctx.closePath()

    if (fill) ctx.fill()
    if (stroke) ctx.stroke()
}

function update() {
    const now = Date.now()
    const delta = (now - lastTime) / 1000
    lastTime = now


    if (info.hover) return;

    if (gamePhase === BONUS_ROUND_PHASE) {
        // minScore += 10
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
                minScore += 10
            } else {
                gamePhase = RETRY_PROMPT_PHASE
            }
        }
    }

    if (gamePhase === SUCCESS_PHASE) {
        phaseTimer -= delta

        if (phaseTimer <= 0) {
            resetMainGame()
        }
    }
}

function resetMainGame() {
    timeElapsed = 0
    gameRunning = true
    gamePhase = PLAYING_PHASE
    startNewRound()
    lastTime = Date.now()
    gameLoop()
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
    // These are your "Game World" dimensions
    const vWidth = canvas.width / dpr
    const vHeight = canvas.height / dpr

    const aspect_size = (900 / vWidth)

    ctx.clearRect(0, 0, vWidth, vHeight)

    // if (gameEnded) {
    //     drawGameOver(vWidth, vHeight)
    //     return
    // }

    console.log(gamePhase)

    if (gamePhase === SUCCESS_PHASE) {
        drawSuccessScreen(vWidth, vHeight)
        return
    }

    if (gamePhase === RETRY_PROMPT_PHASE) {
        drawRetryPrompt(vWidth, vHeight)
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

    // Pass the virtual sizes down to the helpers
    drawInstructions(vWidth, vHeight, aspect_size)
    drawScore(vWidth, aspect_size)
    drawTimer(vWidth, vHeight, aspect_size)

    if (currentRoundMode === PASSWORDS_MODE) {
        drawPasswords(vWidth, vHeight, aspect_size)
    } else if (currentRoundMode === IMAGES_MODE) {
        drawImages(vWidth, vHeight, aspect_size)
    }

    drawTotalTimer(vWidth, vHeight, aspect_size)

    drawInfoButton(vWidth, aspect_size)
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

    ctx.fillStyle = "#020617"
    ctx.fillRect(0, 0, vWidth, vHeight)

    ctx.textAlign = "center"
    ctx.textBaseline = "middle"


    ctx.fillStyle = "#facc15" // warning / chance color
    ctx.font = `bold ${vWidth * 0.055}px Arial`
    ctx.fillText(
        "One Last Chance",
        vWidth / 2,
        vHeight * 0.32
    )


    ctx.strokeStyle = "#1e293b"
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(vWidth * 0.35, vHeight * 0.38)
    ctx.lineTo(vWidth * 0.65, vHeight * 0.38)
    ctx.stroke()


    ctx.fillStyle = "#cbd5f5"
    ctx.font = `${vWidth * 0.03}px Arial`
    ctx.fillText(
        "You can continue the game once more.",
        vWidth / 2,
        vHeight * 0.44
    )

    const buttonW = vWidth / 6
    const buttonH = vHeight / 8
    const button_spacing = vWidth / 10

    drawButton(
        "Try Again", vWidth / 2 - (button_spacing + buttonW), vHeight * 0.56, buttonW, buttonH, true, aspect_size
    )

    drawButton(
        "Quit", vWidth / 2 + button_spacing, vHeight * 0.56, buttonW, buttonH, false, aspect_size
    )
}

function drawButton(text, x, y, w, h, primary, aspect_size) {
    const radius = 12 // Adjust this for more or less roundness

    ctx.save()

    // 1. Set Colors based on "Primary" status
    ctx.fillStyle = primary ? "#22c55e" : "#334155"
    ctx.strokeStyle = primary ? "#86efac" : "#64748b"
    ctx.lineWidth = 2

    // 2. Draw the Rounded Rectangle Fill
    ctx.beginPath()
    ctx.roundRect(x, y, w, h, radius)
    ctx.fill()

    // 3. Draw the Rounded Rectangle Border
    ctx.stroke()

    // 4. Draw the Text
    ctx.fillStyle = "#f8fafc"
    // Set a reasonable font size based on button height
    const fontSize = Math.round(RETRY_BUTTON_TEXT_FONT_SIZE / aspect_size)
    ctx.font = `bold ${fontSize}px Arial`
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"

    ctx.fillText(text, x + w / 2, y + h / 2)

    ctx.restore()
}

/**
 * Function that draws the Game Over Screen, NOTE: vWidth and vHeight are used AND NOT canvas.width and canvas.height because
 * of screens having higher DPI so canvas needs to be scaled
 * */
function drawGameOver(vWidth, vHeight, aspect_size) {
    ctx.fillStyle = "#000000"
    ctx.fillRect(0, 0, vWidth, vHeight)

    ctx.fillStyle = "#ffffff"
    const scaleFont = Math.round(GAME_OVER_TEXT_FONT_SIZE / aspect_size)
    ctx.font = `bold ${scaleFont}px Arial`
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(`Game Over! Score: ${score}`, vWidth / 2, vHeight / 2)

    //  RESTART BUTTON
    const btnW = vWidth / 4
    const btnH = 50
    const btnX = (vWidth - btnW) / 2
    const btnY = vHeight / 2 + 20

    ctx.fillStyle = "#22c55e"
    roundRect(btnX, btnY, btnW, btnH, 12, true, false)

    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 20px Arial"
    ctx.fillText("Restart Game", vWidth / 2, btnY + btnH / 2)

    window.restartButton = { x: btnX, y: btnY, w: btnW, h: btnH }
}

/** Functions that draw the instruction text, NOTE: vWidth and vHeight are used AND NOT canvas.width and canvas.height because
 * of screens having higher DPI so canvas needs to be scaled
 * */
function drawInstructions(vWidth, vHeight, aspect_size) {

    ctx.fillStyle = "#f6f3f3"
    const scaleFont = Math.round(INSTRUCTION_TEXT_FONT_SIZE / aspect_size)
    ctx.font = `bold ${scaleFont}px Arial`
    ctx.textAlign = "center"
    // Positioned relative to top (15% down)
    ctx.fillText("Click the SAFER option", vWidth / 2, vHeight * 0.15)
}

/** Function that draws the Score */
function drawScore(vWidth, aspect_size) {

    let font_size = Math.round(SCORE_FONT_SIZE / aspect_size)
    ctx.fillStyle = "#f6f3f3"
    ctx.font = `bold ${font_size}px Arial`
    ctx.textAlign = "left"

    const text_x = 20 / aspect_size
    const text_y = 30 / aspect_size
    ctx.fillText("Score: " + score, text_x, text_y)
}

/** Function that draws the circular timer,NOTE: `vWidth` and `vHeight` are used AND NOT `canvas.width` and `canvas.height` because
 * of screens having higher DPI so canvas needs to be scaled
 * */
function drawTimer(vWidth, vHeight, aspect_size) {

    ctx.save()
    const centerX = vWidth / 2
    const centerY = vHeight * 0.35 // Moved up slightly from your fixed 280
    const radius = Math.round(TIMER_RADIUS_SIZE / aspect_size)

    ctx.font = `bold ${radius * 0.8}px "Courier New", Courier, monospace`
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
    ctx.fillStyle = "#fb0000"
    ctx.fill()

    ctx.lineWidth = 2
    ctx.strokeStyle = "#ffffff"
    ctx.stroke()

    ctx.fillStyle = "#ffffff"

    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(Math.ceil(timeLeft) + "", centerX, centerY)
    ctx.restore()
}

/** Function that Draws the info button and also the info dialog,NOTE: vWidth and vHeight are used AND NOT canvas.width and canvas.height because
 * of screens having higher DPI so canvas needs to be scaled
 * */
function drawInfoButton(vWidth, aspect_size) {
    if (!info.visible) return


    ctx.shadowColor = "rgba(0,0,0,0.5)"
    ctx.shadowBlur = 8

    const gradient = ctx.createRadialGradient(info.x, info.y, info.radius / 2, info.x, info.y, info.radius)
    gradient.addColorStop(0, "#334155")
    gradient.addColorStop(1, "#0f172a")

    ctx.beginPath()
    ctx.arc(info.x, info.y, info.radius, 0, Math.PI * 2)
    ctx.fillStyle = gradient
    ctx.fill()
    ctx.shadowBlur = 0 // Turn off shadow for text

    ctx.fillStyle = "white"
    ctx.font = `bold ${info.radius}px Arial`
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText("?", info.x, info.y)

    if (info.hover) {
        ctx.save()
        ctx.arc(info.x, info.y, info.radius, 0, Math.PI * 2)
        ctx.strokeStyle = "#00f2ff"
        ctx.lineWidth  = 1
        ctx.stroke()

        ctx.restore()
        const padding = 15 / aspect_size
        const tooltipWidth = 320 / aspect_size
        const lines = info.text.split("\n")
        const lineHeight = 13 / aspect_size
        const tooltipHeight = lines.length * lineHeight + padding * 2


        let tooltipX = info.x - tooltipWidth
        let tooltipY = info.y + (25 / aspect_size)

        ctx.fillStyle = "rgba(15, 23, 42, 0.95)"
        ctx.strokeStyle = "#475569"
        ctx.lineWidth = 2


        roundHelpScreenRect(ctx, tooltipX, tooltipY, tooltipWidth, tooltipHeight, 10, true, true)

        const scaleFont = info.radius * 3 / 4
        ctx.fillStyle = "#f8fafc"
        ctx.font = `${scaleFont}px Arial`
        ctx.textAlign = "left"

        lines.forEach((line, i) => {
            ctx.fillText(line, tooltipX + padding, tooltipY + padding + i * lineHeight)
        })
    }
}

function drawImages(vWidth, vHeight) {
    const centerX = vWidth / 2
    const centerY = vHeight * 0.5 // Vertical center of the canvas


    const displayWidth = vWidth / 3
    const displayHeight = displayWidth * (4 / 5) // Maintains 5:4 ratio

    // Spacing between the two images
    const spacing = vWidth * 0.1

    currentImages.forEach((img, index) => {
        // Calculate X position: one to the left, one to the right
        const x = (index === 0)
            ? centerX - spacing - displayWidth
            : centerX + spacing

        const y = centerY - (displayHeight / 2)

        img.hitbox = {x, y, w: displayWidth, h: displayHeight}

        // 1. Draw a "Cyber" Frame first
        ctx.strokeStyle = "#00f2ff"
        ctx.lineWidth = 3
        ctx.strokeRect(x - 5, y - 5, displayWidth + 10, displayHeight + 10)

        // 2. Draw the Image
        // drawImage(image, x, y, width, height) automatically scales
        // any image size down/up to fit your displayWidth/Height
        if (img.complete) {
            ctx.drawImage(img, x, y, displayWidth, displayHeight)
        } else {
            // Placeholder if image is still loading
            ctx.fillStyle = "#1e293b"
            ctx.fillRect(x, y, displayWidth, displayHeight)
        }

        // Save these coordinates for the click listener
        img.renderX = x
        img.renderY = y
        img.renderW = displayWidth
        img.renderH = displayHeight
    })
}

function drawPasswords(vWidth, vHeight, aspect_size) {
    ctx.save() // 1. Freeze current settings (Timer font, etc.)

    const scaleFont = Math.round(PASSWORDS_FONT_SIZE / aspect_size)

    ctx.font = `bold ${scaleFont}px Arial`
    ctx.textAlign = "left"
    ctx.textBaseline = "middle"

    passwordChoices.forEach((pw) => {

        ctx.shadowColor = "rgba(0, 0, 0, 0.35)"
        ctx.shadowBlur = 10
        ctx.shadowOffsetY = 4

        const gradient = ctx.createLinearGradient(
            pw.x,
            pw.y,
            pw.x,
            pw.y + pw.height
        )
        gradient.addColorStop(0, "#334155")
        gradient.addColorStop(1, "#1e293b")

        ctx.fillStyle = gradient
        roundRect(pw.x, pw.y, pw.width, pw.height, 12, true, false)

        // Draw the border
        ctx.strokeStyle = "#f8fafc"
        ctx.lineWidth = 2
        roundRect(pw.x, pw.y, pw.width, pw.height, 12, false, true)

        // Highlight Logic
        let totalTextWidth = ctx.measureText(pw.text).width
        let startX = pw.x + (pw.width / 2) - (totalTextWidth / 2)

        for (let char of pw.text) {
            ctx.fillStyle = (SYMBOLS.includes(char) || !isNaN(parseInt(char)))
                ? "#22c55e" : "#f8fafc"
            ctx.fillText(char, startX, pw.y + pw.height / 2)
            startX += ctx.measureText(char).width
        }

    })

    ctx.restore()
}

function gameLoop() {
    if (!gameRunning) return
    update()
    draw()
    requestAnimationFrame(gameLoop)
}

function handlePasswordChoice(text) {

    if (gamePhase === BONUS_ROUND_PHASE) {
        bonusQuestionsAnswered++

        if (reallySafePasswords.includes(text)) bonusScore += 1

        if (bonusQuestionsAnswered >= 5) {
            if (bonusScore >= 3) {
                resetMainGame()
            } else {
                gamePhase = FINAL_GAME_OVER_PHASE
            }
        } else {
            spawnTwoPasswords()
        }
        return
    }

    if (reallySafePasswords.includes(text)) {
        score += 2
    } else if (safePasswords.includes(text)) {
        score += 1
    } else {
        score -= 1
    }
    startNewRound()
}

function wrapText(context, text, x, y, maxWidth, lineHeight) {
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

    // 2. Draw each line
    // We adjust the Y start point so the group of lines is vertically centered
    let totalHeight = lines.length * lineHeight
    let startY = y - (totalHeight / 2) + (lineHeight / 2)

    for (let k = 0; k < lines.length; k++) {
        context.fillText(lines[k], x, startY + (k * lineHeight))
    }
}

function drawBonusRound(vWidth, vHeight, aspect_size) {

    const q = bonusQuestions[bonusIndex]
    // console.log('new question')


    const header_scaled_font_size = Math.round(BONUS_ROUND_HEADER_TEXT_FONT_SIZE / aspect_size)
    const body_scaled_font_size = Math.round(BONUS_ROUND_BODY_TEXT_FONT_SIZE / aspect_size)
    const score_scaled_font_size = Math.round(BONUS_ROUND_SCORE_TEXT_FONT_SIZE / aspect_size)

    const header_y = 60 / aspect_size
    ctx.clearRect(0, 0, vWidth, vHeight)

    ctx.fillStyle = "#e0f2fe"
    ctx.textAlign = "center"
    ctx.font = `bold ${header_scaled_font_size}px Arial`
    ctx.fillText(`Bonus Question ${bonusIndex + 1} / 5`, vWidth / 2, header_y)

    const cardWidth = vWidth * 0.8
    const cardHeight = 120 / aspect_size
    const cardX = (vWidth - cardWidth) / 2
    const cardY = 90 / aspect_size
    const cardBorderRadius = Math.round(16 / aspect_size)


    ctx.strokeStyle = "#7dd3fc"
    ctx.lineWidth = 3
    roundRect(cardX, cardY, cardWidth, cardHeight, cardBorderRadius, false, true)


    ctx.fillStyle = "#ffffff"
    ctx.font = `bold ${body_scaled_font_size}px Arial`
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"

    const padding = 40 / aspect_size
    const lineHeight = body_scaled_font_size * 1.2

    wrapText(
        ctx,
        q.question,
        vWidth / 2,
        cardY + (cardHeight / 2),
        cardWidth - padding,
        lineHeight
    )

    const optionWidth = vWidth * 0.65
    const optionHeight = 50 / aspect_size
    const startY = cardY + cardHeight + (40 / aspect_size)
    const optionBorderRadius = Math.round(12 / aspect_size)
    const optionGap = 16 / aspect_size

    const x = (vWidth - optionWidth) / 2

    q.options.forEach((opt, i) => {

        const y = startY + i * (optionHeight + optionGap)

        // Background
        ctx.fillStyle =
            selectedOption === i ? "#22c55e" : "#1e293b"
        roundRect(x, y, optionWidth, optionHeight, optionBorderRadius, true, false)

        // Border
        ctx.strokeStyle = "#64748b"
        ctx.lineWidth = 2
        roundRect(x, y, optionWidth, optionHeight, optionBorderRadius, false, true)

        // Option text
        ctx.fillStyle = "#f8fafc"
        ctx.font = `bold ${body_scaled_font_size * 0.8}px Arial`
        ctx.fillText(opt, vWidth / 2, y + optionHeight / 2)
    })

    /* ---------- SCORE ---------- */
    ctx.fillStyle = "#cbd5f5"
    ctx.font = `bold ${score_scaled_font_size}px Arial`
    ctx.fillText(`Score: ${bonusScore}`, vWidth / 2, vHeight - 30)
}

function handleImageChoice(img) {
    if (safeImages.includes(img)) {
        score += 2
    } else {
        score -= 1
    }
    startNewRound()
}

function startNewRound() {

    if (Math.random() < 0.5) {
        currentRoundMode = PASSWORDS_MODE
        spawnTwoPasswords()
    } else {
        currentRoundMode = IMAGES_MODE
        spawnTwoImages()
    }

    timeLeft = roundTime
    lastTime = Date.now()
}

function roundHelpScreenRect(ctx, x, y, width, height, radius, fill, stroke) {
    if (typeof stroke === "undefined") stroke = true
    if (typeof radius === "undefined") radius = 5
    if (typeof radius === "number") {
        radius = {tl: radius, tr: radius, br: radius, bl: radius}
    } else {
        const defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0}
        for (let side in defaultRadius) {
            radius[side] = radius[side] || defaultRadius[side]
        }
    }
    ctx.beginPath()
    ctx.moveTo(x + radius.tl, y)
    ctx.lineTo(x + width - radius.tr, y)
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr)
    ctx.lineTo(x + width, y + height - radius.br)
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height)
    ctx.lineTo(x + radius.bl, y + height)
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl)
    ctx.lineTo(x, y + radius.tl)
    ctx.quadraticCurveTo(x, y, x + radius.tl, y)
    ctx.closePath()
    if (fill) ctx.fill()
    if (stroke) ctx.stroke()
}

function isInside(mx, my, x, y, w, h) {
    return mx >= x && mx <= x + w && my >= y && my <= y + h
}

function handleBonusAnswer(index) {
    selectedOption = index

    const correct = bonusQuestions[bonusIndex].correctIndex
    if (index === correct) bonusScore++

    setTimeout(() => {
        selectedOption = null
        bonusIndex++

        if (bonusIndex === 5) {
            endBonusRound()
        }
    }, 600)
}

function endBonusRound() {
    bonusActive = false

    if (bonusScore >= 3) {
        resetMainGame()
    } else {
        gamePhase = FINAL_GAME_OVER_PHASE
    }
}

function startBonusRound() {
    shuffleArray(bonusQuestions)
    bonusIndex = 0
    bonusScore = 0
    selectedOption = null
    bonusActive = true

    console.log('startBonusRound()')

    gamePhase = BONUS_ROUND_PHASE
    timeLeft = Infinity
}


/**
 * TODO - Execution Logic Here
 *
 * Од оваа линија надолу повикување и извршување на функции
 * */


// Start the loading process immediately
loadGameImages()

window.addEventListener("resize", resizeCanvas)
resizeCanvas()

startBtn.addEventListener("click", () => {
    startScreen.style.display = 'none'
    document.getElementById('game-wrapper').style.display = 'flex'
    canvas.style.display = 'block'
    startGame()
})


canvas.addEventListener("click", (e) => {

    const rect = canvas.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top

    const dx = mx - info.x
    const dy = my - info.y

    const wasHovering = info.hover;
    info.hover = Math.sqrt(dx * dx + dy * dy) <= info.radius

    if (wasHovering && !info.hover) {
        lastTime = Date.now();
    }

    const vWidth = canvas.width / dpr
    const vHeight = canvas.height / dpr

    const aspect_size = 900 / vWidth

    const cardHeight = 120 / aspect_size
    const cardY = 90 / aspect_size

    const optionWidth = vWidth * 0.65
    const optionHeight = 50 / aspect_size
    const startY = cardY + cardHeight + (40 / aspect_size)
    const optionGap = 16 / aspect_size

    const optionX = (vWidth - optionWidth) / 2

    if (gamePhase === FINAL_GAME_OVER_PHASE && window.restartButton) {
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
               // resetMainGame()// restart igra

            canvas.style.display = 'none'
            canvas2D.style.display="block"
            Loop()
        }
    }

    if(gamePhase === BONUS_ROUND_PHASE){
        bonusQuestions[bonusIndex].options.forEach((_, i) => {
            const optionY = startY + (i * (optionHeight + optionGap))

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

        const buttonW = vWidth / 6
        const buttonH = vHeight / 8
        const button_spacing = vWidth / 10

        if (isInside(mx, my, vWidth / 2 - (button_spacing + buttonW), vHeight * 0.56, buttonW, buttonH)) {
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

// canvas.addEventListener("mousemove", (e) => {
//     const rect = canvas.getBoundingClientRect()
//     const mouseX = e.clientX - rect.left
//     const mouseY = e.clientY - rect.top
//
//     const dx = mouseX - info.x
//     const dy = mouseY - info.y
//
//     const wasHovering = info.hover;
//     info.hover = Math.sqrt(dx * dx + dy * dy) <= info.radius
//
//     if (wasHovering && !info.hover) {
//         lastTime = Date.now();
//     }
//
// })


/*
* TODO
*
* Start minigame fix
* After death minigame fix
* Win Minigame fix
* Fix buttons Try again...
*
* */