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
    available: true,
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

const LINK_ROWS = 8;
const LINK_COLS = 10;
const LINK_TYPES = [
  { id: "sun", icon: "☀", label: "太阳" },
  { id: "heart", icon: "♥", label: "爱心" },
  { id: "star", icon: "★", label: "星星" },
  { id: "leaf", icon: "●", label: "绿珠" },
  { id: "drop", icon: "●", label: "水滴" },
  { id: "gem", icon: "◆", label: "宝石" },
  { id: "moon", icon: "◐", label: "月亮" },
  { id: "flower", icon: "✿", label: "花朵" },
  { id: "clover", icon: "♣", label: "四叶草" },
  { id: "spark", icon: "✦", label: "闪光" },
];

const homeView = document.querySelector("#homeView");
const minesweeperView = document.querySelector("#minesweeperView");
const match3View = document.querySelector("#match3View");
const linkView = document.querySelector("#linkView");
const appShell = document.querySelector(".app-shell");
const gameListEl = document.querySelector("#gameList");
const backHomeButton = document.querySelector("#backHomeButton");
const backHomeFromMatchButton = document.querySelector("#backHomeFromMatchButton");
const backHomeFromLinkButton = document.querySelector("#backHomeFromLinkButton");
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
const linkBoardEl = document.querySelector("#linkBoard");
const linkLightningEl = document.querySelector("#linkLightning");
const linkScoreEl = document.querySelector("#linkScore");
const linkComboEl = document.querySelector("#linkCombo");
const linkRemainEl = document.querySelector("#linkRemain");
const linkRemainMetricEl = document.querySelector("#linkRemainMetric");
const linkStatusTitleEl = document.querySelector("#linkStatusTitle");
const linkStatusTextEl = document.querySelector("#linkStatusText");
const linkRestartButton = document.querySelector("#linkRestartButton");
const linkShuffleButton = document.querySelector("#linkShuffleButton");

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
let linkBoard = [];
let selectedLinkIndex = null;
let linkScore = 0;
let linkCombo = 0;
let linkBusy = false;
let linkFinished = false;

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
      if (game.id === "link") showLink();
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
    link: linkView,
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

function showLink() {
  if (!linkBoard.length) resetLink();
  window.requestAnimationFrame(() => renderLink());
  animateViewChange("link");
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

function indexesInMatchedColumns(indexes) {
  const columns = new Set(indexes.map((index) => matchCol(index)));
  const affected = [];

  columns.forEach((col) => {
    for (let row = 0; row < MATCH3_SIZE; row += 1) {
      affected.push(matchIndex(row, col));
    }
  });

  return affected;
}

function renderMatch3(highlightIndexes = [], options = {}) {
  const highlights = new Set(highlightIndexes);
  const highlightOrder = new Map(highlightIndexes.map((index, order) => [index, order]));
  const refillIndexes = new Set(options.refillIndexes || []);
  const invalidIndexes = new Set(options.invalidIndexes || []);
  const activeIndexes = new Set(options.activeIndexes || []);
  const mode = getMatchMode();
  match3View.dataset.mode = matchModeKey;
  matchBoardEl.classList.toggle("is-clearing", highlights.size > 0);
  matchBoardEl.classList.toggle("is-refilling", refillIndexes.size > 0);
  matchBoardEl.style.gridTemplateColumns = `repeat(${MATCH3_SIZE}, 1fr)`;
  const fragment = document.createDocumentFragment();

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
    button.classList.toggle("drop-in", refillIndexes.has(index));
    button.classList.toggle("invalid", invalidIndexes.has(index));
    button.classList.toggle("swapping", activeIndexes.has(index));
    if (highlights.has(index)) {
      button.style.setProperty("--clear-delay", `${(highlightOrder.get(index) || 0) * 18}ms`);
    }
    if (refillIndexes.has(index)) {
      button.style.setProperty("--drop-delay", `${(MATCH3_SIZE - matchRow(index)) * 12}ms`);
    }
    button.addEventListener("click", () => handleMatchCellClick(index));
    fragment.appendChild(button);
  });

  matchBoardEl.replaceChildren(fragment);
  updateMatchMetrics();
}

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function showInvalidMatchFeedback(indexes) {
  setMatchStatus("invalid");
  renderMatch3([], { invalidIndexes: indexes });
  await wait(240);
  renderMatch3();
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
    await wait(480);
    matched.forEach((index) => {
      matchBoard[index] = null;
    });
    const refillIndexes = indexesInMatchedColumns(matched);
    collapseMatchBoard();
    renderMatch3([], { refillIndexes });
    await wait(220);
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
      matchBusy = true;
      await showInvalidMatchFeedback([index]);
      matchBusy = false;
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
  renderMatch3([], { activeIndexes: [first, second] });
  await wait(120);

  const groups = findMatchGroups();
  if (!groups.length) {
    swapMatchCells(first, second);
    await showInvalidMatchFeedback([first, second]);
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

function linkIndex(row, col) {
  return row * LINK_COLS + col;
}

function linkRow(index) {
  return Math.floor(index / LINK_COLS);
}

function linkCol(index) {
  return index % LINK_COLS;
}

function getLinkType(typeId) {
  return LINK_TYPES.find((type) => type.id === typeId) || LINK_TYPES[0];
}

function shuffleList(list) {
  const result = [...list];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function createLinkBoardFromValues(values) {
  const pairs = Array.from({ length: (LINK_ROWS * LINK_COLS) / 2 }, (_, index) => {
    const type = LINK_TYPES[index % LINK_TYPES.length].id;
    return [type, type];
  }).flat();
  return shuffleList(values || pairs);
}

function createPlayableLinkBoard(values = null) {
  let board = createLinkBoardFromValues(values);
  let guard = 0;

  while (guard < 120) {
    linkBoard = board;
    if (hasAvailableLinkMove()) return board;
    board = createLinkBoardFromValues(values || board.filter(Boolean));
    guard += 1;
  }

  return board;
}

function isLinkPointInside(row, col) {
  return row >= 0 && row < LINK_ROWS && col >= 0 && col < LINK_COLS;
}

function isLinkPointBlocked(row, col, firstIndex, secondIndex) {
  if (!isLinkPointInside(row, col)) return false;
  const index = linkIndex(row, col);
  return index !== firstIndex && index !== secondIndex && Boolean(linkBoard[index]);
}

function compressLinkPath(path) {
  if (path.length <= 2) return path;
  const result = [path[0]];

  for (let i = 1; i < path.length - 1; i += 1) {
    const prev = result[result.length - 1];
    const current = path[i];
    const next = path[i + 1];
    const sameRow = prev.row === current.row && current.row === next.row;
    const sameCol = prev.col === current.col && current.col === next.col;
    if (!sameRow && !sameCol) result.push(current);
  }

  result.push(path[path.length - 1]);
  return result;
}

function findLinkPath(firstIndex, secondIndex) {
  if (firstIndex === secondIndex) return null;
  if (!linkBoard[firstIndex] || !linkBoard[secondIndex]) return null;
  if (linkBoard[firstIndex] !== linkBoard[secondIndex]) return null;

  const start = { row: linkRow(firstIndex), col: linkCol(firstIndex) };
  const end = { row: linkRow(secondIndex), col: linkCol(secondIndex) };
  const directions = [
    { row: -1, col: 0, key: "up" },
    { row: 1, col: 0, key: "down" },
    { row: 0, col: -1, key: "left" },
    { row: 0, col: 1, key: "right" },
  ];
  const queue = [{ ...start, direction: null, turns: 0, path: [start] }];
  const best = new Map();

  while (queue.length) {
    const current = queue.shift();
    if (current.row === end.row && current.col === end.col) {
      return compressLinkPath(current.path);
    }

    directions.forEach((direction) => {
      const row = current.row + direction.row;
      const col = current.col + direction.col;
      if (row < -1 || row > LINK_ROWS || col < -1 || col > LINK_COLS) return;
      const turns = current.direction && current.direction !== direction.key ? current.turns + 1 : current.turns;
      if (turns > 2) return;
      if (isLinkPointBlocked(row, col, firstIndex, secondIndex)) return;

      const stateKey = `${row},${col},${direction.key}`;
      if (best.has(stateKey) && best.get(stateKey) <= turns) return;
      best.set(stateKey, turns);
      queue.push({
        row,
        col,
        direction: direction.key,
        turns,
        path: [...current.path, { row, col }],
      });
    });
  }

  return null;
}

function hasAvailableLinkMove() {
  for (let first = 0; first < linkBoard.length; first += 1) {
    if (!linkBoard[first]) continue;
    for (let second = first + 1; second < linkBoard.length; second += 1) {
      if (linkBoard[first] === linkBoard[second] && findLinkPath(first, second)) return true;
    }
  }
  return false;
}

function updateLinkMetrics() {
  const remain = linkBoard.filter(Boolean).length;
  linkScoreEl.textContent = String(linkScore);
  linkComboEl.textContent = String(linkCombo);
  linkRemainEl.textContent = String(remain);
  linkRemainMetricEl.textContent = String(remain);
}

function setLinkStatus(type) {
  linkView.classList.toggle("win", type === "win");

  if (type === "ready") {
    linkStatusTitleEl.textContent = "准备连线";
    linkStatusTextEl.textContent = "点击两个相同图案，路径最多两次拐弯且不能穿过其他方块，即可触发闪电消除。";
  } else if (type === "selected") {
    linkStatusTitleEl.textContent = "已选中";
    linkStatusTextEl.textContent = "继续点击相同图案，系统会判断是否能用两次以内拐弯连接。";
  } else if (type === "invalid") {
    linkStatusTitleEl.textContent = "连接失败";
    linkStatusTextEl.textContent = "两个方块需要相同，并且连接路径不能超过两次拐弯或穿过其他方块。";
  } else if (type === "cleared") {
    linkStatusTitleEl.textContent = "闪电消除";
    linkStatusTextEl.textContent = "连接成功，继续寻找下一对可以连通的相同方块。";
  } else if (type === "reshuffle") {
    linkStatusTitleEl.textContent = "已自动洗牌";
    linkStatusTextEl.textContent = "当前局面没有可连接组合，已保留剩余方块并重新排列。";
  } else if (type === "win") {
    linkStatusTitleEl.textContent = "挑战完成";
    linkStatusTextEl.textContent = "全部方块已消除，漂亮！可以重新开始挑战更快通关。";
  }
}

function renderLink(options = {}) {
  const selected = selectedLinkIndex;
  const invalidIndexes = new Set(options.invalidIndexes || []);
  const clearingIndexes = new Set(options.clearingIndexes || []);
  const strikingIndexes = new Set(options.strikingIndexes || []);
  const fragment = document.createDocumentFragment();

  linkBoardEl.style.gridTemplateColumns = `repeat(${LINK_COLS}, 1fr)`;
  linkBoard.forEach((typeId, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "link-cell";
    button.dataset.index = index;

    if (!typeId) {
      button.classList.add("empty");
      button.disabled = true;
    } else {
      const type = getLinkType(typeId);
      button.classList.add(`tile-${type.id}`);
      button.textContent = type.icon;
      button.setAttribute("aria-label", `${linkRow(index) + 1} 行 ${linkCol(index) + 1} 列，${type.label}`);
      button.classList.toggle("selected", selected === index);
      button.classList.toggle("invalid", invalidIndexes.has(index));
      button.classList.toggle("clearing", clearingIndexes.has(index));
      button.classList.toggle("striking", strikingIndexes.has(index));
      button.addEventListener("click", () => handleLinkCellClick(index));
    }

    fragment.appendChild(button);
  });

  linkBoardEl.replaceChildren(fragment);
  updateLinkMetrics();
}

function getLinkSvgPoint(point) {
  const wrapRect = linkBoardEl.parentElement.getBoundingClientRect();
  const firstCell = linkBoardEl.querySelector(".link-cell");
  if (!firstCell) return { x: 0, y: 0 };
  const firstRect = firstCell.getBoundingClientRect();
  const boardRect = linkBoardEl.getBoundingClientRect();
  const cellWidth = firstRect.width;
  const cellHeight = firstRect.height;
  const gapX = LINK_COLS > 1 ? (boardRect.width - cellWidth * LINK_COLS) / (LINK_COLS - 1) : 0;
  const gapY = LINK_ROWS > 1 ? (boardRect.height - cellHeight * LINK_ROWS) / (LINK_ROWS - 1) : 0;
  const stepX = cellWidth + gapX;
  const stepY = cellHeight + gapY;
  const startX = firstRect.left - wrapRect.left + cellWidth / 2;
  const startY = firstRect.top - wrapRect.top + cellHeight / 2;
  const boardLeft = boardRect.left - wrapRect.left;
  const boardRight = boardRect.right - wrapRect.left;
  const boardTop = boardRect.top - wrapRect.top;
  const boardBottom = boardRect.bottom - wrapRect.top;
  const outsideInset = 8;

  return {
    x: point.col < 0 ? boardLeft + outsideInset : point.col >= LINK_COLS ? boardRight - outsideInset : startX + point.col * stepX,
    y: point.row < 0 ? boardTop + outsideInset : point.row >= LINK_ROWS ? boardBottom - outsideInset : startY + point.row * stepY,
  };
}

function drawLinkLightning(path) {
  const wrapRect = linkBoardEl.parentElement.getBoundingClientRect();
  const points = path.map(getLinkSvgPoint);
  const pointString = points.map((point) => `${point.x},${point.y}`).join(" ");
  linkLightningEl.setAttribute("viewBox", `0 0 ${wrapRect.width} ${wrapRect.height}`);
  linkLightningEl.innerHTML = `
    <polyline class="link-lightning-glow" points="${pointString}" />
    <polyline class="link-lightning-core" points="${pointString}" />
  `;

  linkLightningEl.querySelectorAll("polyline").forEach((line) => {
    const length = line.getTotalLength();
    line.style.strokeDasharray = `${length}`;
    line.style.strokeDashoffset = `${length}`;
    line.style.setProperty("--dash", `${length}`);
  });
}

function clearLinkLightning() {
  linkLightningEl.innerHTML = "";
}

async function showInvalidLinkFeedback(indexes) {
  setLinkStatus("invalid");
  renderLink({ invalidIndexes: indexes });
  await wait(260);
  selectedLinkIndex = null;
  renderLink();
}

function reshuffleLinkBoard(showStatus = true) {
  const remaining = linkBoard.filter(Boolean);
  linkBoard = createPlayableLinkBoard(remaining);
  selectedLinkIndex = null;
  if (showStatus) setLinkStatus("reshuffle");
  renderLink();
}

async function handleLinkCellClick(index) {
  if (linkBusy || linkFinished || !linkBoard[index]) return;

  if (selectedLinkIndex === null) {
    selectedLinkIndex = index;
    setLinkStatus("selected");
    renderLink();
    return;
  }

  if (selectedLinkIndex === index) {
    selectedLinkIndex = null;
    setLinkStatus("ready");
    renderLink();
    return;
  }

  const first = selectedLinkIndex;
  const second = index;
  const path = findLinkPath(first, second);

  if (!path) {
    linkCombo = 0;
    linkBusy = true;
    await showInvalidLinkFeedback([first, second]);
    linkBusy = false;
    return;
  }

  linkBusy = true;
  selectedLinkIndex = null;
  linkCombo += 1;
  linkScore += 100 + Math.max(0, linkCombo - 1) * 20;
  renderLink({ strikingIndexes: [first, second] });
  drawLinkLightning(path);
  await wait(420);
  renderLink({ clearingIndexes: [first, second] });
  await wait(220);
  linkBoard[first] = null;
  linkBoard[second] = null;
  clearLinkLightning();

  if (linkBoard.every((item) => !item)) {
    linkFinished = true;
    setLinkStatus("win");
  } else {
    setLinkStatus("cleared");
    if (!hasAvailableLinkMove()) {
      reshuffleLinkBoard(false);
      setLinkStatus("reshuffle");
    }
  }

  renderLink();
  linkBusy = false;
}

function resetLink() {
  linkBoard = createPlayableLinkBoard();
  selectedLinkIndex = null;
  linkScore = 0;
  linkCombo = 0;
  linkBusy = false;
  linkFinished = false;
  linkView.classList.remove("win");
  clearLinkLightning();
  setLinkStatus("ready");
  renderLink();
}

difficultyButtons.forEach((button) => {
  button.addEventListener("click", () => resetGame(button.dataset.level));
});

restartButton.addEventListener("click", () => resetGame());
backHomeButton.addEventListener("click", showHome);
backHomeFromMatchButton.addEventListener("click", showHome);
backHomeFromLinkButton.addEventListener("click", showHome);
matchRestartButton.addEventListener("click", () => resetMatch3());
matchShuffleButton.addEventListener("click", shuffleMatchBoard);
linkRestartButton.addEventListener("click", resetLink);
linkShuffleButton.addEventListener("click", () => {
  if (!linkBusy && !linkFinished) reshuffleLinkBoard();
});
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

window.addEventListener("resize", () => {
  render();
  if (activeView === "link") renderLink();
});

setViewHidden(homeView, false);
setViewHidden(minesweeperView, true);
setViewHidden(match3View, true);
setViewHidden(linkView, true);
renderGameCards();
resetGame();
resetMatch3();
resetLink();
