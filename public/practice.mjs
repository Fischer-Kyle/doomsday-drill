export const DEFAULT_STATS = Object.freeze({
  attempted: 0,
  correct: 0,
  currentStreak: 0,
  bestStreak: 0,
});

export function recordAttempt(currentStats, isCorrect) {
  const next = {
    attempted: currentStats.attempted + 1,
    correct: currentStats.correct + (isCorrect ? 1 : 0),
    currentStreak: isCorrect ? currentStats.currentStreak + 1 : 0,
    bestStreak: currentStats.bestStreak,
  };
  next.bestStreak = Math.max(next.bestStreak, next.currentStreak);
  return next;
}

export function accuracyPercent(stats) {
  return stats.attempted ? Math.round((stats.correct / stats.attempted) * 100) : null;
}

export const SPEED_RANKS = Object.freeze([
  { limit: 5, name: "Ghoul-speed", color: "purple" },
  { limit: 15, name: "Disco rocket", color: "blue" },
  { limit: 25, name: "Lightning", color: "green" },
  { limit: 40, name: "Quick thinker" },
  { limit: 55, name: "Sharp calculator" },
  { limit: 75, name: "Steady solver" },
  { limit: 120, name: "Patient puzzler" },
  { limit: Infinity, name: "Scenic route" },
]);

export function speedRank(seconds) {
  // Two minutes exactly stays in Patient puzzler; Scenic route is strictly over.
  return seconds > 120 ? SPEED_RANKS[7] : SPEED_RANKS.find(rank => seconds < rank.limit || (rank.limit === 120 && seconds === 120));
}

export function formatAttemptTime(seconds) {
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${Math.floor(seconds % 60).toString().padStart(2, "0")}`;
}
