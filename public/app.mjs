import {
  WEEKDAYS,
  doomsdayCalculation,
  explanationSteps,
  formatDate,
  randomDate,
} from "./doomsday.mjs";
import { DEFAULT_STATS, accuracyPercent, recordAttempt, speedRank, formatAttemptTime } from "./practice.mjs";

const STORAGE_KEY = "doomsday-drill-stats-v1";
const PREFS_KEY = "doomsday-drill-prefs-v1";

const elements = {
  timedMode: document.querySelector("#timed-mode"),
  timer: document.querySelector("#attempt-timer"),
  resultTime: document.querySelector("#result-time"),
  rank: document.querySelector("#speed-rank"),
  streakLabel: document.querySelector("#streak-label"),
  date: document.querySelector("#practice-date"),
  roundLabel: document.querySelector("#round-label"),
  grid: document.querySelector("#weekday-grid"),
  weekdayButtons: [...document.querySelectorAll("[data-day]")],
  feedback: document.querySelector("#feedback"),
  resultIcon: document.querySelector("#result-icon"),
  resultTitle: document.querySelector("#result-title"),
  resultDetail: document.querySelector("#result-detail"),
  stepsToggle: document.querySelector("#steps-toggle"),
  calculation: document.querySelector("#calculation"),
  nextButton: document.querySelector("#next-button"),
  keyboardHint: document.querySelector("#keyboard-hint"),
  headerAccuracy: document.querySelector("#header-accuracy"),
  headerStreak: document.querySelector("#header-streak"),
  totalCorrect: document.querySelector("#total-correct"),
  totalAttempted: document.querySelector("#total-attempted"),
  bestStreak: document.querySelector("#best-streak"),
  accuracyMeter: document.querySelector("#accuracy-meter"),
  settingsButton: document.querySelector("#settings-button"),
  settingsPanel: document.querySelector("#settings-panel"),
  explainMisses: document.querySelector("#explain-misses"),
  resetStats: document.querySelector("#reset-stats"),
};

function readJson(key, fallback) {
  try {
    return { ...fallback, ...JSON.parse(localStorage.getItem(key) || "{}") };
  } catch {
    return { ...fallback };
  }
}

let stats = readJson(STORAGE_KEY, DEFAULT_STATS);
const preferences = readJson(PREFS_KEY, { explainMisses: true });
let currentDate = null;
let answered = false;
let timedMode = false;
let attemptStart = 0;
let timerInterval;
let pulseTimeout;
let dancerTimeout;
let dancer;

function startTimer() {
  clearInterval(timerInterval);
  attemptStart = performance.now();
  elements.timer.hidden = !timedMode;
  elements.timer.textContent = "0.0s";
  if (timedMode) timerInterval = setInterval(() => {
    elements.timer.textContent = formatAttemptTime((performance.now() - attemptStart) / 1000);
  }, 100);
}

function pulseScreen(color) {
  clearTimeout(pulseTimeout);
  document.body.classList.remove("celebrating");
  document.body.dataset.celebration = color;
  void document.body.offsetWidth;
  document.body.classList.add("celebrating");
  pulseTimeout = setTimeout(() => document.body.classList.remove("celebrating"), 3600);
}

function dancingGuest(kind) {
  clearTimeout(dancerTimeout);
  dancer?.remove();
  dancer = document.createElement("div");
  dancer.className = `dancing-guest ${kind}`;
  dancer.setAttribute("aria-hidden", "true");
  const character = document.createElement("span");
  character.textContent = kind === "ghoul" ? "👻" : "🦆";
  const caption = document.createElement("small");
  caption.textContent = kind === "ghoul" ? "Boo-gie time!" : "Disco duck approves.";
  dancer.append(character, caption);
  document.body.append(dancer);
  dancerTimeout = setTimeout(() => { dancer?.remove(); dancer = null; }, 3600);
}

elements.explainMisses.checked = Boolean(preferences.explainMisses);

function persistStats() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
}

function renderStats() {
  const accuracy = accuracyPercent(stats);
  elements.headerAccuracy.textContent = accuracy === null ? "—" : `${accuracy}%`;
  elements.headerStreak.textContent = String(stats.currentStreak);
  elements.headerStreak.parentElement.classList.toggle("streak-active", stats.currentStreak >= 3);
  elements.streakLabel.textContent = stats.currentStreak >= 3 ? "On fire!" : "streak";
  elements.totalCorrect.textContent = String(stats.correct);
  elements.totalAttempted.textContent = String(stats.attempted);
  elements.bestStreak.textContent = String(stats.bestStreak);
  elements.accuracyMeter.style.width = `${accuracy ?? 0}%`;
}

function setCalculation(open) {
  elements.calculation.hidden = !open;
  elements.stepsToggle.setAttribute("aria-expanded", String(open));
  elements.stepsToggle.textContent = open ? "Hide calculation" : "Show calculation";
}

function renderCalculation() {
  elements.calculation.replaceChildren();
  for (const step of explanationSteps(currentDate)) {
    const item = document.createElement("li");
    item.innerHTML = step;
    elements.calculation.append(item);
  }
}

function newRound() {
  const previousDate = currentDate;
  currentDate = randomDate(1900, 2099, previousDate);
  answered = false;

  elements.date.textContent = `${formatDate(currentDate)}?`;
  elements.roundLabel.textContent = stats.attempted
    ? `Drill ${stats.attempted + 1}`
    : "Ready to calculate?";
  elements.resultTime.hidden = true;
  elements.rank.hidden = true;
  elements.feedback.hidden = true;
  elements.feedback.className = "feedback";
  elements.stepsToggle.hidden = true;
  setCalculation(false);
  elements.weekdayButtons.forEach((button) => {
    button.disabled = false;
    button.classList.remove("is-correct", "is-wrong");
  });
  elements.keyboardHint.textContent = "Use keys 0–6 to answer";
  window.scrollTo({ top: 0, behavior: "smooth" });
  elements.weekdayButtons[0].focus({ preventScroll: true });
  startTimer();
}

let stopConfetti = () => {};

function celebrateCorrectAnswer() {
  stopConfetti();
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.cssText = "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:1000";
  const context = canvas.getContext("2d");
  if (!context) return;

  const width = window.innerWidth;
  const height = window.innerHeight;
  const scale = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  context.scale(scale, scale);
  document.body.append(canvas);

  const colors = ["#67e8b8", "#89aefc", "#ffd166", "#ff7eb6", "#b794ff"];
  const particles = Array.from({ length: 90 }, () => ({
    x: width / 2,
    y: Math.min(height * 0.45, 360),
    vx: (Math.random() - 0.5) * Math.min(width * 0.9, 650),
    vy: -200 - Math.random() * 350,
    angle: Math.random() * Math.PI,
    spin: (Math.random() - 0.5) * 12,
    size: 5 + Math.random() * 5,
    color: colors[Math.floor(Math.random() * colors.length)],
  }));

  let frame;
  let start;
  let previous;
  const cleanup = () => {
    cancelAnimationFrame(frame);
    canvas.remove();
    document.removeEventListener("visibilitychange", onVisibilityChange);
    stopConfetti = () => {};
  };
  const onVisibilityChange = () => {
    if (document.hidden) cleanup();
  };
  stopConfetti = cleanup;
  document.addEventListener("visibilitychange", onVisibilityChange);

  function draw(now) {
    start ??= now;
    previous ??= now;
    const elapsed = (now - start) / 1000;
    const delta = Math.min((now - previous) / 1000, 0.05);
    previous = now;
    if (elapsed >= 1.8) {
      cleanup();
      return;
    }
    context.clearRect(0, 0, width, height);
    context.globalAlpha = Math.min(1, (1.8 - elapsed) / 0.5);
    for (const particle of particles) {
      particle.x += particle.vx * delta;
      particle.y += particle.vy * delta;
      particle.vy += 600 * delta;
      particle.angle += particle.spin * delta;
      context.save();
      context.translate(particle.x, particle.y);
      context.rotate(particle.angle);
      context.fillStyle = particle.color;
      context.fillRect(-particle.size / 2, -particle.size / 4, particle.size, particle.size / 2);
      context.restore();
    }
    frame = requestAnimationFrame(draw);
  }
  frame = requestAnimationFrame(draw);
}

function submitAnswer(chosenDay) {
  if (answered) return;
  answered = true;
  const seconds = (performance.now() - attemptStart) / 1000;
  clearInterval(timerInterval);
  if (timedMode) elements.timer.textContent = formatAttemptTime(seconds);

  const calculation = doomsdayCalculation(currentDate.year, currentDate.month, currentDate.day);
  const correctDay = calculation.answer;
  const isCorrect = chosenDay === correctDay;

  stats = recordAttempt(stats, isCorrect);
  persistStats();
  renderStats();

  elements.weekdayButtons.forEach((button) => {
    const day = Number(button.dataset.day);
    button.disabled = true;
    if (day === correctDay) button.classList.add("is-correct");
    if (!isCorrect && day === chosenDay) button.classList.add("is-wrong");
  });

  elements.feedback.hidden = false;
  elements.feedback.classList.add(isCorrect ? "correct" : "wrong");
  elements.resultIcon.textContent = isCorrect ? "✓" : "×";
  elements.resultTitle.textContent = isCorrect ? "Correct" : `It was ${WEEKDAYS[correctDay]}`;
  elements.resultDetail.textContent = isCorrect
    ? stats.currentStreak > 1
      ? `${stats.currentStreak} in a row—keep it moving.`
      : "Nice. Lock in the pattern and go again."
    : `You chose ${WEEKDAYS[chosenDay]}.`;

  renderCalculation();
  elements.stepsToggle.hidden = false;
  setCalculation(!isCorrect && elements.explainMisses.checked);
  elements.keyboardHint.textContent = "Press Enter for the next date";
  elements.nextButton.focus({ preventScroll: true });
  if (timedMode) {
    elements.resultTime.hidden = false;
    elements.resultTime.textContent = formatAttemptTime(seconds);
  }
  if (isCorrect) {
    celebrateCorrectAnswer();
    const rank = timedMode ? speedRank(seconds) : null;
    if (rank) {
      elements.rank.hidden = false;
      elements.rank.textContent = rank.name;
      elements.rank.dataset.color = rank.color || "neutral";
    }
    if (rank?.color) pulseScreen(rank.color);
    else if (stats.currentStreak === 3) pulseScreen("streak");
    if (rank?.color === "purple") dancingGuest("ghoul");
    else if (rank?.color === "blue") dancingGuest("duck");
  }
}

elements.timedMode.addEventListener("click", () => {
  timedMode = !timedMode;
  elements.timedMode.setAttribute("aria-pressed", String(timedMode));
  elements.timedMode.textContent = `Timed mode: ${timedMode ? "On" : "Off"}`;
  // Switching modes starts a fresh date, so the clock always measures a full attempt.
  newRound();
});

elements.grid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-day]");
  if (button) submitAnswer(Number(button.dataset.day));
});

elements.nextButton.addEventListener("click", newRound);

elements.stepsToggle.addEventListener("click", () => {
  setCalculation(elements.calculation.hidden);
});

elements.settingsButton.addEventListener("click", () => {
  const willOpen = elements.settingsPanel.hidden;
  elements.settingsPanel.hidden = !willOpen;
  elements.settingsButton.setAttribute("aria-expanded", String(willOpen));
  elements.settingsButton.setAttribute(
    "aria-label",
    willOpen ? "Close practice settings" : "Open practice settings",
  );
});

elements.explainMisses.addEventListener("change", () => {
  localStorage.setItem(
    PREFS_KEY,
    JSON.stringify({ explainMisses: elements.explainMisses.checked }),
  );
});

elements.resetStats.addEventListener("click", () => {
  if (!window.confirm("Reset all accuracy and streak stats on this device?")) return;
  stats = { ...DEFAULT_STATS };
  persistStats();
  renderStats();
  elements.roundLabel.textContent = answered ? "Stats reset" : "Ready to calculate?";
});

document.addEventListener("keydown", (event) => {
  if (event.repeat || event.metaKey || event.ctrlKey || event.altKey) return;

  if (event.target?.matches("input, textarea, select, [contenteditable=true]")) return;
  const keyNumber = Number(event.key);
  if (!answered && /^[0-6]$/.test(event.key)) {
    event.preventDefault();
    submitAnswer(keyNumber);
    return;
  }

  if (answered && (event.key === "Enter" || event.key === " ") &&
      (event.target === elements.nextButton || event.target === document.body)) {
    event.preventDefault();
    newRound();
  }
});

renderStats();
newRound();
