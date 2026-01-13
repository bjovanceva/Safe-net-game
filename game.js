const startScreen = document.getElementById("start-screen");
const startBtn = document.getElementById("start-btn");
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let player;
let passwords = [];
let score = 0;
let gameRunning = false;

startBtn.addEventListener("click", () => {
    startScreen.style.display = "none";
    canvas.style.display = "block";
    startGame();
});

function startGame() {
    score = 0;
    gameRunning = true;

    initPlayer();

    passwords = [];
    passwords.push(spawnFirstPassword());
    passwords.push(spawnSecondPassword());

    gameLoop();
}

function initPlayer() {
    player = {
        x: canvas.width / 2 - 40,
        y: canvas.height - 40,
        width: 80,
        height: 20,
        speed: 7
    };
}

function spawnFirstPassword() {
    const texts = [
        "password123",
        "Tr!9mQ8@",
        "qwerty",
        "A7$kPz2!",
        "123456"
    ];

    return {
        text: texts[Math.floor(Math.random() * texts.length)],
        x: canvas.width-600,
        y: 0,
        speed: 2,

        paused: false,
        pauseStartTime: null,
        pauseDuration: 10000, // 10 seconds
        pauseY: canvas.height / 2
    };
}

function spawnSecondPassword() {
    const texts = [
        "password123",
        "Tr!9mQ8@",
        "qwerty",
        "A7$kPz2!",
        "123456"
    ];

    return {
        text: texts[Math.floor(Math.random() * texts.length)],
        x: canvas.width-300,
        y: 0,
        speed: 2,

        paused: false,
        pauseStartTime: null,
        pauseDuration: 10000, // 10 seconds
        pauseY: canvas.height / 2
    };
}


function drawPlayer() {
    ctx.fillStyle = "#38bdf8";
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

function drawPasswords() {
    ctx.font = "18px Arial";

    passwords.forEach(pw => {
        ctx.fillStyle = pw.paused ? "#facc15" : "white";
        ctx.fillText(pw.text, pw.x, pw.y);
    });
}

const keys = {};

document.addEventListener("keydown", (e) => {
    keys[e.key] = true;
});

document.addEventListener("keyup", (e) => {
    keys[e.key] = false;
});

function movePlayer() {
    if (keys["ArrowLeft"] && player.x > 0) {
        player.x -= player.speed;
    }
    if (keys["ArrowRight"] && player.x + player.width < canvas.width) {
        player.x += player.speed;
    }
}

function checkCollisions() {
    passwords.forEach((pw, index) => {
        const textWidth = ctx.measureText(pw.text).width;


        if (
            pw.y >= player.y &&
            pw.x + textWidth >= player.x &&
            pw.x <= player.x + player.width
        ) {
            score++;
            if(pw.x===canvas.width-600)
                passwords[index] = spawnFirstPassword();
            else passwords[index] = spawnSecondPassword();
        }
    });
}

function update() {
    movePlayer();

    passwords.forEach((pw, index) => {

        if (!pw.paused) {
            pw.y += pw.speed;

            if (pw.y >= pw.pauseY && pw.pauseStartTime === null) {
                pw.paused = true;
                pw.pauseStartTime = Date.now();
            }
        } else {
            const elapsed = Date.now() - pw.pauseStartTime;
            if (elapsed >= pw.pauseDuration) {
                pw.paused = false;
            }
        }

        if (pw.y > canvas.height) {
            if(pw.x===canvas.width-600)
                passwords[index] = spawnFirstPassword();
            else passwords[index] = spawnSecondPassword();
        }
    });

    checkCollisions();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawPlayer();
    drawPasswords();
    drawQuestions();

    ctx.fillStyle = "#22c55e";
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, 20, 30);
}

function gameLoop() {
    if (!gameRunning) return;

    update();
    draw();

    requestAnimationFrame(gameLoop);
}

let questions = [
    {
        x: 60,
        y: 200,
        text: "Length: At least 8 characters\nCharacter variety: 3+ types\nNo common patterns\nNo personal info",
        width: 30,
        height: 30,
        visible: true
    },
    {
        x: 40,
        y: 260,
        text: "Length: At least 8 characters\nCharacter variety: 3+ types\nNo common patterns\nNo personal info",
        width: 30,
        height: 30,
        visible: true
    },
    {
        x: 60,
        y: 300,
        text: "Length: At least 8 characters\nCharacter variety: 3+ types\nNo common patterns\nNo personal info",
        width: 30,
        height: 30,
        visible: true
    }
];

let activeQuestion = null; // currently clicked question

function drawQuestions() {
    questions.forEach(q => {
        if (q.visible) {

            ctx.beginPath();
            ctx.arc(q.x + q.width / 2, q.y - q.height / 2, q.width / 2, 0, Math.PI * 2);
            ctx.fillStyle = "white";
            ctx.fill();
            ctx.closePath();


            ctx.fillStyle = "#f472b6";
            ctx.font = "20px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("?", q.x + q.width / 2, q.y - q.height / 2);
        }
    });


    if (activeQuestion) {
        ctx.fillStyle = "#22c55e";
        ctx.font = "16px Arial";
        let lines = activeQuestion.text.split("\n");
        lines.forEach((line, i) => {
            ctx.fillText(line, 50, canvas.height - 150 + i * 20);
        });
    }
}

canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    questions.forEach(q => {
        if (
            mouseX >= q.x && mouseX <= q.x + q.width &&
            mouseY >= q.y - 24 && mouseY <= q.y
        ) {
            activeQuestion = q;
        }
    });
});


canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    let clickedAny = false;

    questions.forEach(q => {
        if (
            mouseX >= q.x && mouseX <= q.x + q.width &&
            mouseY >= q.y - 24 && mouseY <= q.y
        ) {
            activeQuestion = q;
            clickedAny = true;
        }
    });

    if (!clickedAny) {
        activeQuestion = null;
    }
});




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