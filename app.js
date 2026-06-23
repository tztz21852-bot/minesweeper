const GAME_LIST = [
  {
    id: "minesweeper",
    name: "扫雷",
    description: "经典益智，挑战脑力",
    tone: "blue",
    available: true,
    visual: `
      <div class="mine-preview-grid">
        <span></span><span class="num blue">1</span><span class="num green">2</span><span></span>
        <span></span><span></span><span class="num blue">1</span><span class="avatar-tile"></span>
        <span class="mine-dot"></span><span class="num green">1</span><span class="num red">3</span><span></span>
        <span></span><span class="avatar-tile"></span><span></span><span></span>
      </div>
    `,
  },
  {
    id: "match",
    name: "消消乐",
    description: "欢乐消除，轻松解压",
    tone: "purple",
    available: false,
    visual: `
      <div class="match-preview-grid">
        <span class="tile red">♥</span><span class="tile yellow">★</span><span class="tile green">♣</span>
        <span class="tile blue">●</span><span class="tile red">♥</span><span class="tile purple">●</span>
        <span class="tile yellow">★</span><span class="tile blue">●</span><span class="tile purple">●</span>
      </div>
    `,
  },
  {
    id: "link",
    name: "连连看",
    description: "连线配对，考验眼力",
    tone: "green",
    available: false,
    visual: `
      <div class="link-preview">
        <span class="fruit strawberry">🍓</span>
        <span class="fruit avocado">🥑</span>
        <span class="fruit cherry one">🍒</span>
        <span class="fruit cherry two">🍒</span>
        <i class="path h1"></i><i class="path v1"></i><i class="path h2"></i><i class="path v2"></i>
      </div>
    `,
  },
];

const LEVELS = {
  easy: { label: "初级", rows: 9, cols: 9, mines: 10 },
  medium: { label: "中级", rows: 16, cols: 16, mines: 40 },
  expert: { label: "高级", rows: 16, cols: 30, mines: 99 },
};

const homeView = document.querySelector("#homeView");
const minesweeperView = document.querySelector("#minesweeperView");
const gameListEl = document.querySelector("#gameList");
const backHomeButton = document.querySelector("#backHomeButton");
const boardEl = document.querySelector("#board");
const mineCountEl = document.querySelector("#mineCount");
const timerEl = document.querySelector("#timer");
const bestTimeEl = document.querySelector("#bestTime");
const statusTitleEl = document.querySelector("#statusTitle");
const statusTextEl = document.querySelector("#statusText");
const restartButton = document.querySelector("#restartButton");
const faceIcon = document.querySelector("#faceIcon");
const difficultyButtons = document.querySelectorAll(".difficulty-button");
const flagModeEl = document.querySelector("#flagMode");
const soundButton = document.querySelector("#soundButton");
const shell = document.querySelector(".game-view");

let levelKey = "easy";
let cells = [];
let started = false;
let finished = false;
let timer = 0;
let timerId = null;
let soundOn = true;

function renderGameCards() {
  gameListEl.innerHTML = GAME_LIST.map((game) => `
    <article class="game-card ${game.tone} ${game.available ? "" : "locked"}" data-game-id="${game.id}">
      <div class="game-visual" aria-hidden="true">${game.visual}</div>
      <div class="game-info">
        <h3>${game.name}</h3>
        <p>${game.description}</p>
      </div>
      <button class="enter-button" type="button" aria-label="进入${game.name}" ${game.available ? "" : "disabled"}>›</button>
    </article>
  `).join("");

  gameListEl.querySelectorAll(".game-card").forEach((card) => {
    card.addEventListener("click", () => {
      const game = GAME_LIST.find((item) => item.id === card.dataset.gameId);
      if (game?.available) showMinesweeper();
    });
  });
}

function showHome() {
  stopTimer();
  homeView.classList.remove("hidden");
  minesweeperView.classList.add("hidden");
}

function showMinesweeper() {
  homeView.classList.add("hidden");
  minesweeperView.classList.remove("hidden");
  window.requestAnimationFrame(() => render());
}

function pad(value) {
  return String(value).padStart(3, "0");
}

function indexOf(row, col) {
  return row * LEVELS[levelKey].cols + col;
}

function neighbors(row, col) {
  const list = [];
  for (let dr = -1; dr <= 1; dr += 1) {
    for (let dc = -1; dc <= 1; dc += 1) {
      if (dr === 0 && dc === 0) continue;
      const nr = row + dr;
      const nc = col + dc;
      if (nr >= 0 && nr < LEVELS[levelKey].rows && nc >= 0 && nc < LEVELS[levelKey].cols) {
        list.push(indexOf(nr, nc));
      }
    }
  }
  return list;
}

function createCells() {
  const { rows, cols } = LEVELS[levelKey];
  return Array.from({ length: rows * cols }, (_, id) => ({
    id,
    row: Math.floor(id / cols),
    col: id % cols,
    mine: false,
    adjacent: 0,
    revealed: false,
    flagged: false,
    exploded: false,
  }));
}

function placeMines(firstId) {
  const { mines } = LEVELS[levelKey];
  const safe = new Set([firstId, ...neighbors(cells[firstId].row, cells[firstId].col)]);
  const candidates = cells.map((cell) => cell.id).filter((id) => !safe.has(id));

  for (let i = candidates.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }

  candidates.slice(0, mines).forEach((id) => {
    cells[id].mine = true;
  });

  cells.forEach((cell) => {
    if (!cell.mine) {
      cell.adjacent = neighbors(cell.row, cell.col).filter((id) => cells[id].mine).length;
    }
  });
}

function startTimer() {
  if (timerId) return;
  timerId = window.setInterval(() => {
    timer += 1;
    timerEl.textContent = pad(Math.min(timer, 999));
  }, 1000);
}

function stopTimer() {
  window.clearInterval(timerId);
  timerId = null;
}

function flaggedCount() {
  return cells.filter((cell) => cell.flagged).length;
}

function updateMetrics() {
  const remaining = LEVELS[levelKey].mines - flaggedCount();
  mineCountEl.textContent = pad(Math.max(remaining, 0));
  timerEl.textContent = pad(timer);
  bestTimeEl.textContent = getBestTime() ? `${getBestTime()} 秒` : "--";
}

function getBestTime() {
  return window.localStorage.getItem(`minesweeper-best-${levelKey}`);
}

function saveBestTime() {
  const current = Number(getBestTime() || Infinity);
  if (timer < current) {
    window.localStorage.setItem(`minesweeper-best-${levelKey}`, String(timer));
  }
}

function setStatus(type) {
  shell.classList.toggle("win", type === "win");
  shell.classList.toggle("lost", type === "lost");

  if (type === "playing") {
    faceIcon.textContent = "🙂";
    statusTitleEl.textContent = "正在扫雷";
    statusTextEl.textContent = "稳一点，先从数字边缘推理。右键可以插旗，手机上建议开启旗帜模式。";
  } else if (type === "win") {
    faceIcon.textContent = "✓";
    statusTitleEl.textContent = "成功排雷";
    statusTextEl.textContent = `漂亮，用时 ${timer} 秒。切换难度还能继续挑战。`;
  } else if (type === "lost") {
    faceIcon.textContent = "×";
    statusTitleEl.textContent = "踩到地雷";
    statusTextEl.textContent = "没关系，重新开始会生成新的雷区。第一步永远安全。";
  } else {
    faceIcon.textContent = "🙂";
    statusTitleEl.textContent = "准备开始";
    statusTextEl.textContent = "点击任意格子开始计时。左键翻开，右键插旗；手机上可开启旗帜模式。";
  }
}

function getCellSizing(cols) {
  const isPhone = window.matchMedia("(max-width: 560px)").matches;
  const wrapWidth = boardEl.parentElement?.clientWidth || window.innerWidth;
  const availableWidth = Math.min(wrapWidth - 28, isPhone ? window.innerWidth - 34 : 840);
  const maxCell = isPhone ? { easy: 36, medium: 27, expert: 23 }[levelKey] : levelKey === "expert" ? 28 : 42;
  const minCell = isPhone ? { easy: 30, medium: 22, expert: 18 }[levelKey] : levelKey === "expert" ? 22 : 30;
  const gap = isPhone ? 3 : 4;
  const padding = isPhone ? 8 : 10;
  const fitted = Math.floor((availableWidth - padding * 2 - gap * (cols - 1)) / cols);
  return {
    cellSize: Math.max(minCell, Math.min(maxCell, fitted)),
    gap,
    padding,
  };
}

function render() {
  const { cols } = LEVELS[levelKey];
  const { cellSize, gap, padding } = getCellSizing(cols);

  boardEl.style.setProperty("--cell-size", `${cellSize}px`);
  boardEl.style.setProperty("--board-gap", `${gap}px`);
  boardEl.style.setProperty("--board-padding", `${padding}px`);
  boardEl.style.gridTemplateColumns = `repeat(${cols}, var(--cell-size))`;
  boardEl.innerHTML = "";

  cells.forEach((cell) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "cell";
    button.dataset.id = cell.id;
    button.setAttribute("aria-label", `${cell.row + 1} 行 ${cell.col + 1} 列`);

    if (cell.revealed) {
      button.classList.add("revealed");
      if (cell.mine) {
        button.classList.add(cell.exploded ? "mine-hit" : "mine-visible");
      } else if (cell.adjacent > 0) {
        button.textContent = cell.adjacent;
        button.classList.add(`n${cell.adjacent}`);
      }
    } else if (cell.flagged) {
      button.classList.add("flagged");
    }

    button.addEventListener("click", () => handleCellClick(cell.id));
    button.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      toggleFlag(cell.id);
    });
    boardEl.appendChild(button);
  });
}

function revealEmptyFrom(startId) {
  const queue = [startId];
  const seen = new Set();

  while (queue.length) {
    const id = queue.shift();
    if (seen.has(id)) continue;
    seen.add(id);

    const cell = cells[id];
    if (cell.flagged || cell.revealed) continue;

    cell.revealed = true;
    if (cell.adjacent === 0) {
      neighbors(cell.row, cell.col).forEach((neighborId) => {
        if (!seen.has(neighborId) && !cells[neighborId].mine) queue.push(neighborId);
      });
    }
  }
}

function handleCellClick(id) {
  if (finished) return;
  if (flagModeEl.checked) {
    toggleFlag(id);
    return;
  }

  const cell = cells[id];
  if (cell.flagged || cell.revealed) return;

  if (!started) {
    started = true;
    placeMines(id);
    startTimer();
    setStatus("playing");
  }

  if (cell.mine) {
    loseGame(id);
    return;
  }

  if (cell.adjacent === 0) {
    revealEmptyFrom(id);
  } else {
    cell.revealed = true;
  }

  checkWin();
  render();
  updateMetrics();
}

function toggleFlag(id) {
  if (finished) return;
  const cell = cells[id];
  if (cell.revealed) return;
  cell.flagged = !cell.flagged;
  render();
  updateMetrics();
}

function loseGame(id) {
  finished = true;
  stopTimer();
  cells[id].exploded = true;
  cells.forEach((cell) => {
    if (cell.mine) cell.revealed = true;
  });
  setStatus("lost");
  render();
}

function checkWin() {
  const safeCells = cells.filter((cell) => !cell.mine);
  if (safeCells.every((cell) => cell.revealed)) {
    finished = true;
    stopTimer();
    cells.forEach((cell) => {
      if (cell.mine) cell.flagged = true;
    });
    saveBestTime();
    setStatus("win");
  }
}

function resetGame(nextLevel = levelKey) {
  levelKey = nextLevel;
  cells = createCells();
  started = false;
  finished = false;
  timer = 0;
  stopTimer();
  flagModeEl.checked = false;
  difficultyButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.level === levelKey);
  });
  setStatus("ready");
  updateMetrics();
  render();
}

difficultyButtons.forEach((button) => {
  button.addEventListener("click", () => resetGame(button.dataset.level));
});

restartButton.addEventListener("click", () => resetGame());
backHomeButton.addEventListener("click", showHome);

soundButton.addEventListener("click", () => {
  soundOn = !soundOn;
  soundButton.textContent = `声音：${soundOn ? "开" : "关"}`;
});

window.addEventListener("resize", render);

renderGameCards();
resetGame();
