// ─── ROLES ───────────────────────────────────────────────────
export const ROLES = [
  {
    id: 'SDE',
    label: 'Software Engineer',
    icon: '💻',
    description: 'DSA, System Design, Behavioral',
    color: 'from-indigo-500 to-violet-600',
    glowColor: 'rgba(99,102,241,0.3)',
    categories: ['DSA', 'System Design', 'Behavioral'],
  },
  {
    id: 'PM',
    label: 'Product Manager',
    icon: '🎯',
    description: 'Case Studies, Execution, Leadership',
    color: 'from-violet-500 to-purple-600',
    glowColor: 'rgba(124,58,237,0.3)',
    categories: ['Case Studies', 'Execution', 'Leadership'],
  },
  {
    id: 'Consulting',
    label: 'Consulting',
    icon: '📊',
    description: 'Guesstimates, Business Cases, Behavioral',
    color: 'from-purple-500 to-pink-600',
    glowColor: 'rgba(192,38,211,0.3)',
    categories: ['Guesstimates', 'Business Cases', 'Behavioral'],
  },
];

export const getRoleById = (id) => ROLES.find((r) => r.id === id) || ROLES[0];

export const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
