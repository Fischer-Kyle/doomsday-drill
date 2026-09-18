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
