// --- CANVAS SETUP ---
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const missesEl = document.getElementById("misses");
const restartBtn = document.getElementById("restartBtn");

// --- GRID & BUBBLE CONFIGURATION ---
const RADIUS = 22;
const DIAMETER = RADIUS * 2;
const ROW_HEIGHT = RADIUS * Math.sqrt(3);
const COLS = 10;
const ROWS = 12;
const LAUNCHER_Y = canvas.height - 40;

const BUBBLE_COLORS = [
  { name: 'red', fill: '#ef4444', stroke: '#b91c1c' },
  { name: 'green', fill: '#22c55e', stroke: '#15803d' },
  { name: 'blue', fill: '#3b82f6', stroke: '#1d4ed8' },
  { name: 'yellow', fill: '#eab308', stroke: '#a16207' },
  { name: 'purple', fill: '#a855f7', stroke: '#6b21a8' }
];

// --- GAME STATE ---
let grid = [];
let score = 0;
let missCount = 0;
let gameOver = false;
let gameWon = false;
let mousePos = { x: canvas.width / 2, y: 0 };

let currentBubble = null;
let nextBubble = null;
let floatingAnimations = [];

// --- HEXAGONAL GRID MATH ---
function getTileCenter(r, c) {
  const isOdd = r % 2 === 1;
  const xOffset = isOdd ? RADIUS * 2 : RADIUS;
  const x = xOffset + c * DIAMETER;
  const y = RADIUS + r * ROW_HEIGHT;
  return { x, y };
}

function getGridIndices(x, y) {
  let r = Math.round((y - RADIUS) / ROW_HEIGHT);
  r = Math.max(0, Math.min(ROWS - 1, r));

  const isOdd = r % 2 === 1;
  const xOffset = isOdd ? RADIUS * 2 : RADIUS;
  let c = Math.round((x - xOffset) / DIAMETER);
  c = Math.max(0, Math.min(COLS - (isOdd ? 2 : 1), c));

  return { r, c };
}

function getNeighbors(r, c) {
  const isOdd = r % 2 === 1;
  const offsets = isOdd 
    ? [ { r: 0, c: -1 }, { r: 0, c: 1 }, { r: -1, c: 0 }, { r: -1, c: 1 }, { r: 1, c: 0 }, { r: 1, c: 1 } ]
    : [ { r: 0, c: -1 }, { r: 0, c: 1 }, { r: -1, c: -1 }, { r: -1, c: 0 }, { r: 1, c: -1 }, { r: 1, c: 0 } ];

  let neighbors = [];
  offsets.forEach(off => {
    let nr = r + off.r;
    let nc = c + off.c;
    let maxCols = (nr % 2 === 1) ? COLS - 1 : COLS;
    if (nr >= 0 && nr < ROWS && nc >= 0 && nc < maxCols) {
      neighbors.push({ r: nr, c: nc });
    }
  });
  return neighbors;
}

// --- INITIALIZATION ---
function getRandomColor() {
  return BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)];
}

function createBubble(colorObj) {
  return {
    color: colorObj || getRandomColor(),
    x: canvas.width / 2,
    y: LAUNCHER_Y,
    dx: 0,
    dy: 0,
    moving: false
  };
}

function initGame() {
  grid = Array.from({ length: ROWS }, () => []);
  for (let r = 0; r < 4; r++) {
    let maxCols = (r % 2 === 1) ? COLS - 1 : COLS;
    for (let c = 0; c < maxCols; c++) {
      grid[r][c] = getRandomColor();
    }
  }

  score = 0;
  missCount = 0;
  gameOver = false;
  gameWon = false;
  floatingAnimations = [];

  scoreEl.innerText = score;
  missesEl.innerText = `${missCount} / 5`;

  nextBubble = createBubble();
  spawnNextBubble();
}

function spawnNextBubble() {
  currentBubble = nextBubble;
  currentBubble.x = canvas.width / 2;
  currentBubble.y = LAUNCHER_Y;
  nextBubble = createBubble();
}

// --- EVENT LISTENERS ---
canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  mousePos.x = e.clientX - rect.left;
  mousePos.y = e.clientY - rect.top;
});

canvas.addEventListener("click", () => {
  if (gameOver || gameWon || currentBubble.moving) return;

  let angle = Math.atan2(mousePos.y - currentBubble.y, mousePos.x - currentBubble.x);
  
  if (angle > -0.15) angle = -0.15;
  if (angle < -Math.PI + 0.15) angle = -Math.PI + 0.15;

  const SPEED = 14;
  currentBubble.dx = Math.cos(angle) * SPEED;
  currentBubble.dy = Math.sin(angle) * SPEED;
  currentBubble.moving = true;
});

restartBtn.addEventListener("click", initGame);

// --- PHYSICS & COLLISIONS ---
function update() {
  if (gameOver || gameWon) return;

  for (let i = floatingAnimations.length - 1; i >= 0; i--) {
    let p = floatingAnimations[i];
    p.y += p.vy;
    p.vy += 0.5;
    p.alpha -= 0.02;
    if (p.alpha <= 0) floatingAnimations.splice(i, 1);
  }

  if (!currentBubble || !currentBubble.moving) return;

  currentBubble.x += currentBubble.dx;
  currentBubble.y += currentBubble.dy;

  if (currentBubble.x - RADIUS <= 0) {
    currentBubble.x = RADIUS;
    currentBubble.dx *= -1;
  } else if (currentBubble.x + RADIUS >= canvas.width) {
    currentBubble.x = canvas.width - RADIUS;
    currentBubble.dx *= -1;
  }

  if (currentBubble.y - RADIUS <= 0) {
    snapToGrid();
    return;
  }

  for (let r = 0; r < ROWS; r++) {
    let maxCols = (r % 2 === 1) ? COLS - 1 : COLS;
    for (let c = 0; c < maxCols; c++) {
      if (grid[r][c]) {
        let center = getTileCenter(r, c);
        let dist = Math.hypot(currentBubble.x - center.x, currentBubble.y - center.y);
        if (dist < DIAMETER - 2) {
          snapToGrid();
          return;
        }
      }
    }
  }
}

// --- GRID SNAPPING & MATCHING ---
function snapToGrid() {
  let { r, c } = getGridIndices(currentBubble.x, currentBubble.y);

  if (grid[r][c]) {
    let emptyNeighbor = null;
    let minDist = Infinity;
    getNeighbors(r, c).forEach(n => {
      if (!grid[n.r][n.c]) {
        let center = getTileCenter(n.r, n.c);
        let d = Math.hypot(currentBubble.x - center.x, currentBubble.y - center.y);
        if (d < minDist) {
          minDist = d;
          emptyNeighbor = n;
        }
      }
    });

    if (emptyNeighbor) {
      r = emptyNeighbor.r;
      c = emptyNeighbor.c;
    }
  }

  grid[r][c] = currentBubble.color;
  currentBubble.moving = false;

  let matchedCluster = getMatchedCluster(r, c, currentBubble.color);

  if (matchedCluster.length >= 3) {
    matchedCluster.forEach(pos => {
      grid[pos.r][pos.c] = null;
    });
    score += matchedCluster.length * 10;

    dropUnconnectedBubbles();

    if (isBoardCleared()) {
      gameWon = true;
      scoreEl.innerText = score;
      return;
    }
  } else {
    missCount++;
    missesEl.innerText = `${missCount} / 5`;

    if (missCount >= 5) {
      shiftGridDown();
      missCount = 0;
      missesEl.innerText = `0 / 5`;
    }
  }

  checkGameOver();

  if (!gameOver && !gameWon) {
    spawnNextBubble();
  }
}

function getMatchedCluster(startR, startC, targetColor) {
  let matches = [];
  let visited = Array.from({ length: ROWS }, () => []);
  let queue = [{ r: startR, c: startC }];
  visited[startR][startC] = true;

  while (queue.length > 0) {
    let { r, c } = queue.shift();
    matches.push({ r, c });

    getNeighbors(r, c).forEach(n => {
      if (!visited[n.r][n.c] && grid[n.r][n.c] && grid[n.r][n.c].name === targetColor.name) {
        visited[n.r][n.c] = true;
        queue.push(n);
      }
    });
  }
  return matches;
}

function dropUnconnectedBubbles() {
  let connectedToTop = Array.from({ length: ROWS }, () => []);
  let queue = [];

  for (let c = 0; c < COLS; c++) {
    if (grid[0][c]) {
      connectedToTop[0][c] = true;
      queue.push({ r: 0, c });
    }
  }

  while (queue.length > 0) {
    let { r, c } = queue.shift();

    getNeighbors(r, c).forEach(n => {
      if (!connectedToTop[n.r][n.c] && grid[n.r][n.c]) {
        connectedToTop[n.r][n.c] = true;
        queue.push(n);
      }
    });
  }

  let droppedCount = 0;
  for (let r = 0; r < ROWS; r++) {
    let maxCols = (r % 2 === 1) ? COLS - 1 : COLS;
    for (let c = 0; c < maxCols; c++) {
      if (grid[r][c] && !connectedToTop[r][c]) {
        let center = getTileCenter(r, c);
        floatingAnimations.push({
          x: center.x,
          y: center.y,
          vy: 2,
          alpha: 1.0,
          color: grid[r][c]
        });

        grid[r][c] = null;
        droppedCount++;
      }
    }
  }

  if (droppedCount > 0) {
    score += droppedCount * 20;
  }
  scoreEl.innerText = score;
}

function shiftGridDown() {
  for (let r = ROWS - 1; r > 0; r--) {
    grid[r] = [...grid[r - 1]];
  }

  grid[0] = [];
  for (let c = 0; c < COLS; c++) {
    grid[0][c] = getRandomColor();
  }
}

function isBoardCleared() {
  return grid.every(row => row.every(cell => cell === null));
}

function checkGameOver() {
  for (let c = 0; c < COLS; c++) {
    if (grid[ROWS - 1][c] !== null) {
      gameOver = true;
      return;
    }
  }
}

// --- RENDER FUNCTIONS ---
function drawBubble(x, y, colorObj, opacity = 1.0) {
  ctx.save();
  ctx.globalAlpha = opacity;
  
  ctx.beginPath();
  ctx.arc(x, y, RADIUS - 1, 0, Math.PI * 2);
  ctx.fillStyle = colorObj.fill;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = colorObj.stroke;
  ctx.stroke();

  let highlight = ctx.createRadialGradient(
    x - RADIUS / 3, y - RADIUS / 3, 1,
    x - RADIUS / 3, y - RADIUS / 3, RADIUS / 1.5
  );
  highlight.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
  highlight.addColorStop(1, 'rgba(255, 255, 255, 0)');

  ctx.beginPath();
  ctx.arc(x, y, RADIUS - 1, 0, Math.PI * 2);
  ctx.fillStyle = highlight;
  ctx.fill();

  ctx.restore();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let r = 0; r < ROWS; r++) {
    let maxCols = (r % 2 === 1) ? COLS - 1 : COLS;
    for (let c = 0; c < maxCols; c++) {
      if (grid[r][c]) {
        let center = getTileCenter(r, c);
        drawBubble(center.x, center.y, grid[r][c]);
      }
    }
  }

  floatingAnimations.forEach(p => {
    drawBubble(p.x, p.y, p.color, p.alpha);
  });

  if (!gameOver && !gameWon) {
    if (currentBubble && !currentBubble.moving) {
      ctx.beginPath();
      ctx.moveTo(currentBubble.x, currentBubble.y);
      ctx.lineTo(mousePos.x, mousePos.y);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.fillStyle = "#94a3b8";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("NEXT", 50, LAUNCHER_Y - 30);
    drawBubble(50, LAUNCHER_Y, nextBubble.color);

    if (currentBubble) {
      drawBubble(currentBubble.x, currentBubble.y, currentBubble.color);
    }
  }

  if (gameOver || gameWon) {
    ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.textAlign = "center";
    if (gameWon) {
      ctx.fillStyle = "#38bdf8";
      ctx.font = "bold 36px sans-serif";
      ctx.fillText("VICTORY!", canvas.width / 2, canvas.height / 2 - 20);
    } else {
      ctx.fillStyle = "#ef4444";
      ctx.font = "bold 36px sans-serif";
      ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 20);
    }

    ctx.fillStyle = "#f8fafc";
    ctx.font = "18px sans-serif";
    ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
  }
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

initGame();
gameLoop();
