// src/utils/constants.js

export const INTERVIEW_TYPES = [
  { value: 'technical', label: 'Technical', description: 'DSA, System Design, CS fundamentals' },
  { value: 'behavioral', label: 'Behavioral', description: 'Situational, leadership, teamwork' },
  { value: 'hr', label: 'HR Round', description: 'Culture fit, salary, career goals' },
];

export const DIFFICULTY_LEVELS = [
  { value: 'easy', label: 'Easy', description: 'Internship / Fresher level' },
  { value: 'medium', label: 'Medium', description: 'SDE-1 / 0–2 years experience' },
  { value: 'hard', label: 'Hard', description: 'SDE-2 / Senior level' },
];

export const TOPIC_STATUSES = {
  not_started: { label: 'Not Started', color: '#8b8ba7' },
  in_progress: { label: 'In Progress', color: '#f59e0b' },
  done: { label: 'Completed', color: '#22c55e' },
};

export const SCORE_COLORS = {
  high: '#22c55e',   // 8+
  medium: '#f59e0b', // 5–7.9
  low: '#ef4444',    // <5
};

export const getScoreColor = (score) => {
  if (score >= 8) return SCORE_COLORS.high;
  if (score >= 5) return SCORE_COLORS.medium;
  return SCORE_COLORS.low;
};
