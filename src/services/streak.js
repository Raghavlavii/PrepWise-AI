// ============================================================
// STREAK ENGINE
// Tracks daily practice habits. A "day" = one completed session or drill.
// ============================================================

import { getStreak, saveStreak } from './storage.js';

// Get today's date string in local time (YYYY-MM-DD)
export const getLocalDateString = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Get yesterday's date string
export const getYesterdayString = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return getLocalDateString(d);
};

// Get the last 7 days as date strings (oldest to newest)
export const getLast7Days = () => {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(getLocalDateString(d));
  }
  return days;
};

// Record that the user practiced today. Returns updated streak + whether it incremented.
export const recordPractice = () => {
  const streak = getStreak();
  const today = getLocalDateString();
  const yesterday = getYesterdayString();

  // Already recorded today → no change
  if (streak.lastPracticeDate === today) {
    return { streak, incremented: false, milestoneReached: null };
  }

  let newCurrent;
  if (streak.lastPracticeDate === yesterday) {
    // Continued streak
    newCurrent = (streak.current || 0) + 1;
  } else {
    // First session or streak broken
    newCurrent = 1;
  }

  const newLongest = Math.max(newCurrent, streak.longest || 0);
  const newStreak = {
    current: newCurrent,
    longest: newLongest,
    lastPracticeDate: today,
    totalDays: (streak.totalDays || 0) + 1,
    // Per-day history for the week view
    history: { ...(streak.history || {}), [today]: true },
  };

  saveStreak(newStreak);

  // Check for milestone badges
  const milestones = [3, 7, 14, 30, 60, 100];
  const milestoneReached = milestones.includes(newCurrent) ? newCurrent : null;

  return { streak: newStreak, incremented: true, milestoneReached };
};

// Get week strip data: array of { date, label, done, isToday }
export const getWeekStrip = () => {
  const streak = getStreak();
  const history = streak.history || {};
  const today = getLocalDateString();
  const days = getLast7Days();
  const dayLabels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  return days.map((dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    return {
      date: dateStr,
      label: dayLabels[d.getDay()],
      done: !!history[dateStr],
      isToday: dateStr === today,
    };
  });
};

// Check if streak needs to be reset (missed a day)
export const checkStreakIntegrity = () => {
  const streak = getStreak();
  const today = getLocalDateString();
  const yesterday = getYesterdayString();

  if (
    streak.lastPracticeDate &&
    streak.lastPracticeDate !== today &&
    streak.lastPracticeDate !== yesterday &&
    streak.current > 0
  ) {
    // Streak broken
    const broken = { ...streak, current: 0 };
    saveStreak(broken);
    return { ...broken, wasBroken: true };
  }
  return { ...streak, wasBroken: false };
};

// Milestone badge IDs
export const MILESTONE_BADGE_IDS = {
  3: 'streak_3',
  7: 'streak_7',
  14: 'streak_14',
  30: 'streak_30',
};
