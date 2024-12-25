const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const startScreen = document.getElementById("start-screen");
const startButton = document.getElementById("start-button");
const bestScoreElement = document.getElementById("best-score");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Images
const bgImg = new Image();
bgImg.src = "./img/background.jpg";

const santaImg = new Image();
santaImg.src = "./img/santa.jpg";

const giftImg = new Image();
giftImg.src = "./img/gift.jpg";

const snowTwirlImg = new Image();
snowTwirlImg.src = "./img/snow_twirl.jpg";

const snowballImg = new Image();
snowballImg.src = "./img/snowball.jpg"; // Nouvelle image pour la boule de neige

const heartFullImg = new Image();
heartFullImg.src = "./img/heart_full.jpg"; // Image pour un cœur rouge

const heartEmptyImg = new Image();
heartEmptyImg.src = "./img/heart_empty.jpg"; // Image pour un cœur vide



// Variables du jeu
let santa = { x: 50, y: canvas.height / 2, width: 60, height: 60, speed: 5, lives: 2 };
let gift = { x: canvas.width, y: Math.random() * canvas.height, width: 50, height: 50 };
let snowTwirl = { x: canvas.width, y: Math.random() * canvas.height, width: 50, height: 50 };
let snowball = { x: canvas.width + 300, y: Math.random() * canvas.height, width: 50, height: 50 };
let score = 0;
let startTime = null;
let elapsedTime = 0;
let paused = false;

// Gestion des touches
let upPressed = false;
let downPressed = false;

window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp") upPressed = true;
    if (e.key === "ArrowDown") downPressed = true;
});

window.addEventListener("keyup", (e) => {
    if (e.key === "ArrowUp") upPressed = false;
    if (e.key === "ArrowDown") downPressed = false;
});

// Fonction pour détecter les collisions
function isColliding(obj1, obj2) {
    return (
        obj1.x < obj2.x + obj2.width &&
        obj1.x + obj1.width > obj2.x &&
        obj1.y < obj2.y + obj2.height &&
        obj1.y + obj1.height > obj2.y
    );
}

// Réinitialiser les obstacles
function resetObstacle(obstacle) {
    obstacle.x = canvas.width + Math.random() * 300;
    obstacle.y = Math.random() * (canvas.height - obstacle.height);
}

// Réinitialiser le jeu
function resetGame() {
    score = 0;
    santa.lives = 2;
    santa.speed = 5;
    santa.y = canvas.height / 2;
    resetObstacle(gift);
    resetObstacle(snowTwirl);
    resetObstacle(snowball);
    startTime = Date.now();
    elapsedTime = 0;
    paused = false;
}

// Gérer la collision avec un malus
function handleMalusCollision() {
    santa.lives--;
    santa.speed = 0;
    paused = true;

    setTimeout(() => {
        santa.speed = 5;
        paused = false;
    }, 5000);

    if (santa.lives === 0) {
        // Redirection vers la page d'accueil en cas de défaite
        alert(`Game Over! Your score: ${score}. Returning to main menu.`);
        window.location.href = "index.html";
    }
}

// Mise à jour du jeu
function updateGame() {
    if (paused) return;

    // Temps écoulé
    elapsedTime = Math.floor((Date.now() - startTime) / 1000);

    // Déplacement du Père Noël
    if (upPressed && santa.y > 0) santa.y -= santa.speed;
    if (downPressed && santa.y < canvas.height - santa.height) santa.y += santa.speed;

    // Déplacement des obstacles
    gift.x -= 5;
    snowTwirl.x -= 8;
    snowball.x -= 10;

    // Réinitialiser les obstacles lorsqu'ils sortent de l'écran
    if (gift.x + gift.width < 0) resetObstacle(gift);
    if (snowTwirl.x + snowTwirl.width < 0) resetObstacle(snowTwirl);
    if (snowball.x + snowball.width < 0) resetObstacle(snowball);

    // Collisions
    if (isColliding(santa, gift)) {
        score++;
        resetObstacle(gift);
    }
    if (isColliding(santa, snowTwirl) || isColliding(santa, snowball)) {
        handleMalusCollision();
    }
}


// Dessiner les cœurs (représentation des vies)
function drawHearts() {
    const heartSize = 40; // Taille des cœurs
    const startX = 20; // Position de départ sur l'axe X
    const startY = 150; // Position sur l'axe Y

    for (let i = 0; i < 2; i++) {
        if (i < santa.lives) {
            // Dessiner un cœur rouge pour chaque vie restante
            ctx.drawImage(heartFullImg, startX + i * (heartSize + 10), startY, heartSize, heartSize);
        } else {
            // Dessiner un cœur vide pour chaque vie perdue
            ctx.drawImage(heartEmptyImg, startX + i * (heartSize + 10), startY, heartSize, heartSize);
        }
    }
}

// Dessiner les éléments du jeu
function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Défilement de l'arrière-plan
    bgX -= 2;
    if (bgX <= -canvas.width) {
        bgX = 0;
    }

    ctx.drawImage(bgImg, bgX, 0, canvas.width, canvas.height);
    ctx.drawImage(bgImg, bgX + canvas.width, 0, canvas.width, canvas.height);

    // Dessiner le Père Noël
    ctx.drawImage(santaImg, santa.x, santa.y, santa.width, santa.height);

    // Dessiner les cadeaux
    ctx.drawImage(giftImg, gift.x, gift.y, gift.width, gift.height);

    // Dessiner les tourbillons
    ctx.drawImage(snowTwirlImg, snowTwirl.x, snowTwirl.y, snowTwirl.width, snowTwirl.height);

    // Dessiner les boules de neige
    ctx.drawImage(snowballImg, snowball.x, snowball.y, snowball.width, snowball.height);

    // Dessiner les cœurs
    drawHearts();

    // Afficher le score, les vies et le temps
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.fillText(`Score: ${score}`, 20, 40);
    ctx.fillText(`Temps: ${elapsedTime}s`, 20, 120);
}


// Boucle de jeu
function gameLoop() {
    updateGame();
    drawGame();
    requestAnimationFrame(gameLoop);
}

// Démarrer le jeu au clic sur "Go"
startButton.addEventListener("click", () => {
    startScreen.style.display = "none";
    canvas.style.display = "block";
    resetGame();
    gameLoop();
});
