const GAME_LIST = [
  {
    id: "minesweeper",
    name: "扫雷",
    subtitle: "经典益智，挑战脑力",
    themeColor: "#3B82F6",
    gradient: "linear-gradient(180deg, #EAF4FF 0%, #FFFFFF 100%)",
    available: true,
    visual: `
      <div class="mine-preview-grid">
        <span></span><span class="num blue">1</span><span class="num green">2</span><span></span>
        <span></span><span></span><span class="num blue">1</span><span class="flag-tile"></span>
        <span class="mine-dot"></span><span class="num green">1</span><span class="num red">3</span><span></span>
        <span></span><span class="flag-tile"></span><span></span><span></span>
      </div>
    `,
  },
  {
    id: "match3",
    name: "消消乐",
    subtitle: "欢乐消除，轻松解压",
    themeColor: "#A855F7",
    gradient: "linear-gradient(180deg, #F4ECFF 0%, #FFFFFF 100%)",
    available: true,
    visual: `
      <div class="match-preview-grid">
        <span class="tile bear"></span><span class="tile rabbit"></span><span class="tile chick"></span>
        <span class="tile frog"></span><span class="tile fox"></span><span class="tile berry"></span>
        <span class="tile chick"></span><span class="tile frog"></span><span class="tile rabbit"></span>
      </div>
    `,
  },
  {
    id: "link",
    name: "连连看",
    subtitle: "连线配对，考验眼力",
    themeColor: "#4CAF50",
    gradient: "linear-gradient(180deg, #EEF8EA 0%, #FFFFFF 100%)",
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

const MATCH3_SIZE = 8;
const MATCH3_MOVES = 30;
const MATCH3_TARGET = 1500;
const MATCH3_MODES = {
  tap: {
    label: "点点消",
    shortLabel: "点消",
    description: "点击相连的 2 个及以上同色方块即可消除，适合休闲解压。",
    readyText: "点击相连的同色方块即可消除，2 个起消，连消会获得更高分。",
    invalidText: "这组方块数量还不够，至少需要 2 个相连同色方块。",
    mechanic: "tap",
    minGroup: 2,
    moves: 36,
    target: 1800,
  },
  swap: {
    label: "经典三消",
    shortLabel: "三消",
    description: "交换相邻方块，形成 3 个及以上同色连线后消除。",
    readyText: "点击两个相邻方块进行交换，形成三个及以上同色方块即可消除。",
    invalidText: "交换后没有形成三连，方块已自动复位。",
    mechanic: "swap",
    minGroup: 3,
    moves: 30,
    target: MATCH3_TARGET,
  },
  challenge: {
    label: "限步挑战",
    shortLabel: "挑战",
    description: "更少步数、更高目标，适合追求连消和高分。",
    readyText: "限步挑战需要更谨慎地交换方块，优先制造四连、五连和连锁消除。",
    invalidText: "这一步没有形成有效消除，挑战模式会自动复位。",
    mechanic: "swap",
    minGroup: 3,
    moves: 20,
    target: 2200,
  },
};
const MATCH3_TYPES = [
  { id: "bear", icon: "🐻", label: "小熊" },
  { id: "rabbit", icon: "🐰", label: "兔兔" },
  { id: "chick", icon: "🐥", label: "小鸡" },
  { id: "frog", icon: "🐸", label: "青蛙" },
  { id: "fox", icon: "🦊", label: "狐狸" },
  { id: "berry", icon: "🍓", label: "草莓" },
];

const homeView = document.querySelector("#homeView");
const minesweeperView = document.querySelector("#minesweeperView");
const match3View = document.querySelector("#match3View");
const appShell = document.querySelector(".app-shell");
const gameListEl = document.querySelector("#gameList");
const backHomeButton = document.querySelector("#backHomeButton");
const backHomeFromMatchButton = document.querySelector("#backHomeFromMatchButton");
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
const matchBoardEl = document.querySelector("#matchBoard");
const matchScoreEl = document.querySelector("#matchScore");
const matchMovesEl = document.querySelector("#matchMoves");
const matchTargetEl = document.querySelector("#matchTarget");
const matchGoalTextEl = document.querySelector("#matchGoalText");
const matchStatusTitleEl = document.querySelector("#matchStatusTitle");
const matchStatusTextEl = document.querySelector("#matchStatusText");
const matchRestartButton = document.querySelector("#matchRestartButton");
const matchShuffleButton = document.querySelector("#matchShuffleButton");
const matchModeButtons = document.querySelectorAll(".match-mode-button");

let levelKey = "easy";
let cells = [];
let started = false;
let finished = false;
let timer = 0;
let timerId = null;
let soundOn = true;
let activeView = "home";
let viewTransitioning = false;
const VIEW_TRANSITION_MS = 460;
let matchBoard = [];
let selectedMatchIndex = null;
let matchScore = 0;
let matchModeKey = "tap";
let matchMoves = MATCH3_MODES[matchModeKey].moves;
let matchBusy = false;
let matchFinished = false;

function renderGameCards() {
  gameListEl.innerHTML = GAME_LIST.map((game) => `
    <article class="game-card ${game.available ? "" : "locked"}" data-game-id="${game.id}" style="--game-theme: ${game.themeColor}; --game-gradient: ${game.gradient};">
      <div class="game-visual" aria-hidden="true">${game.visual}</div>
      <div class="game-info">
        <h3>${game.name}</h3>
        <p>${game.subtitle}</p>
      </div>
      <button class="enter-button" type="button" aria-label="进入${game.name}" ${game.available ? "" : "disabled"}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </article>
  `).join("");

  gameListEl.querySelectorAll(".game-card").forEach((card) => {
    card.addEventListener("click", () => {
      const game = GAME_LIST.find((item) => item.id === card.dataset.gameId);
      if (!game?.available) return;
      if (game.id === "minesweeper") showMinesweeper();
      if (game.id === "match3") showMatch3();
    });
  });
}

function setViewHidden(view, hidden) {
  view.classList.toggle("hidden", hidden);
  view.setAttribute("aria-hidden", String(hidden));
}

function animateViewChange(nextView) {
  if (viewTransitioning || activeView === nextView) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const views = {
    home: homeView,
    minesweeper: minesweeperView,
    match3: match3View,
  };
  const fromView = views[activeView];
  const toView = views[nextView];
  const directionClass = nextView === "home" ? "slide-to-home" : "slide-to-game";

  viewTransitioning = true;
  appShell.classList.add("view-transitioning", directionClass);
  setViewHidden(toView, false);
  const transitionHeight = Math.max(fromView.offsetHeight, toView.offsetHeight, window.innerHeight);
  appShell.style.minHeight = `${transitionHeight}px`;
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });

  if (reduceMotion) {
    setViewHidden(fromView, true);
    appShell.style.minHeight = "";
    activeView = nextView;
    viewTransitioning = false;
    return;
  }

  window.setTimeout(() => {
    appShell.classList.remove("view-transitioning", directionClass);
    setViewHidden(fromView, true);
    setViewHidden(toView, false);
    appShell.style.minHeight = "";
    activeView = nextView;
    viewTransitioning = false;
  }, VIEW_TRANSITION_MS);
}

function showHome() {
  stopTimer();
  animateViewChange("home");
}

function showMinesweeper() {
  window.requestAnimationFrame(() => render());
  animateViewChange("minesweeper");
}

function showMatch3() {
  if (!matchBoard.length) resetMatch3();
  window.requestAnimationFrame(() => renderMatch3());
  animateViewChange("match3");
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

function matchIndex(row, col) {
  return row * MATCH3_SIZE + col;
}

function matchRow(index) {
  return Math.floor(index / MATCH3_SIZE);
}

function matchCol(index) {
  return index % MATCH3_SIZE;
}

function getMatchMode() {
  return MATCH3_MODES[matchModeKey] || MATCH3_MODES.tap;
}

function randomMatchType() {
  return MATCH3_TYPES[Math.floor(Math.random() * MATCH3_TYPES.length)].id;
}

function createMatchBoard(modeKey = matchModeKey) {
  const board = [];
  for (let row = 0; row < MATCH3_SIZE; row += 1) {
    for (let col = 0; col < MATCH3_SIZE; col += 1) {
      let type = randomMatchType();
      let guard = 0;
      while (
        guard < 20 &&
        ((col >= 2 && board[matchIndex(row, col - 1)] === type && board[matchIndex(row, col - 2)] === type) ||
          (row >= 2 && board[matchIndex(row - 1, col)] === type && board[matchIndex(row - 2, col)] === type))
      ) {
        type = randomMatchType();
        guard += 1;
      }
      board.push(type);
    }
  }
  return board;
}

function createPlayableMatchBoard(modeKey = matchModeKey) {
  const mode = MATCH3_MODES[modeKey] || MATCH3_MODES.tap;
  let board = createMatchBoard(modeKey);
  let guard = 0;

  while (guard < 80) {
    matchBoard = board;
    if (mode.mechanic === "tap" && hasConnectedGroup(mode.minGroup)) return board;
    if (mode.mechanic === "swap" && hasValidSwapMove()) return board;
    board = createMatchBoard(modeKey);
    guard += 1;
  }

  return board;
}

function getMatchType(typeId) {
  return MATCH3_TYPES.find((type) => type.id === typeId) || MATCH3_TYPES[0];
}

function isAdjacentMatchCell(first, second) {
  const rowGap = Math.abs(matchRow(first) - matchRow(second));
  const colGap = Math.abs(matchCol(first) - matchCol(second));
  return rowGap + colGap === 1;
}

function swapMatchCells(first, second) {
  [matchBoard[first], matchBoard[second]] = [matchBoard[second], matchBoard[first]];
}

function getOrthogonalNeighbors(index) {
  const row = matchRow(index);
  const col = matchCol(index);
  const list = [];
  if (row > 0) list.push(matchIndex(row - 1, col));
  if (row < MATCH3_SIZE - 1) list.push(matchIndex(row + 1, col));
  if (col > 0) list.push(matchIndex(row, col - 1));
  if (col < MATCH3_SIZE - 1) list.push(matchIndex(row, col + 1));
  return list;
}

function findConnectedGroup(startIndex) {
  const typeId = matchBoard[startIndex];
  if (!typeId) return [];

  const queue = [startIndex];
  const seen = new Set();

  while (queue.length) {
    const index = queue.shift();
    if (seen.has(index)) continue;
    seen.add(index);

    getOrthogonalNeighbors(index).forEach((nextIndex) => {
      if (!seen.has(nextIndex) && matchBoard[nextIndex] === typeId) queue.push(nextIndex);
    });
  }

  return [...seen];
}

function hasConnectedGroup(minGroup = 2) {
  for (let index = 0; index < matchBoard.length; index += 1) {
    if (findConnectedGroup(index).length >= minGroup) return true;
  }
  return false;
}

function hasValidSwapMove() {
  for (let index = 0; index < matchBoard.length; index += 1) {
    const neighbors = getOrthogonalNeighbors(index);
    for (const nextIndex of neighbors) {
      if (nextIndex < index) continue;
      swapMatchCells(index, nextIndex);
      const valid = findMatchGroups().length > 0;
      swapMatchCells(index, nextIndex);
      if (valid) return true;
    }
  }
  return false;
}

function findMatchGroups() {
  const groups = [];

  for (let row = 0; row < MATCH3_SIZE; row += 1) {
    let runStart = 0;
    for (let col = 1; col <= MATCH3_SIZE; col += 1) {
      const current = col < MATCH3_SIZE ? matchBoard[matchIndex(row, col)] : null;
      const previous = matchBoard[matchIndex(row, col - 1)];
      if (current !== previous) {
        if (previous && col - runStart >= 3) {
          groups.push(Array.from({ length: col - runStart }, (_, offset) => matchIndex(row, runStart + offset)));
        }
        runStart = col;
      }
    }
  }

  for (let col = 0; col < MATCH3_SIZE; col += 1) {
    let runStart = 0;
    for (let row = 1; row <= MATCH3_SIZE; row += 1) {
      const current = row < MATCH3_SIZE ? matchBoard[matchIndex(row, col)] : null;
      const previous = matchBoard[matchIndex(row - 1, col)];
      if (current !== previous) {
        if (previous && row - runStart >= 3) {
          groups.push(Array.from({ length: row - runStart }, (_, offset) => matchIndex(runStart + offset, col)));
        }
        runStart = row;
      }
    }
  }

  return groups;
}

function uniqueMatchedIndexes(groups) {
  return [...new Set(groups.flat())];
}

function collapseMatchBoard() {
  for (let col = 0; col < MATCH3_SIZE; col += 1) {
    const column = [];
    for (let row = MATCH3_SIZE - 1; row >= 0; row -= 1) {
      const value = matchBoard[matchIndex(row, col)];
      if (value) column.push(value);
    }
    for (let row = MATCH3_SIZE - 1; row >= 0; row -= 1) {
      matchBoard[matchIndex(row, col)] = column.shift() || randomMatchType();
    }
  }
}

function updateMatchMetrics() {
  const mode = getMatchMode();
  matchScoreEl.textContent = String(matchScore);
  matchMovesEl.textContent = String(matchMoves).padStart(2, "0");
  matchTargetEl.textContent = String(mode.target);
  if (matchGoalTextEl) matchGoalTextEl.textContent = `${mode.target} 分`;
}

function setMatchStatus(type, cleared = 0) {
  const mode = getMatchMode();
  match3View.classList.toggle("win", type === "win");
  match3View.classList.toggle("lost", type === "lost");

  if (type === "ready") {
    matchStatusTitleEl.textContent = mode.label;
    matchStatusTextEl.textContent = mode.readyText;
  } else if (type === "cleared") {
    matchStatusTitleEl.textContent = "连消成功";
    matchStatusTextEl.textContent = `本轮消除了 ${cleared} 个方块，继续寻找更高分组合。`;
  } else if (type === "invalid") {
    matchStatusTitleEl.textContent = "这步无效";
    matchStatusTextEl.textContent = mode.invalidText;
  } else if (type === "win") {
    matchStatusTitleEl.textContent = "挑战完成";
    matchStatusTextEl.textContent = "目标分数已达成，可以重新开局继续挑战更高分。";
  } else if (type === "lost") {
    matchStatusTitleEl.textContent = "步数用完";
    matchStatusTextEl.textContent = "还差一点点，重新开始会生成新的方块组合。";
  }
}

function showMatchComboBadge(cleared, combo) {
  const wrap = matchBoardEl.parentElement;
  if (!wrap) return;

  wrap.querySelector(".match-combo-badge")?.remove();
  const badge = document.createElement("div");
  badge.className = "match-combo-badge";
  badge.textContent = combo > 1 ? `连消 x${combo}  +${cleared * 30 * combo}` : `+${cleared * 30}`;
  wrap.appendChild(badge);
  window.setTimeout(() => badge.remove(), 820);
}

function renderMatch3(highlightIndexes = [], options = {}) {
  const highlights = new Set(highlightIndexes);
  const highlightOrder = new Map(highlightIndexes.map((index, order) => [index, order]));
  const mode = getMatchMode();
  match3View.dataset.mode = matchModeKey;
  matchBoardEl.innerHTML = "";
  matchBoardEl.classList.toggle("is-clearing", highlights.size > 0);
  matchBoardEl.classList.toggle("is-refilling", Boolean(options.refilling));
  matchBoardEl.style.gridTemplateColumns = `repeat(${MATCH3_SIZE}, 1fr)`;

  matchBoard.forEach((typeId, index) => {
    const type = getMatchType(typeId);
    const button = document.createElement("button");
    button.type = "button";
    button.className = `match-cell candy-${type.id}`;
    button.dataset.index = index;
    button.textContent = type.icon;
    button.setAttribute("aria-label", `${matchRow(index) + 1} 行 ${matchCol(index) + 1} 列，${type.label}，${mode.shortLabel}模式`);
    button.classList.toggle("selected", selectedMatchIndex === index);
    button.classList.toggle("clearing", highlights.has(index));
    button.classList.toggle("drop-in", Boolean(options.refilling));
    if (highlights.has(index)) {
      button.style.setProperty("--clear-delay", `${(highlightOrder.get(index) || 0) * 18}ms`);
    }
    if (options.refilling) {
      button.style.setProperty("--drop-delay", `${(MATCH3_SIZE - matchRow(index)) * 12}ms`);
    }
    button.addEventListener("click", () => handleMatchCellClick(index));
    matchBoardEl.appendChild(button);
  });

  updateMatchMetrics();
}

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function resolveMatchBoard(initialGroups) {
  const mode = getMatchMode();
  let groups = initialGroups;
  let combo = 1;
  let totalCleared = 0;

  while (groups.length) {
    const matched = uniqueMatchedIndexes(groups);
    totalCleared += matched.length;
    matchScore += matched.length * 30 * combo;
    showMatchComboBadge(matched.length, combo);
    renderMatch3(matched);
    await wait(420);
    matched.forEach((index) => {
      matchBoard[index] = null;
    });
    collapseMatchBoard();
    renderMatch3([], { refilling: true });
    await wait(300);
    groups = findMatchGroups();
    combo += 1;
  }

  if (matchScore >= mode.target) {
    matchFinished = true;
    setMatchStatus("win");
  } else if (matchMoves <= 0) {
    matchFinished = true;
    setMatchStatus("lost");
  } else {
    setMatchStatus("cleared", totalCleared);
  }
  renderMatch3();
}

async function handleMatchCellClick(index) {
  if (matchBusy || matchFinished) return;
  const mode = getMatchMode();

  if (mode.mechanic === "tap") {
    const group = findConnectedGroup(index);
    selectedMatchIndex = null;

    if (group.length < mode.minGroup) {
      setMatchStatus("invalid");
      renderMatch3([index]);
      return;
    }

    matchBusy = true;
    matchMoves -= 1;
    await resolveMatchBoard([group]);
    matchBusy = false;
    return;
  }

  if (selectedMatchIndex === null) {
    selectedMatchIndex = index;
    renderMatch3();
    return;
  }

  if (selectedMatchIndex === index) {
    selectedMatchIndex = null;
    renderMatch3();
    return;
  }

  if (!isAdjacentMatchCell(selectedMatchIndex, index)) {
    selectedMatchIndex = index;
    renderMatch3();
    return;
  }

  matchBusy = true;
  const first = selectedMatchIndex;
  const second = index;
  selectedMatchIndex = null;
  swapMatchCells(first, second);
  renderMatch3([first, second]);
  await wait(120);

  const groups = findMatchGroups();
  if (!groups.length) {
    swapMatchCells(first, second);
    setMatchStatus("invalid");
    renderMatch3([first, second]);
    await wait(180);
    renderMatch3();
    matchBusy = false;
    return;
  }

  matchMoves -= 1;
  await resolveMatchBoard(groups);
  matchBusy = false;
}

function shuffleMatchBoard() {
  if (matchBusy) return;
  selectedMatchIndex = null;
  matchBoard = createPlayableMatchBoard();
  setMatchStatus("ready");
  renderMatch3();
}

function renderMatchModeButtons() {
  matchModeButtons.forEach((button) => {
    const mode = MATCH3_MODES[button.dataset.matchMode] || MATCH3_MODES.tap;
    button.classList.toggle("active", button.dataset.matchMode === matchModeKey);
    button.setAttribute("aria-pressed", String(button.dataset.matchMode === matchModeKey));
    button.title = mode.description;
  });
}

function resetMatch3(nextMode = matchModeKey) {
  matchModeKey = nextMode;
  const mode = getMatchMode();
  matchBoard = createPlayableMatchBoard(matchModeKey);
  selectedMatchIndex = null;
  matchScore = 0;
  matchMoves = mode.moves;
  matchBusy = false;
  matchFinished = false;
  match3View.classList.remove("win", "lost");
  renderMatchModeButtons();
  setMatchStatus("ready");
  renderMatch3();
}

difficultyButtons.forEach((button) => {
  button.addEventListener("click", () => resetGame(button.dataset.level));
});

restartButton.addEventListener("click", () => resetGame());
backHomeButton.addEventListener("click", showHome);
backHomeFromMatchButton.addEventListener("click", showHome);
matchRestartButton.addEventListener("click", () => resetMatch3());
matchShuffleButton.addEventListener("click", shuffleMatchBoard);
matchModeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (matchBusy) return;
    resetMatch3(button.dataset.matchMode);
  });
});

soundButton.addEventListener("click", () => {
  soundOn = !soundOn;
  soundButton.textContent = `声音：${soundOn ? "开" : "关"}`;
});

window.addEventListener("resize", render);

setViewHidden(homeView, false);
setViewHidden(minesweeperView, true);
setViewHidden(match3View, true);
renderGameCards();
resetGame();
resetMatch3();
