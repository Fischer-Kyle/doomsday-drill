import {
  WEEKDAYS,
  doomsdayCalculation,
  explanationSteps,
  formatDate,
  randomDate,
} from "./doomsday.mjs";
import { DEFAULT_STATS, accuracyPercent, recordAttempt } from "./practice.mjs";

const STORAGE_KEY = "doomsday-drill-stats-v1";
const PREFS_KEY = "doomsday-drill-prefs-v1";

const elements = {
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

elements.explainMisses.checked = Boolean(preferences.explainMisses);

function persistStats() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
}

function renderStats() {
  const accuracy = accuracyPercent(stats);
  elements.headerAccuracy.textContent = accuracy === null ? "—" : `${accuracy}%`;
  elements.headerStreak.textContent = String(stats.currentStreak);
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
  elements.feedback.hidden = true;
  elements.feedback.className = "feedback";
  elements.stepsToggle.hidden = true;
  setCalculation(false);
  elements.weekdayButtons.forEach((button) => {
    button.disabled = false;
    button.classList.remove("is-correct", "is-wrong");
  });
  elements.keyboardHint.textContent = "Use keys 1–7 to answer";
  window.scrollTo({ top: 0, behavior: "smooth" });
  elements.weekdayButtons[0].focus({ preventScroll: true });
}

function submitAnswer(chosenDay) {
  if (answered) return;
  answered = true;

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
}

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

  const keyNumber = Number(event.key);
  if (!answered && keyNumber >= 1 && keyNumber <= 7) {
    event.preventDefault();
    submitAnswer(keyNumber - 1);
    return;
  }

  if (answered && (event.key === "Enter" || event.key === " ")) {
    event.preventDefault();
    newRound();
  }
});

renderStats();
newRound();
