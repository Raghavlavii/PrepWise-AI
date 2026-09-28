// ============================================================
// GEMINI SERVICE — All AI calls live here
// Uses @google/generative-ai SDK
// ============================================================

import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

let genAI = null;

function getClient() {
  if (!genAI) {
    if (!API_KEY) throw new Error('VITE_GEMINI_API_KEY is not set in your .env file.');
    genAI = new GoogleGenerativeAI(API_KEY);
  }
  return genAI;
}

function getModel(modelName = 'gemini-1.5-flash') {
  return getClient().getGenerativeModel({ model: modelName });
}

// Safe JSON parse with fallback
function safeParseJSON(text, fallback) {
  try {
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return fallback;
  }
}

// ─── Role-aware system prompts ──────────────────────────────
const SYSTEM_PROMPTS = {
  SDE: `You are an expert technical interviewer at a top FAANG company specializing in Software Engineering roles.
You generate high-quality DSA, System Design, and Behavioral questions for placement-level candidates.
Always respond ONLY with valid JSON, no markdown, no explanations outside JSON.`,

  PM: `You are a senior Product Manager interviewer at a leading tech company.
You generate case study, execution, and leadership questions for PM placement candidates.
Always respond ONLY with valid JSON, no markdown, no explanations outside JSON.`,

  Consulting: `You are an expert Management Consulting interviewer at a top-tier firm (McKinsey/BCG/Bain level).
You generate guesstimate, business case, and behavioral questions for consulting placement candidates.
Always respond ONLY with valid JSON, no markdown, no explanations outside JSON.`,
};

// ─── Question Generation ────────────────────────────────────
export async function generateQuestions({ role, category, difficulty, resume = '' }) {
  const systemPrompt = SYSTEM_PROMPTS[role] || SYSTEM_PROMPTS.SDE;
  const resumeContext = resume
    ? `\nThe candidate's resume/background:\n${resume.slice(0, 1500)}\nUse this to personalize 1-2 questions if relevant.`
    : '';

  const prompt = `${systemPrompt}
${resumeContext}

Generate exactly 5 interview questions for:
- Role: ${role}
- Category: ${category}
- Difficulty: ${difficulty}

Return ONLY this JSON structure:
{
  "questions": [
    {
      "id": "q1",
      "text": "Question text here",
      "category": "${category}",
      "difficulty": "${difficulty}",
      "timeHint": 120,
      "tags": ["tag1", "tag2"],
      "hint": "A brief hint to guide the candidate"
    }
  ]
}`;

  try {
    const model = getModel();
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = safeParseJSON(text, null);

    if (parsed?.questions?.length) return parsed.questions;

    // Fallback questions per role/category
    return getFallbackQuestions(role, category, difficulty);
  } catch (err) {
    console.error('generateQuestions error:', err);
    return getFallbackQuestions(role, category, difficulty);
  }
}

// ─── Answer Evaluation ─────────────────────────────────────
export async function evaluateAnswer({ question, answer, role, category, images = [] }) {
  if (!answer?.trim()) {
    return {
      score: 0,
      strengths: [],
      improvements: ['No answer was provided.'],
      betterOutline: 'Please provide a substantive answer to receive feedback.',
      issueTags: ['no answer'],
      starAnalysis: null,
    };
  }

  const systemPrompt = SYSTEM_PROMPTS[role] || SYSTEM_PROMPTS.SDE;
  const isBehavioral = category?.toLowerCase().includes('behavioral') || category?.toLowerCase().includes('leadership');

  const prompt = `${systemPrompt}

Evaluate this interview answer and return ONLY valid JSON:

Question: ${question}
Answer: ${answer}
Category: ${category}
Role: ${role}

${isBehavioral ? 'Also check for STAR structure (Situation, Task, Action, Result).' : ''}
${images.length > 0 ? "I have also provided snapshot frames captured during the answer. Please analyze the candidate's body language, eye contact, posture, and facial expressions." : ''}

Return ONLY this JSON:
{
  "score": <integer 0-10>,
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["improvement 1", "improvement 2"],
  "betterOutline": "A concise outline of a strong answer in 3-5 bullet points",
  "issueTags": ["e.g. unstructured answer", "missing metrics", "vague", "no concrete example"],
  ${isBehavioral ? '"starAnalysis": { "situation": "feedback", "task": "feedback", "action": "feedback", "result": "feedback", "hasStar": true/false },' : '"starAnalysis": null,'}
  "bodyLanguage": {
    "score": <integer 0-10>,
    "feedback": "Concise feedback on eye contact, expressions, and posture",
    "strengths": ["Good eye contact", "Smiled naturally"],
    "improvements": ["Fidgeting", "Looking away frequently"]
  },
  "overallComment": "One encouraging sentence summarizing the feedback"
}`;

  try {
    const model = getModel();
    const parts = [
      { text: prompt },
      ...images.map(img => ({
        inlineData: {
          data: img.includes(',') ? img.split(',')[1] : img,
          mimeType: "image/jpeg"
        }
      }))
    ];
    const result = await model.generateContent(parts);
    const text = result.response.text();
    const parsed = safeParseJSON(text, null);

    if (parsed?.score !== undefined) return parsed;

    return getFallbackEvaluation();
  } catch (err) {
    console.error('evaluateAnswer error:', err);
    return getFallbackEvaluation();
  }
}

// ─── Session Summary ────────────────────────────────────────
export async function generateSessionSummary({ role, answers, overallScore, weakAreas }) {
  const prompt = `You are an AI interview coach. Based on this session data, generate a concise coaching summary.

Role: ${role}
Overall Score: ${overallScore}/10
Weak Areas: ${weakAreas.join(', ') || 'None identified yet'}
Number of questions: ${answers.length}

Return ONLY this JSON:
{
  "headline": "One punchy headline sentence about the session",
  "keyTakeaways": ["takeaway 1", "takeaway 2", "takeaway 3"],
  "topWeakArea": "The single most important area to improve",
  "drillRecommendation": "Name of a specific 5-minute drill to try next",
  "encouragement": "One short, energetic, motivational sentence"
}`;

  try {
    const model = getModel();
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = safeParseJSON(text, null);
    if (parsed?.headline) return parsed;
    return getFallbackSummary(overallScore);
  } catch (err) {
    console.error('generateSessionSummary error:', err);
    return getFallbackSummary(overallScore);
  }
}

// ─── Micro-Drill Generation ─────────────────────────────────
export async function generateDrill({ weakArea, role }) {
  const prompt = `You are an AI interview coach. Generate a short, actionable 5-minute drill for this weak area.

Role: ${role}
Weak Area: ${weakArea}

Return ONLY this JSON:
{
  "title": "Drill title (e.g. STAR Method Sprint)",
  "description": "What this drill trains in one sentence",
  "duration": 5,
  "steps": [
    { "step": 1, "instruction": "Step instruction", "timeSeconds": 60 }
  ],
  "examplePrompt": "A sample question to practice with",
  "tip": "One quick tip for success"
}`;

  try {
    const model = getModel();
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = safeParseJSON(text, null);
    if (parsed?.title) return parsed;
    return getFallbackDrill(weakArea);
  } catch (err) {
    console.error('generateDrill error:', err);
    return getFallbackDrill(weakArea);
  }
}

// ─── STAR Drill Evaluation ──────────────────────────────────
export async function evaluateSTARDrill({ situation, task, action, result: res, question }) {
  const prompt = `Evaluate this STAR (Situation-Task-Action-Result) answer and return ONLY JSON:

Question: ${question}

Situation: ${situation}
Task: ${task}
Action: ${action}
Result: ${res}

Return ONLY this JSON:
{
  "scores": { "situation": 8, "task": 7, "action": 9, "result": 6 },
  "feedback": {
    "situation": "feedback for situation",
    "task": "feedback for task",
    "action": "feedback for action",
    "result": "feedback for result"
  },
  "overallScore": 7,
  "topImprovement": "The single most important thing to improve"
}`;

  try {
    const model = getModel();
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = safeParseJSON(text, null);
    if (parsed?.scores) return parsed;
    return { scores: { situation: 7, task: 7, action: 7, result: 7 }, feedback: {}, overallScore: 7, topImprovement: 'Keep practicing!' };
  } catch (err) {
    console.error('evaluateSTARDrill error:', err);
    return { scores: { situation: 7, task: 7, action: 7, result: 7 }, feedback: {}, overallScore: 7, topImprovement: 'Keep practicing!' };
  }
}

// ─── AI-powered Recommended Practice ───────────────────────
export async function getRecommendedPractice({ role, weakAreas, sessions }) {
  const hasHistory = sessions?.length > 0;

  const prompt = `You are an AI interview coach. Recommend the single most useful practice activity.

Role: ${role}
Has Practice History: ${hasHistory}
Weak Areas: ${weakAreas?.map(w => w.tag).join(', ') || 'None yet'}
Recent Sessions: ${sessions?.length || 0}

Return ONLY this JSON:
{
  "title": "Short activity title",
  "description": "One sentence describing why this is recommended right now",
  "category": "The category this falls under",
  "type": "drill | mock | lesson",
  "duration": 5,
  "reason": "Because your AI coach noticed..."
}`;

  try {
    const model = getModel();
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = safeParseJSON(text, null);
    if (parsed?.title) return parsed;
    return getDefaultRecommendation(role);
  } catch (err) {
    console.error('getRecommendedPractice error:', err);
    return getDefaultRecommendation(role);
  }
}

// ─── Fallbacks ──────────────────────────────────────────────
function getFallbackQuestions(role, category, difficulty) {
  const bank = {
    SDE: {
      DSA: [
        { id: 'q1', text: 'Given an array of integers, find two numbers that add up to a target sum. Return their indices.', category, difficulty, timeHint: 120, tags: ['arrays', 'hash map'], hint: 'Think about using a hash map for O(n) solution.' },
        { id: 'q2', text: 'Implement a function to reverse a linked list in-place.', category, difficulty, timeHint: 90, tags: ['linked list'], hint: 'Use three pointers: prev, curr, next.' },
        { id: 'q3', text: 'Write an algorithm to determine if a string has all unique characters.', category, difficulty, timeHint: 60, tags: ['strings', 'hash set'], hint: 'A set can track seen characters.' },
        { id: 'q4', text: 'Find the maximum depth of a binary tree.', category, difficulty, timeHint: 90, tags: ['trees', 'recursion'], hint: 'Think about DFS — depth = 1 + max(left, right).' },
        { id: 'q5', text: 'Given a sorted array, implement binary search to find a target element.', category, difficulty, timeHint: 60, tags: ['binary search'], hint: 'Track low, high, and mid pointers.' },
      ],
      'System Design': [
        { id: 'q1', text: 'Design a URL shortener (like bit.ly). Cover API design, storage, and scaling.', category, difficulty, timeHint: 300, tags: ['system design', 'databases'], hint: 'Think about read/write ratio, hash collisions, and caching.' },
        { id: 'q2', text: 'How would you design a rate limiter for an API gateway?', category, difficulty, timeHint: 240, tags: ['system design', 'algorithms'], hint: 'Consider token bucket vs sliding window approaches.' },
        { id: 'q3', text: 'Design a notification system (email, SMS, push) for 10M users.', category, difficulty, timeHint: 300, tags: ['system design', 'queues'], hint: 'Think about message queues and fan-out strategies.' },
        { id: 'q4', text: 'Design the backend for a live coding interview tool (like HackerRank).', category, difficulty, timeHint: 300, tags: ['system design', 'real-time'], hint: 'WebSockets for real-time collaboration, sandboxed code execution.' },
        { id: 'q5', text: 'How would you design a distributed key-value store?', category, difficulty, timeHint: 300, tags: ['distributed systems'], hint: 'Consider CAP theorem, consistent hashing, replication.' },
      ],
      Behavioral: [
        { id: 'q1', text: 'Tell me about a time you handled a major technical challenge under a tight deadline.', category, difficulty, timeHint: 180, tags: ['STAR', 'pressure'], hint: 'Use the STAR framework: Situation, Task, Action, Result.' },
        { id: 'q2', text: 'Describe a situation where you disagreed with a teammate on a technical decision. How did you resolve it?', category, difficulty, timeHint: 180, tags: ['STAR', 'conflict'], hint: 'Show empathy and data-driven decision making.' },
        { id: 'q3', text: 'Give an example of when you had to learn a new technology quickly. What was your approach?', category, difficulty, timeHint: 150, tags: ['STAR', 'learning'], hint: 'Mention the specific resource, timeline, and outcome.' },
        { id: 'q4', text: 'Tell me about a project you led. What challenges did you face?', category, difficulty, timeHint: 180, tags: ['STAR', 'leadership'], hint: 'Focus on your specific contribution and measurable impact.' },
        { id: 'q5', text: 'Describe a time when you identified and fixed a critical bug in production.', category, difficulty, timeHint: 180, tags: ['STAR', 'debugging'], hint: 'Walk through your debugging process systematically.' },
      ],
    },
    PM: {
      'Case Studies': [
        { id: 'q1', text: 'You are the PM for Spotify. Design a feature to increase user retention for free users.', category, difficulty, timeHint: 300, tags: ['product design', 'retention'], hint: 'Identify user segments, pain points, and measurable success metrics.' },
        { id: 'q2', text: 'Google Maps is losing market share to Apple Maps in urban areas. How would you respond as a PM?', category, difficulty, timeHint: 300, tags: ['strategy', 'competitive'], hint: 'Use data, define the problem clearly before jumping to solutions.' },
        { id: 'q3', text: 'Design a feature for LinkedIn to help students land their first job.', category, difficulty, timeHint: 270, tags: ['product design', 'user empathy'], hint: 'Start with user interviews, identify the core job-to-be-done.' },
        { id: 'q4', text: 'How would you improve YouTube\'s recommendation algorithm to reduce harmful content?', category, difficulty, timeHint: 300, tags: ['algorithm', 'ethics'], hint: 'Balance engagement with safety metrics.' },
        { id: 'q5', text: 'WhatsApp wants to monetize without alienating users. What would you build?', category, difficulty, timeHint: 270, tags: ['monetization', 'UX'], hint: 'Think B2B (business accounts) before B2C ads.' },
      ],
      Execution: [
        { id: 'q1', text: 'A key feature launch is delayed by 2 weeks because of an engineering dependency. How do you handle this?', category, difficulty, timeHint: 180, tags: ['execution', 'stakeholder management'], hint: 'Communicate proactively, explore workarounds, reset expectations.' },
        { id: 'q2', text: 'Your NPS score dropped 15 points after a recent release. Walk me through how you\'d investigate.', category, difficulty, timeHint: 200, tags: ['metrics', 'problem solving'], hint: 'Segment data, check for correlation, talk to users.' },
        { id: 'q3', text: 'How do you prioritize between 10 feature requests with competing stakeholders?', category, difficulty, timeHint: 180, tags: ['prioritization', 'frameworks'], hint: 'RICE, MoSCoW, or impact vs effort matrix.' },
        { id: 'q4', text: 'A/B test results are inconclusive after 4 weeks. What do you do?', category, difficulty, timeHint: 150, tags: ['experimentation', 'data'], hint: 'Check for statistical significance, sample size, and novelty effect.' },
        { id: 'q5', text: 'You\'re asked to cut your product roadmap by 50% due to budget constraints. How do you decide?', category, difficulty, timeHint: 180, tags: ['prioritization', 'strategy'], hint: 'Focus on core user value, strategic bets, and quick wins.' },
      ],
      Leadership: [
        { id: 'q1', text: 'Tell me about a time you had to influence engineers without authority.', category, difficulty, timeHint: 180, tags: ['influence', 'STAR'], hint: 'Show you used data, empathy, and a shared goal.' },
        { id: 'q2', text: 'Describe a product failure you were responsible for. What did you learn?', category, difficulty, timeHint: 180, tags: ['failure', 'learning'], hint: 'Own the failure, show analytical thinking, and concrete changes made.' },
        { id: 'q3', text: 'How do you keep a cross-functional team aligned on a long-term vision?', category, difficulty, timeHint: 150, tags: ['alignment', 'communication'], hint: 'Roadmap ceremonies, async updates, OKRs.' },
        { id: 'q4', text: 'Tell me about a time you made a product decision with incomplete data.', category, difficulty, timeHint: 180, tags: ['ambiguity', 'decision making'], hint: 'Frame the risk, identify what you can learn quickly, and decide.' },
        { id: 'q5', text: 'How do you handle a situation where your vision conflicts with your manager\'s?', category, difficulty, timeHint: 150, tags: ['conflict', 'upward management'], hint: 'Show respect, use data, and find common ground.' },
      ],
    },
    Consulting: {
      Guesstimates: [
        { id: 'q1', text: 'How many piano tuners are there in Chicago?', category, difficulty, timeHint: 180, tags: ['fermi', 'estimation'], hint: 'Break it into: population → piano owners → tuning frequency → tuner capacity.' },
        { id: 'q2', text: 'Estimate the annual revenue of all McDonald\'s restaurants in India.', category, difficulty, timeHint: 200, tags: ['market sizing'], hint: 'Urban vs rural split, average footfall, ticket size.' },
        { id: 'q3', text: 'How many smartphones are sold in India each month?', category, difficulty, timeHint: 180, tags: ['market sizing', 'estimation'], hint: 'Consider replacement cycle, first-time buyers, and market penetration.' },
        { id: 'q4', text: 'How many Uber rides happen in Mumbai in a day?', category, difficulty, timeHint: 180, tags: ['estimation'], hint: 'Think about commuter segments and ride substitution.' },
        { id: 'q5', text: 'Estimate the size of the online education market in India.', category, difficulty, timeHint: 200, tags: ['market sizing'], hint: 'Segment by K-12, competitive exams, professional upskilling.' },
      ],
      'Business Cases': [
        { id: 'q1', text: 'A traditional bank is losing customers to fintech startups. As a consultant, what would you advise?', category, difficulty, timeHint: 300, tags: ['strategy', 'disruption'], hint: 'Diagnose root causes, prioritize customer segments, recommend specific plays.' },
        { id: 'q2', text: 'An FMCG client\'s profits have declined 20% in the last year despite flat revenue. Why and what to do?', category, difficulty, timeHint: 300, tags: ['profitability', 'diagnosis'], hint: 'Decompose profit = revenue - cost. Check both sides.' },
        { id: 'q3', text: 'Should an Indian airline enter the cargo logistics business?', category, difficulty, timeHint: 270, tags: ['market entry', 'strategy'], hint: 'Evaluate market attractiveness, synergies, and risks.' },
        { id: 'q4', text: 'A SaaS startup is seeing high churn at the 3-month mark. How would you approach this?', category, difficulty, timeHint: 250, tags: ['churn', 'growth'], hint: 'Diagnose via cohort analysis, user interviews, and onboarding audit.' },
        { id: 'q5', text: 'Your client wants to expand from India to Southeast Asia. How would you structure this analysis?', category, difficulty, timeHint: 300, tags: ['international expansion'], hint: 'Market selection, entry mode, localization vs standardization.' },
      ],
      Behavioral: [
        { id: 'q1', text: 'Tell me about a time you led a project with ambiguous goals. How did you bring clarity?', category, difficulty, timeHint: 180, tags: ['STAR', 'ambiguity'], hint: 'Show structured thinking: break down the problem, align on success metrics.' },
        { id: 'q2', text: 'Describe a situation where you had to present an unpopular recommendation to a client or senior stakeholder.', category, difficulty, timeHint: 180, tags: ['STAR', 'communication'], hint: 'Lead with data, show alternatives considered, manage the relationship.' },
        { id: 'q3', text: 'Give an example of when you worked in a high-pressure, fast-paced team. What was your role?', category, difficulty, timeHint: 150, tags: ['STAR', 'teamwork'], hint: 'Consulting is project-driven — show you thrive in sprint cycles.' },
        { id: 'q4', text: 'How do you structure your approach when given a new, unfamiliar business problem?', category, difficulty, timeHint: 150, tags: ['problem solving', 'frameworks'], hint: 'Clarify, hypothesize, structure the analysis, gather data, synthesize.' },
        { id: 'q5', text: 'Tell me about a time you changed your mind because of new information or a colleague\'s perspective.', category, difficulty, timeHint: 150, tags: ['STAR', 'adaptability'], hint: 'Show intellectual humility and openness to new data.' },
      ],
    },
  };

  const roleBank = bank[role] || bank.SDE;
  const catBank = roleBank[category] || Object.values(roleBank)[0];
  return catBank || [];
}

function getFallbackEvaluation() {
  return {
    score: 6,
    strengths: ['You attempted to answer the question.'],
    improvements: ['Add more specific examples with measurable outcomes.', 'Structure your answer more clearly.'],
    betterOutline: '• Open with the context\n• Describe your specific action\n• Quantify the result\n• Reflect on what you learned',
    issueTags: ['missing metrics', 'needs structure'],
    starAnalysis: null,
    overallComment: "Good effort — with a bit more structure, this answer would shine!",
  };
}

function getFallbackSummary(score) {
  return {
    headline: score >= 7 ? 'Strong session! Keep building on your momentum.' : 'Good attempt — every session makes you sharper.',
    keyTakeaways: ['Structure your answers with clear frameworks.', 'Always include specific examples.', 'Quantify your impact wherever possible.'],
    topWeakArea: 'Answer structure',
    drillRecommendation: 'STAR Method Sprint',
    encouragement: 'Every practice session puts you ahead of 90% of candidates — keep going! 🚀',
  };
}

function getFallbackDrill(weakArea) {
  return {
    title: 'STAR Method Sprint',
    description: 'Practice structuring behavioral answers using the STAR framework.',
    duration: 5,
    steps: [
      { step: 1, instruction: 'Write the Situation (30 sec): Set the context in 1-2 sentences.', timeSeconds: 30 },
      { step: 2, instruction: 'Write the Task (30 sec): What was your responsibility?', timeSeconds: 30 },
      { step: 3, instruction: 'Write the Action (90 sec): What specific steps did YOU take?', timeSeconds: 90 },
      { step: 4, instruction: 'Write the Result (60 sec): What was the measurable outcome?', timeSeconds: 60 },
    ],
    examplePrompt: 'Tell me about a challenge you overcame in a team project.',
    tip: 'The Action part should be 60% of your answer — make it specific and personal.',
  };
}

function getDefaultRecommendation(role) {
  const defaults = {
    SDE: { title: 'DSA Warm-Up', description: 'Start with a classic array or string problem to get your brain in gear.', category: 'DSA', type: 'drill', duration: 20, reason: 'Because DSA is foundational for SDE interviews at every level.' },
    PM: { title: 'Product Critique', description: 'Pick an app you use daily and critique it like a PM interviewer would.', category: 'Case Studies', type: 'drill', duration: 15, reason: 'Because structured product thinking is the core PM skill.' },
    Consulting: { title: 'Guesstimate Practice', description: 'Try estimating a market size you\'ve never thought about before.', category: 'Guesstimates', type: 'drill', duration: 10, reason: 'Because guesstimates are asked in every consulting first round.' },
  };
  return defaults[role] || defaults.SDE;
}
