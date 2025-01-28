// Get the canvas and set up the context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Load images
const backgroundImg = new Image();
backgroundImg.src = 'images/background.jpg';

const playerImg = new Image();
playerImg.src = 'images/player.png';

const enemyImg = new Image();
enemyImg.src = 'images/enemy.png';

const enemy1Img = new Image();
enemy1Img.src = 'images/enemy1.png';

// Game variables
const player = {
  x: canvas.width / 2 - 50,
  y: canvas.height - 150,
  width: 80, // Increased size
  height: 80, // Increased size
  speed: 10,
};

const bullets = [];
const enemies = [];
const enemiesLevel2 = [];
let score = 0;
let lives = 3;
let gameOver = false;

// Enemy spawn timer
let enemyTimer = 0;

// Handle touch movement (horizontal and vertical sliding)
canvas.addEventListener('touchmove', (e) => {
  const touch = e.touches[0];
  player.x = touch.clientX - player.width / 2;
  player.y = touch.clientY - player.height / 2;

  // Boundary checks
  if (player.x < 0) player.x = 0;
  if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
  if (player.y < 0) player.y = 0;
  if (player.y + player.height > canvas.height) player.y = canvas.height - player.height;
});

// Restart game
function restartGame() {
  score = 0;
  lives = 3;
  gameOver = false;
  bullets.length = 0;
  enemies.length = 0;
  enemiesLevel2.length = 0;
  gameLoop(); // Restart the game loop
}

// Spawn enemies
function spawnEnemy() {
  const enemySize = 50;
  const x = Math.random() * (canvas.width - enemySize);
  enemies.push({ x, y: 0, width: enemySize, height: enemySize, speed: 1 + score / 20 });
}

function spawnEnemyLevel2() {
  const enemySize = 70;
  const x = Math.random() * (canvas.width - enemySize);
  enemiesLevel2.push({
    x,
    y: 0,
    width: enemySize,
    height: enemySize,
    speed: 1 + score / 25,
    health: 2, // Takes 2 bullets to destroy
  });
}

// Draw the player
function drawPlayer() {
  ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);
}

// Draw the background
function drawBackground() {
  ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);
}

// Draw enemies
function drawEnemies() {
  enemies.forEach((enemy, index) => {
    enemy.y += enemy.speed;
    ctx.drawImage(enemyImg, enemy.x, enemy.y, enemy.width, enemy.height);

    // Check if enemy reaches the bottom
    if (enemy.y > canvas.height) {
      enemies.splice(index, 1);
      lives--;
      if (lives <= 0) {
        gameOver = true;
      }
    }
  });

  enemiesLevel2.forEach((enemy, index) => {
    enemy.y += enemy.speed;
    ctx.drawImage(enemy1Img, enemy.x, enemy.y, enemy.width, enemy.height);

    // Check if enemy reaches the bottom
    if (enemy.y > canvas.height) {
      enemiesLevel2.splice(index, 1);
      lives--;
      if (lives <= 0) {
        gameOver = true;
      }
    }
  });
}

// Draw bullets
function drawBullets() {
  bullets.forEach((bullet, index) => {
    bullet.y -= bullet.speed;
    ctx.fillStyle = 'red';
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

    // Remove bullets that go off screen
    if (bullet.y < 0) bullets.splice(index, 1);

    // Check for collisions with level 1 enemies
    enemies.forEach((enemy, enemyIndex) => {
      if (
        bullet.x < enemy.x + enemy.width &&
        bullet.x + bullet.width > enemy.x &&
        bullet.y < enemy.y + enemy.height &&
        bullet.y + bullet.height > enemy.y
      ) {
        // Remove bullet and enemy
        bullets.splice(index, 1);
        enemies.splice(enemyIndex, 1);
        score++;
      }
    });

    // Check for collisions with level 2 enemies
    enemiesLevel2.forEach((enemy, enemyIndex) => {
      if (
        bullet.x < enemy.x + enemy.width &&
        bullet.x + bullet.width > enemy.x &&
        bullet.y < enemy.y + enemy.height &&
        bullet.y + bullet.height > enemy.y
      ) {
        // Reduce enemy health
        enemy.health--;
        bullets.splice(index, 1);

        if (enemy.health <= 0) {
          enemiesLevel2.splice(enemyIndex, 1);
          score++;
        }
      }
    });
  });
}

// Fire bullets automatically
setInterval(() => {
  if (!gameOver) {
    bullets.push(
      { x: player.x + 10, y: player.y, width: 5, height: 10, speed: 10 }, // Left side bullet
      { x: player.x + player.width - 15, y: player.y, width: 5, height: 10, speed: 10 } // Right side bullet
    );
  }
}, 300);

// Display score and lives
function displayHUD() {
  ctx.fillStyle = 'white';
  ctx.font = '20px Arial';
  ctx.fillText(`Score: ${score}`, canvas.width - 100, 30);
  ctx.fillText(`Lives: ${lives}`, canvas.width - 100, 60);
}

// Show Game Over screen
function showGameOverScreen() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'white';
  ctx.font = '40px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 50);

  // Restart button
  const buttonWidth = 150;
  const buttonHeight = 50;
  const buttonX = canvas.width / 2 - buttonWidth / 2;
  const buttonY = canvas.height / 2;

  ctx.fillStyle = 'red';
  ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);

  ctx.fillStyle = 'white';
  ctx.font = '20px Arial';
  ctx.fillText('Restart', canvas.width / 2, canvas.height / 2 + 30);

  // Add event listener for restart button
  canvas.addEventListener('click', function handleRestart(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (
      x >= buttonX &&
      x <= buttonX + buttonWidth &&
      y >= buttonY &&
      y <= buttonY + buttonHeight
    ) {
      canvas.removeEventListener('click', handleRestart); // Remove the event listener
      restartGame(); // Restart the game
    }
  });
}

// Main game loop
function gameLoop() {
  if (gameOver) {
    showGameOverScreen();
    return;
  }

  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw everything
  drawBackground();
  drawPlayer();
  drawBullets();
  drawEnemies();
  displayHUD();

  // Spawn enemies periodically
  if (enemyTimer % 100 === 0) spawnEnemy();
  if (enemyTimer % 300 === 0) spawnEnemyLevel2();
  enemyTimer++;

  // Check if the player has lost all lives
  if (lives <= 0) {
    gameOver = true;
  }

  // Continue the game loop
  requestAnimationFrame(gameLoop);
}

// Start the game loop
gameLoop();