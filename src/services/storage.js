// ============================================================
// STORAGE SERVICE — localStorage wrapper
// All keys live here so swapping to a real backend is easy.
// ============================================================

const KEYS = {
  PROFILE: 'pw_profile',
  STREAK: 'pw_streak',
  SESSIONS: 'pw_sessions',
  WEAK_AREAS: 'pw_weak_areas',
  BADGES: 'pw_badges',
  COMMUNITY: 'pw_community',
  SETTINGS: 'pw_settings',
  USERS: 'pw_users',
  AUTH_USER: 'pw_auth_user',
};

// ─── Generic helpers ───────────────────────────────────────
function get(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function set(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function remove(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

// ─── Profile ───────────────────────────────────────────────
export const getProfile = () => get(KEYS.PROFILE, null);

export const saveProfile = (profile) => {
  const existing = getProfile() || {};
  return set(KEYS.PROFILE, { ...existing, ...profile, updatedAt: Date.now() });
};

export const profileExists = () => getProfile() !== null;

// ─── Auth ──────────────────────────────────────────────────
export const getUsers = () => get(KEYS.USERS, []);

export const getCurrentUser = () => get(KEYS.AUTH_USER, null);

export const isLoggedIn = () => getCurrentUser() !== null;

export const registerUser = ({ name, email, password }) => {
  const users = getUsers();
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    return { success: false, error: 'An account with this email already exists.' };
  }
  const newUser = { id: `user_${Date.now()}`, name, email, password, createdAt: Date.now() };
  users.push(newUser);
  set(KEYS.USERS, users);
  const { password: _, ...safeUser } = newUser;
  set(KEYS.AUTH_USER, safeUser);
  // Pre-fill profile from signup data
  saveProfile({ name, email });
  return { success: true, user: safeUser };
};

export const loginUser = ({ email, password }) => {
  const users = getUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  if (!user) return { success: false, error: 'Invalid email or password.' };
  const { password: _, ...safeUser } = user;
  set(KEYS.AUTH_USER, safeUser);
  return { success: true, user: safeUser };
};

export const logoutUser = () => {
  remove(KEYS.AUTH_USER);
};

// ─── Streak ────────────────────────────────────────────────
export const getStreak = () =>
  get(KEYS.STREAK, {
    current: 0,
    longest: 0,
    lastPracticeDate: null,
    totalDays: 0,
  });

export const saveStreak = (streak) => set(KEYS.STREAK, streak);

// ─── Sessions ──────────────────────────────────────────────
export const getSessions = () => get(KEYS.SESSIONS, []);

export const saveSession = (session) => {
  const sessions = getSessions();
  const newSession = {
    id: `session_${Date.now()}`,
    createdAt: Date.now(),
    ...session,
  };
  sessions.unshift(newSession); // newest first
  set(KEYS.SESSIONS, sessions.slice(0, 100)); // keep last 100
  return newSession;
};

export const getRecentSessions = (limit = 10) => getSessions().slice(0, limit);

// ─── Weak Areas ────────────────────────────────────────────
export const getWeakAreas = () => get(KEYS.WEAK_AREAS, []);

export const saveWeakAreas = (areas) => set(KEYS.WEAK_AREAS, areas);

// Aggregate tags from recent sessions to detect recurring issues
export const computeWeakAreas = () => {
  const sessions = getSessions().slice(0, 10);
  const tagMap = {};

  sessions.forEach((session) => {
    (session.issueTags || []).forEach((tag) => {
      tagMap[tag] = (tagMap[tag] || 0) + 1;
    });
  });

  return Object.entries(tagMap)
    .sort(([, a], [, b]) => b - a)
    .map(([tag, count]) => ({ tag, count }));
};

// ─── Badges ────────────────────────────────────────────────
export const getBadges = () => get(KEYS.BADGES, {});

export const unlockBadge = (badgeId) => {
  const badges = getBadges();
  if (!badges[badgeId]) {
    badges[badgeId] = { unlockedAt: Date.now() };
    set(KEYS.BADGES, badges);
    return true; // newly unlocked
  }
  return false;
};

export const isBadgeUnlocked = (badgeId) => !!getBadges()[badgeId];

// ─── Community ─────────────────────────────────────────────
export const getCommunityPosts = () => get(KEYS.COMMUNITY, []);

export const saveCommunityPost = (post) => {
  const posts = getCommunityPosts();
  const newPost = {
    id: `post_${Date.now()}`,
    createdAt: Date.now(),
    upvotes: 0,
    ...post,
  };
  posts.unshift(newPost);
  set(KEYS.COMMUNITY, posts.slice(0, 200));
  return newPost;
};

export const upvoteCommunityPost = (postId) => {
  const posts = getCommunityPosts();
  const idx = posts.findIndex((p) => p.id === postId);
  if (idx !== -1) {
    posts[idx].upvotes = (posts[idx].upvotes || 0) + 1;
    set(KEYS.COMMUNITY, posts);
    return true;
  }
  return false;
};

// ─── Settings ──────────────────────────────────────────────
export const getSettings = () =>
  get(KEYS.SETTINGS, { theme: 'dark', apiKeySource: 'env' });

export const saveSettings = (settings) => {
  const existing = getSettings();
  return set(KEYS.SETTINGS, { ...existing, ...settings });
};

// ─── Reset ─────────────────────────────────────────────────
export const clearAllData = () => {
  Object.values(KEYS).forEach((key) => remove(key));
};

// ─── Stats ─────────────────────────────────────────────────
export const getStats = () => {
  const sessions = getSessions();
  if (!sessions.length) return null;

  const scores = sessions.map((s) => s.overallScore || 0).filter(Boolean);
  const avgScore = scores.length
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 0;
  const bestScore = scores.length ? Math.max(...scores) : 0;

  const categoryMap = {};
  sessions.forEach((s) => {
    const cat = s.category || 'General';
    if (!categoryMap[cat]) categoryMap[cat] = { total: 0, count: 0 };
    categoryMap[cat].total += s.overallScore || 0;
    categoryMap[cat].count += 1;
  });

  const categoryScores = Object.entries(categoryMap).map(([cat, { total, count }]) => ({
    category: cat,
    avgScore: Math.round(total / count),
    count,
  }));

  return {
    totalSessions: sessions.length,
    avgScore,
    bestScore,
    categoryScores,
  };
};
