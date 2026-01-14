const startScreen = document.getElementById("start-screen");
const startBtn = document.getElementById("start-btn");
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let score = 0;
let gameRunning = false;
let passwordChoices = [];
let roundTime = 5;        // seconds per round
let timeLeft = roundTime;
let lastTime = Date.now();
let reallySafePasswords = []
let safePasswords = []
let notSafePasswords = []


startBtn.addEventListener("click", () => {
    startScreen.style.display = "none";
    canvas.style.display = "block";
    startGame();
});

function startGame() {
    score = 0;
    gameRunning = true;
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
        "letmein"
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

    const generators = [
        generateReallySafe,
        generateSafe,
        generateNotSafe
    ];


    const firstIndex = Math.floor(Math.random() * generators.length);
    let secondIndex;

    do {
        secondIndex = Math.floor(Math.random() * generators.length);
    } while (secondIndex === firstIndex);



    passwordChoices.push({
        text: generators[firstIndex](),
        x: 130,
        y: 250,
        width: 220,
        height: 55
    });

    passwordChoices.push({
        text: generators[secondIndex](),
        x: 490,
        y: 250,
        width: 220,
        height: 55
    });


    passwordChoices.sort(() => Math.random() - 0.5);

}


function drawPasswords() {
    ctx.font = "bold 18px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    passwordChoices.forEach(pw => {
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
        ctx.fillText(
            pw.text,
            pw.x + pw.width / 2,
            pw.y + pw.height / 2
        );
    });
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

function drawScore() {
    ctx.fillStyle = "#f6f3f3";
    ctx.font = "22px Arial";
    ctx.textAlign = "left";
    ctx.fillText("Score: " + score, 20, 30);
}

function drawInstructions() {
    ctx.fillStyle = "#f6f3f3";
    ctx.font = "18px Arial";
    ctx.textAlign = "center";
    ctx.fillText(
        "Click the SAFER password",
        canvas.width / 2 - 20,
        120
    );
}

function update() {
    const now = Date.now();
    const delta = (now - lastTime) / 1000;
    lastTime = now;

    timeLeft -= delta;

    if (timeLeft <= 0) {
        score -= 5;
        startNewRound();
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawInstructions();
    drawPasswords();
    drawScore();
    drawTimer();
    drawInfoButton();
}

function gameLoop() {
    if (!gameRunning) return;
    update();
    draw();
    requestAnimationFrame(gameLoop);
}


canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    passwordChoices.forEach(pw => {
        if (
            mouseX >= pw.x &&
            mouseX <= pw.x + pw.width &&
            mouseY >= pw.y &&
            mouseY <= pw.y + pw.height
        ) {
            handleChoice(pw.text);
        }
    });
});

function handleChoice(text) {

    if (reallySafePasswords.includes(text)) {
        score += 2;
    } else if (safePasswords.includes(text)){
        score += 1;
    }
    else score -= 1;

    startNewRound();
}

function startNewRound() {
    spawnTwoPasswords();
    timeLeft = roundTime;
    lastTime = Date.now();
}

function drawTimer() {
    const centerX = canvas.width / 2 - 5;
    const centerY = 275;
    const radius = 40;


    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fillStyle = "#fb0000";
    ctx.fill();


    ctx.lineWidth = 4;
    ctx.strokeStyle = "#ffffff";
    ctx.stroke();


    ctx.fillStyle = "#ffffff";
    ctx.font = "26px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
        Math.ceil(timeLeft),
        centerX,
        centerY
    );
}


const info = {
    x: canvas.width - 40,
    y: 40,
    radius: 18,
    hover: false,
    visible: true,
    text: `A password is SAFE if it meets ALL of these rules:

Length
- At least 8 characters

Character variety
- Contains at least 3 of these 4 types:
  Uppercase (A–Z)
  Lowercase (a–z)
  Number (0–9)
  Special character (! @ # $ % & *)

No common patterns
- Does NOT contain: "1234", "password", "qwerty", "admin"
- No repeated characters like "aaaa"

No personal info
- Does NOT include: Name, Birth year, Username`
};

// ====== MOUSE EVENTS ======
canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const dx = mouseX - info.x;
    const dy = mouseY - info.y;
    info.hover = Math.sqrt(dx * dx + dy * dy) <= info.radius;
});

// ====== DRAW INFO BUTTON ======
function drawInfoButton() {
    if (!info.visible) return;

    // Draw gradient circle with shadow
    const gradient = ctx.createRadialGradient(info.x, info.y, info.radius / 2, info.x, info.y, info.radius);
    gradient.addColorStop(0, "#0B0A0AFF");
    gradient.addColorStop(1, "#f6f3f3");

    ctx.beginPath();
    ctx.arc(info.x, info.y, info.radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.shadowColor = "rgb(11,10,10)";
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.closePath();

    // Draw "?" in the center
    ctx.fillStyle = "white";
    ctx.font = "bold 20px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("?", info.x, info.y);

    // Tooltip
    if (info.hover) {
        const padding = 12;
        const maxWidth = 380;
        const lines = info.text.split("\n");
        const lineHeight = 18;
        const tooltipHeight = lines.length * lineHeight + padding * 2;

        // Rounded rectangle
        const tooltipX = info.x - maxWidth + 30;
        const tooltipY = info.y + 30;

        ctx.fillStyle = "rgba(30,41,59,0.95)"; // dark semi-transparent background
        ctx.strokeStyle = "#f6f3f3";
        ctx.lineWidth = 2;
        rounddRect(ctx, tooltipX, tooltipY, maxWidth, tooltipHeight, 12, true, true);

        // Tooltip text
        ctx.fillStyle = "#f3f4f6"; // off-white text
        ctx.font = "14px Arial";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        lines.forEach((line, i) => {
            ctx.fillText(line, tooltipX + padding, tooltipY + padding + i * lineHeight);
        });
    }
}

// ====== HELPER: Rounded rectangle ======
function rounddRect(ctx, x, y, width, height, radius, fill, stroke) {
    if (typeof stroke === "undefined") stroke = true;
    if (typeof radius === "undefined") radius = 5;
    if (typeof radius === "number") {
        radius = { tl: radius, tr: radius, br: radius, bl: radius };
    } else {
        const defaultRadius = { tl: 0, tr: 0, br: 0, bl: 0 };
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
// // Faster + more fireworks
// let fireworkInterval = setInterval(() => {
//     createFireworkBurst();
//     createFireworkBurst();
// }, 600);
//
// function createFireworkBurst() {
//     const rect = title.getBoundingClientRect();
//
//     // Random position around the title
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