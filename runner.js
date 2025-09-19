const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game state
let gameRunning = true;
let score = 0;
let achievementsCollected = 0;
let gameSpeed = 2;

// Player
const player = {
    x: 100,
    y: 320,
    width: 40,
    height: 40,
    velocityY: 0,
    jumping: false,
    color: '#ff6b35'
};

// Game objects
let obstacles = [];
let hotspots = [];
let particles = [];

const achievements = [
    { name: 'Mars Mission 2014', icon: '🚀', event: 'Mangalyaan reached Mars orbit - First country to succeed on first attempt!' },
    { name: 'UPI Launch 2016', icon: '💳', event: 'Unified Payments Interface revolutionized digital payments in India!' },
    { name: 'COVID Vaccination 2021', icon: '💉', event: 'World\'s largest vaccination drive - 2+ billion doses administered!' },
    { name: 'Solar Power 2022', icon: '☀️', event: '4th largest renewable energy capacity globally achieved!' },
    { name: 'Unicorn Boom 2023', icon: '🦄', event: '100+ unicorn startups making India 3rd largest startup ecosystem!' }
];
let currentAchievement = 0;

// Input handling
const keys = {};
document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        jump();
    }
    if (e.code === 'ArrowDown') {
        slide();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
    if (e.code === 'ArrowDown') {
        player.sliding = false;
        player.height = 40;
    }
});

function jump() {
    if (!player.jumping) {
        player.velocityY = -12;
        player.jumping = true;
    }
}

function slide() {
    if (!player.jumping) {
        player.sliding = true;
        player.height = 20;
    }
}

// Game objects creation
let obstacleTimer = 0;
function createObstacle() {
    obstacles.push({
        x: canvas.width,
        y: 300,
        width: 20,
        height: 40,
        color: '#ff0000'
    });
}

function createHotspot() {
    if (currentAchievement < 5) {
        hotspots.push({
            x: canvas.width,
            y: 280,
            width: 35,
            height: 35,
            achievement: achievements[currentAchievement],
            pulse: 0
        });
    }
}

function createParticle(x, y, color) {
    for (let i = 0; i < 8; i++) {
        particles.push({
            x: x,
            y: y,
            velocityX: (Math.random() - 0.5) * 8,
            velocityY: (Math.random() - 0.5) * 8,
            color: color,
            life: 30,
            maxLife: 30
        });
    }
}

// Update game objects
function updatePlayer() {
    if (player.jumping) {
        player.velocityY += 0.6;
        player.y += player.velocityY;
        
        if (player.y >= 320) {
            player.y = 320;
            player.jumping = false;
            player.velocityY = 0;
        }
    }
}

function updateObstacles() {
    obstacles.forEach((obstacle, index) => {
        obstacle.x -= gameSpeed;
        
        if (obstacle.x + obstacle.width < 0) {
            obstacles.splice(index, 1);
            score += 10;
        }
    });
}

function updateHotspots() {
    hotspots.forEach((hotspot, index) => {
        hotspot.x -= gameSpeed;
        hotspot.pulse += 0.2;
        
        if (hotspot.x + hotspot.width < 0) {
            hotspots.splice(index, 1);
        }
    });
}

function updateParticles() {
    particles.forEach((particle, index) => {
        particle.x += particle.velocityX;
        particle.y += particle.velocityY;
        particle.life--;
        
        if (particle.life <= 0) {
            particles.splice(index, 1);
        }
    });
}

// Collision detection
function checkCollisions() {
    // Obstacle collisions
    obstacles.forEach(obstacle => {
        if (player.x < obstacle.x + obstacle.width &&
            player.x + player.width > obstacle.x &&
            player.y < obstacle.y + obstacle.height &&
            player.y + player.height > obstacle.y) {
            gameOver();
        }
    });
    
    hotspots.forEach((hotspot, index) => {
        if (player.x < hotspot.x + hotspot.width &&
            player.x + player.width > hotspot.x &&
            player.y < hotspot.y + hotspot.height &&
            player.y + player.height > hotspot.y) {
            
            currentAchievement++;
            achievementsCollected++;
            score += 100;
            alert(`🎉 ${hotspot.achievement.name} Unlocked!\n\n${hotspot.achievement.event}`);
            hotspots.splice(index, 1);
            
            if (achievementsCollected >= 5) {
                gameWin();
            }
        }
    });
}

// Rendering
function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Player face
    ctx.fillStyle = 'white';
    ctx.fillRect(player.x + 5, player.y + 5, 8, 8);
    ctx.fillRect(player.x + 25, player.y + 5, 8, 8);
    ctx.fillStyle = 'black';
    ctx.fillRect(player.x + 15, player.y + 20, 10, 5);
}

function drawObstacles() {
    obstacles.forEach(obstacle => {
        ctx.fillStyle = obstacle.color;
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        
        // Danger stripes
        ctx.fillStyle = 'yellow';
        for (let i = 0; i < obstacle.height; i += 10) {
            ctx.fillRect(obstacle.x, obstacle.y + i, obstacle.width, 3);
        }
    });
}

function drawHotspots() {
    hotspots.forEach(hotspot => {
        const scale = 1 + Math.sin(hotspot.pulse) * 0.2;
        const size = hotspot.width * scale;
        const x = hotspot.x - (size - hotspot.width) / 2;
        const y = hotspot.y - (size - hotspot.height) / 2;
        
        // Glow effect
        ctx.shadowColor = hotspot.achievement.color;
        ctx.shadowBlur = 15;
        ctx.fillStyle = hotspot.achievement.color;
        ctx.fillRect(x, y, size, size);
        ctx.shadowBlur = 0;
        
        // Achievement icon
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(hotspot.achievement.icon, hotspot.x + hotspot.width/2, hotspot.y + hotspot.height/2 + 7);
    });
}

function drawParticles() {
    particles.forEach(particle => {
        const alpha = particle.life / particle.maxLife;
        ctx.fillStyle = particle.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
        ctx.fillRect(particle.x, particle.y, 4, 4);
    });
}

function drawBackground() {
    // Sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#98FB98');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Ground
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, 360, canvas.width, 40);
    
    // Moving clouds
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    const cloudOffset = (Date.now() * 0.02) % (canvas.width + 100);
    ctx.fillRect(cloudOffset - 100, 50, 80, 30);
    ctx.fillRect(cloudOffset + 200, 80, 60, 25);
}

// Game logic
function spawnObjects() {
    obstacleTimer++;
    if (obstacleTimer > 150) {
        createObstacle();
        obstacleTimer = 0;
    }
    if (Math.random() < 0.01) createHotspot();
}

function updateUI() {
    document.getElementById('score').textContent = score;
    document.getElementById('achievements').textContent = `${achievementsCollected}/5`;
}

function gameOver() {
    gameRunning = false;
    document.getElementById('finalScore').textContent = score;
    document.getElementById('finalAchievements').textContent = `${achievementsCollected}/5`;
    document.getElementById('gameOver').style.display = 'block';
}

function gameWin() {
    gameRunning = false;
    score += 200; // Bonus for collecting all
    document.getElementById('finalScore').textContent = score;
    document.getElementById('finalAchievements').textContent = `${achievementsCollected}/5`;
    document.getElementById('gameOver').querySelector('h2').textContent = '🎉 All Achievements Unlocked! 🎉';
    document.getElementById('gameOver').style.display = 'block';
}

function restartGame() {
    gameRunning = true;
    score = 0;
    achievementsCollected = 0;
    currentAchievement = 0;
    gameSpeed = 2;
    obstacles = [];
    hotspots = [];
    particles = [];
    obstacleTimer = 0;
    player.y = 320;
    player.jumping = false;
    player.velocityY = 0;
    document.getElementById('gameOver').style.display = 'none';
}

function playCollectSound() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.05);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.2);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
}

// Game loop
function gameLoop() {
    if (gameRunning) {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw background
        drawBackground();
        
        // Update
        updatePlayer();
        updateObstacles();
        updateHotspots();
        updateParticles();
        checkCollisions();
        spawnObjects();
        updateUI();
        
        // Increase difficulty
        gameSpeed += 0.001;
        
        // Draw
        drawPlayer();
        drawObstacles();
        drawHotspots();
        drawParticles();
    }
    
    requestAnimationFrame(gameLoop);
}

// Start game
gameLoop();