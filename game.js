const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");

const RADIUS = 20;
const ROWS = 8;
const COLS = 10;
const COLORS = ["#FF5733", "#33FF57", "#3357FF", "#F3FF33"];
const BOMB_COLOR = "#000000";

let score = 0;
let grid = [];
let projectile = null;
let mousePos = { x: 200, y: 0 };
let gameOver = false;

// Initialize grid with 4 starting rows
function initGrid() {
  grid = [];
  for (let r = 0; r < ROWS; r++) {
    grid[r] = [];
    for (let c = 0; c < COLS; c++) {
      grid[r][c] = r < 4 ? COLORS[Math.floor(Math.random() * COLORS.length)] : null;
    }
  }
}

function spawnProjectile() {
  // 15% chance to spawn a Bomb power-up
  const isBomb = Math.random() < 0.15;
  const color = isBomb ? BOMB_COLOR : COLORS[Math.floor(Math.random() * COLORS.length)];

  projectile = {
    x: canvas.width / 2,
    y: canvas.height - 30,
    dx: 0,
    dy: 0,
    color: color,
    isBomb: isBomb,
    moving: false
  };
}

canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  mousePos.x = e.clientX - rect.left;
  mousePos.y = e.clientY - rect.top;
});

canvas.addEventListener("click", () => {
  if (gameOver) {
    // Restart game on click
    score = 0;
    gameOver = false;
    scoreEl.innerText = "Score: 0";
    initGrid();
    spawnProjectile();
    return;
  }

  if (!projectile.moving) {
    let angle = Math.atan2(mousePos.y - projectile.y, mousePos.x - projectile.x);
    projectile.dx = Math.cos(angle) * 10;
    projectile.dy = Math.sin(angle) * 10;
    projectile.moving = true;
  }
});

function drawCircle(x, y, color, isBomb = false) {
  ctx.beginPath();
  ctx.arc(x, y, RADIUS - 1, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = "#111";
  ctx.stroke();
  ctx.closePath();

  if (isBomb) {
    ctx.fillStyle = "#FFF";
    ctx.font = "14px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("💣", x, y);
  }
}

function update() {
  if (gameOver || !projectile.moving) return;

  projectile.x += projectile.dx;
  projectile.y += projectile.dy;

  // Wall bounce logic
  if (projectile.x - RADIUS <= 0 || projectile.x + RADIUS >= canvas.width) {
    projectile.dx *= -1;
  }

  // Grid collision check
  let r = Math.floor(projectile.y / (RADIUS * 2));
  let c = Math.floor(projectile.x / (RADIUS * 2));

  if (r < ROWS && (r <= 0 || grid[r]?.[c])) {
    let targetR = Math.max(0, Math.min(ROWS - 1, r));
    let targetC = Math.max(0, Math.min(COLS - 1, c));

    if (projectile.isBomb) {
      triggerBombExplosion(targetR, targetC);
    } else {
      grid[targetR][targetC] = projectile.color;
      checkMatches(targetR, targetC, projectile.color);
    }

    checkGameOver();

    if (!gameOver) {
      spawnProjectile();
    }
  }
}

function triggerBombExplosion(r, c) {
  let popped = 0;
  // Explode 3x3 grid around impact
  for (let row = r - 1; row <= r + 1; row++) {
    for (let col = c - 1; col <= c + 1; col++) {
      if (row >= 0 && row < ROWS && col >= 0 && col < COLS && grid[row][col]) {
        grid[row][col] = null;
        popped++;
      }
    }
  }
  score += popped * 150;
  scoreEl.innerText = `Score: ${score}`;
}

function checkMatches(r, c, color) {
  let matches = [];
  function floodFill(row, col) {
    if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return;
    if (grid[row][col] !== color || matches.some(m => m.r === row && m.c === col)) return;
    matches.push({ r: row, c: col });
    floodFill(row + 1, col);
    floodFill(row - 1, col);
    floodFill(row, col + 1);
    floodFill(row, col - 1);
  }

  floodFill(r, c);

  if (matches.length >= 3) {
    matches.forEach(m => grid[m.r][m.c] = null);
    score += matches.length * 100;
    scoreEl.innerText = `Score: ${score}`;
  }
}

function checkGameOver() {
  for (let c = 0; c < COLS; c++) {
    if (grid[ROWS - 1][c] !== null) {
      gameOver = true;
      break;
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw Grid
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (grid[r][c]) {
        drawCircle(c * RADIUS * 2 + RADIUS, r * RADIUS * 2 + RADIUS, grid[r][c]);
      }
    }
  }

  if (!gameOver) {
    // Aim line
    if (!projectile.moving) {
      ctx.beginPath();
      ctx.moveTo(projectile.x, projectile.y);
      ctx.lineTo(mousePos.x, mousePos.y);
      ctx.strokeStyle = "rgba(255,255,255,0.3)";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Active Projectile
    drawCircle(projectile.x, projectile.y, projectile.color, projectile.isBomb);
  } else {
    // Game Over Overlay
    ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#FF5733";
    ctx.font = "bold 32px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 20);

    ctx.fillStyle = "#FFF";
    ctx.font = "18px sans-serif";
    ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
    ctx.fillText("Click Anywhere to Restart", canvas.width / 2, canvas.height / 2 + 60);
  }
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

initGrid();
spawnProjectile();
gameLoop();
