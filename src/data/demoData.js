// Demo data for instant showcase
import { getLocalDateString } from '../services/streak.js';

const today = getLocalDateString();
const yesterday = (() => { const d = new Date(); d.setDate(d.getDate() - 1); return getLocalDateString(d); })();
const twoDaysAgo = (() => { const d = new Date(); d.setDate(d.getDate() - 2); return getLocalDateString(d); })();
const threeDaysAgo = (() => { const d = new Date(); d.setDate(d.getDate() - 3); return getLocalDateString(d); })();

export const DEMO_PROFILE = {
  name: 'Aditi',
  role: 'SDE',
  createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
};

export const DEMO_STREAK = {
  current: 4,
  longest: 7,
  lastPracticeDate: today,
  totalDays: 12,
  history: {
    [today]: true,
    [yesterday]: true,
    [twoDaysAgo]: true,
    [threeDaysAgo]: true,
  },
};

export const DEMO_SESSIONS = [
  {
    id: 'demo_1',
    role: 'SDE',
    category: 'Behavioral',
    difficulty: 'Medium',
    overallScore: 6,
    questionsCount: 5,
    issueTags: ['unstructured answer', 'missing metrics', 'no concrete example'],
    createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
    durationSeconds: 920,
  },
  {
    id: 'demo_2',
    role: 'SDE',
    category: 'DSA',
    difficulty: 'Easy',
    overallScore: 8,
    questionsCount: 5,
    issueTags: ['time complexity not stated'],
    createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
    durationSeconds: 780,
  },
  {
    id: 'demo_3',
    role: 'SDE',
    category: 'System Design',
    difficulty: 'Medium',
    overallScore: 7,
    questionsCount: 5,
    issueTags: ['unstructured answer', 'vague'],
    createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
    durationSeconds: 1100,
  },
  {
    id: 'demo_4',
    role: 'SDE',
    category: 'Behavioral',
    difficulty: 'Hard',
    overallScore: 5,
    questionsCount: 5,
    issueTags: ['unstructured answer', 'missing metrics', 'too long'],
    createdAt: Date.now() - 4 * 24 * 60 * 60 * 1000,
    durationSeconds: 1340,
  },
];

export const DEMO_WEAK_AREAS = [
  { tag: 'unstructured answer', count: 3 },
  { tag: 'missing metrics', count: 2 },
  { tag: 'no concrete example', count: 1 },
  { tag: 'vague', count: 1 },
];

export const DEMO_BADGES = {
  first_session: { unlockedAt: Date.now() - 4 * 24 * 60 * 60 * 1000 },
  streak_3: { unlockedAt: Date.now() - 1 * 24 * 60 * 60 * 1000 },
};
