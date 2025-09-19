const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let gameRunning = true;
let badgesCollected = [];

const player = { x: 100, y: 320, width: 30, height: 30, velocityY: 0, jumping: false };
let obstacles = [];
let badges = [];
let obstacleTimer = 0;
let badgeTimer = 0;

const achievementBadges = [
    { name: 'Mars Mission', icon: '🚀', collected: false },
    { name: 'Digital Payments', icon: '💳', collected: false },
    { name: 'Vaccination Drive', icon: '💉', collected: false },
    { name: 'Solar Power', icon: '☀️', collected: false },
    { name: 'Startup Hub', icon: '🦄', collected: false }
];

// Input handling
document.addEventListener('keydown', (e) => {
    if ((e.code === 'Space' || e.code === 'ArrowUp') && !player.jumping) {
        e.preventDefault();
        player.velocityY = -12;
        player.jumping = true;
    }
});

function createObstacle() {
    obstacles.push({
        x: canvas.width,
        y: 340,
        width: 15,
        height: 20
    });
}

function createBadge() {
    const availableBadges = achievementBadges.filter(badge => !badge.collected);
    if (availableBadges.length > 0) {
        const badge = availableBadges[Math.floor(Math.random() * availableBadges.length)];
        badges.push({
            x: canvas.width,
            y: 280,
            width: 30,
            height: 30,
            badge: badge
        });
    }
}

function updatePlayer() {
    if (player.jumping) {
        player.velocityY += 0.8;
        player.y += player.velocityY;
        
        if (player.y >= 320) {
            player.y = 320;
            player.jumping = false;
            player.velocityY = 0;
        }
    }
}

function updateGame() {
    // Update obstacles
    obstacles.forEach((obstacle, i) => {
        obstacle.x -= 4;
        if (obstacle.x < -obstacle.width) obstacles.splice(i, 1);
    });
    
    // Update badges
    badges.forEach((badge, i) => {
        badge.x -= 4;
        if (badge.x < -badge.width) badges.splice(i, 1);
    });
}

function checkCollisions() {
    // Obstacle collisions
    obstacles.forEach(obstacle => {
        if (player.x < obstacle.x + obstacle.width && player.x + player.width > obstacle.x &&
            player.y < obstacle.y + obstacle.height && player.y + player.height > obstacle.y) {
            restartGame();
        }
    });
    
    // Badge collection
    badges.forEach((badgeObj, i) => {
        if (player.x < badgeObj.x + badgeObj.width && player.x + player.width > badgeObj.x &&
            player.y < badgeObj.y + badgeObj.height && player.y + player.height > badgeObj.y) {
            
            badgeObj.badge.collected = true;
            badgesCollected.push(badgeObj.badge);
            badges.splice(i, 1);
            updateBadgeDisplay();
            
            if (badgesCollected.length >= 5) {
                gameComplete();
            }
        }
    });
}

function draw() {
    // Background
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Ground
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, 360, canvas.width, 40);
    
    // Player
    ctx.fillStyle = '#ff6b35';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Obstacles (small walls attached to ground)
    obstacles.forEach(obstacle => {
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });
    
    // Badges
    badges.forEach(badgeObj => {
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(badgeObj.x, badgeObj.y, badgeObj.width, badgeObj.height);
        ctx.fillStyle = 'black';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(badgeObj.badge.icon, badgeObj.x + 15, badgeObj.y + 22);
    });
}

function updateBadgeDisplay() {
    const badgesList = document.getElementById('badgesList');
    if (badgesCollected.length === 0) {
        badgesList.textContent = 'None yet';
    } else {
        badgesList.innerHTML = badgesCollected.map(badge => `${badge.icon} ${badge.name}`).join('<br>');
    }
}

function gameComplete() {
    gameRunning = false;
    document.getElementById('completeScreen').style.display = 'block';
    // Store badges in localStorage for the stream page
    localStorage.setItem('collectedBadges', JSON.stringify(badgesCollected));
}

function restartGame() {
    gameRunning = true;
    badgesCollected = [];
    obstacles = [];
    badges = [];
    obstacleTimer = 0;
    badgeTimer = 0;
    player.y = 320;
    player.jumping = false;
    player.velocityY = 0;
    
    // Reset badge collection status
    achievementBadges.forEach(badge => badge.collected = false);
    
    updateBadgeDisplay();
    document.getElementById('completeScreen').style.display = 'none';
}

function gameLoop() {
    if (gameRunning) {
        updatePlayer();
        updateGame();
        checkCollisions();
        
        // Spawn obstacles
        obstacleTimer++;
        if (obstacleTimer > 120) {
            createObstacle();
            obstacleTimer = 0;
        }
        
        // Spawn badges
        badgeTimer++;
        if (badgeTimer > 200 && badges.length === 0) {
            createBadge();
            badgeTimer = 0;
        }
        
        draw();
    }
    requestAnimationFrame(gameLoop);
}

gameLoop();