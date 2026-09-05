import { Student } from '../types';

export const MAX_QUIZ_ATTEMPTS = 5;

export interface BookScoreDetail {
  bookTitle: string;
  bookAuthor?: string;
  bookCover?: string;
  points: number;
  correctAnswers: number;
  totalQuestions: number;
  attemptsCount: number;
  lastPlayedAt?: string;
}

export interface StudentScoreData {
  studentId: string;
  studentCode?: string;
  studentName: string;
  score: number;
  correctAnswers: number;
  totalAnswered: number;
  currentStreak: number;
  bestStreak: number;
  completedBooks: string[];
  attemptsCount: number; // Max 5 attempts allowed per student
  bookScores?: Record<string, BookScoreDetail>;
}

const STORAGE_KEY = 'bmq_quiterio_game_scores';

// Initial baseline mock leaderboard to match the reference image & lively school gamification
const BASE_LEADERBOARD: { name: string; score: number; code?: string }[] = [
  { name: 'Ana Souza', score: 3200, code: 'ANA-0005' },
  { name: 'Pedro Henrique', score: 2980, code: 'PED-0006' },
  { name: 'Lucas Alencar', score: 2760, code: 'LUC-0007' },
  { name: 'Ruan Santos da Silva', score: 2450, code: 'RUA-0004' },
  { name: 'Gustavo Oliveira', score: 2100, code: 'GUS-0001' },
  { name: 'Kalil Lopes', score: 1850, code: 'KAL-0003' },
  { name: 'Amilton Luan', score: 1600, code: 'AMI-0002' },
];

export const loadScoresMap = (): Record<string, StudentScoreData> => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Seed default baseline
      const initialMap: Record<string, StudentScoreData> = {};
      BASE_LEADERBOARD.forEach((item) => {
        const key = (item.code || item.name).toLowerCase();
        initialMap[key] = {
          studentId: key,
          studentCode: item.code,
          studentName: item.name,
          score: item.score,
          correctAnswers: Math.floor(item.score / 100),
          totalAnswered: Math.floor(item.score / 100) + 2,
          currentStreak: 2,
          bestStreak: 4,
          completedBooks: ['O Pequeno Príncipe'],
          attemptsCount: 3,
          bookScores: {
            'O Pequeno Príncipe': {
              bookTitle: 'O Pequeno Príncipe',
              bookAuthor: 'Antoine de Saint-Exupéry',
              bookCover:
                'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&auto=format&fit=crop&q=80',
              points: item.score,
              correctAnswers: Math.floor(item.score / 100),
              totalQuestions: Math.floor(item.score / 100) + 2,
              attemptsCount: 3,
              lastPlayedAt: new Date().toISOString(),
            },
          },
        };
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialMap));
      return initialMap;
    }
    return JSON.parse(raw);
  } catch {
    return {};
  }
};

export const saveScoresMap = (map: Record<string, StudentScoreData>) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // LocalStorage safe fallback
  }
};

export const getStudentGameData = (
  studentCodeOrId: string,
  fallbackName = 'Aluno'
): StudentScoreData => {
  const map = loadScoresMap();
  const cleanKey = studentCodeOrId.trim().toLowerCase().replace(/^alu-/, '');

  // Look for direct key match, code match, or name match
  for (const [key, val] of Object.entries(map)) {
    if (
      key === cleanKey ||
      (val.studentCode && val.studentCode.toLowerCase().replace(/^alu-/, '') === cleanKey) ||
      val.studentName.toLowerCase() === fallbackName.toLowerCase()
    ) {
      // Ensure defaults for backwards compatibility
      val.attemptsCount = typeof val.attemptsCount === 'number' ? val.attemptsCount : 0;
      val.bookScores = val.bookScores || {};
      return val;
    }
  }

  // Create new profile for this student
  const newProfile: StudentScoreData = {
    studentId: cleanKey,
    studentCode: studentCodeOrId,
    studentName: fallbackName,
    score: 0,
    correctAnswers: 0,
    totalAnswered: 0,
    currentStreak: 0,
    bestStreak: 0,
    completedBooks: [],
    attemptsCount: 0,
    bookScores: {},
  };
  map[cleanKey] = newProfile;
  saveScoresMap(map);
  return newProfile;
};

export const addGamePoints = (
  studentCodeOrId: string,
  studentName: string,
  points: number,
  isCorrect: boolean,
  bookTitle?: string,
  bookAuthor?: string,
  bookCover?: string
): { updatedData: StudentScoreData; rank: number } => {
  const map = loadScoresMap();
  const cleanKey = studentCodeOrId.trim().toLowerCase().replace(/^alu-/, '');

  const record = getStudentGameData(studentCodeOrId, studentName);

  if (isCorrect) {
    record.score += points;
    record.correctAnswers += 1;
    record.currentStreak += 1;
    if (record.currentStreak > record.bestStreak) {
      record.bestStreak = record.currentStreak;
    }
    if (bookTitle && !record.completedBooks.includes(bookTitle)) {
      record.completedBooks.push(bookTitle);
    }
  } else {
    record.currentStreak = 0;
  }
  record.totalAnswered += 1;
  record.studentName = studentName;
  record.studentCode = studentCodeOrId;

  // Track per-book score
  if (bookTitle) {
    record.bookScores = record.bookScores || {};
    const bKey = bookTitle.trim();
    if (!record.bookScores[bKey]) {
      record.bookScores[bKey] = {
        bookTitle: bKey,
        bookAuthor: bookAuthor || 'Literatura',
        bookCover: bookCover || '',
        points: 0,
        correctAnswers: 0,
        totalQuestions: 0,
        attemptsCount: 0,
        lastPlayedAt: new Date().toISOString(),
      };
    }
    record.bookScores[bKey].totalQuestions += 1;
    if (isCorrect) {
      record.bookScores[bKey].points += points;
      record.bookScores[bKey].correctAnswers += 1;
    }
    if (bookAuthor && !record.bookScores[bKey].bookAuthor) {
      record.bookScores[bKey].bookAuthor = bookAuthor;
    }
    if (bookCover && !record.bookScores[bKey].bookCover) {
      record.bookScores[bKey].bookCover = bookCover;
    }
    record.bookScores[bKey].lastPlayedAt = new Date().toISOString();
  }

  map[cleanKey] = record;
  saveScoresMap(map);

  // Compute school rank
  const allScores = Object.values(map).sort((a, b) => b.score - a.score);
  const rank = allScores.findIndex((item) => item.studentId === cleanKey) + 1;

  return { updatedData: record, rank: rank > 0 ? rank : 1 };
};

/**
 * Register that a full quiz attempt for a book has been completed.
 * Enforces the maximum 5 attempts rule!
 */
export const recordAttemptCompletion = (
  studentCodeOrId: string,
  studentName: string,
  bookTitle: string,
  bookAuthor?: string,
  bookCover?: string,
  pointsEarned = 0,
  correctCount = 0,
  questionsCount = 0
): { updatedData: StudentScoreData; isLimitReached: boolean } => {
  const map = loadScoresMap();
  const cleanKey = studentCodeOrId.trim().toLowerCase().replace(/^alu-/, '');
  const record = getStudentGameData(studentCodeOrId, studentName);

  // Increment total attempts up to MAX_QUIZ_ATTEMPTS
  record.attemptsCount = Math.min(MAX_QUIZ_ATTEMPTS, (record.attemptsCount || 0) + 1);

  // Update per-book attempt record
  if (bookTitle) {
    record.bookScores = record.bookScores || {};
    const bKey = bookTitle.trim();
    if (!record.bookScores[bKey]) {
      record.bookScores[bKey] = {
        bookTitle: bKey,
        bookAuthor: bookAuthor || 'Literatura',
        bookCover: bookCover || '',
        points: pointsEarned,
        correctAnswers: correctCount,
        totalQuestions: questionsCount,
        attemptsCount: 1,
        lastPlayedAt: new Date().toISOString(),
      };
    } else {
      record.bookScores[bKey].attemptsCount = (record.bookScores[bKey].attemptsCount || 0) + 1;
      if (bookCover && !record.bookScores[bKey].bookCover) {
        record.bookScores[bKey].bookCover = bookCover;
      }
      if (bookAuthor && !record.bookScores[bKey].bookAuthor) {
        record.bookScores[bKey].bookAuthor = bookAuthor;
      }
      record.bookScores[bKey].lastPlayedAt = new Date().toISOString();
    }
  }

  map[cleanKey] = record;
  saveScoresMap(map);

  return {
    updatedData: record,
    isLimitReached: record.attemptsCount >= MAX_QUIZ_ATTEMPTS,
  };
};

/**
 * Reset attempts for an individual student (admin/teacher testing utility)
 */
export const resetStudentAttempts = (
  studentCodeOrId: string,
  studentName = 'Aluno'
): StudentScoreData => {
  const map = loadScoresMap();
  const cleanKey = studentCodeOrId.trim().toLowerCase().replace(/^alu-/, '');
  const record = getStudentGameData(studentCodeOrId, studentName);

  record.attemptsCount = 0;
  map[cleanKey] = record;
  saveScoresMap(map);
  return record;
};

export const getTopSchoolRanking = (currentStudentCode?: string) => {
  const map = loadScoresMap();
  const all = Object.values(map).sort((a, b) => b.score - a.score);

  const cleanCurrent = currentStudentCode
    ? currentStudentCode.trim().toLowerCase().replace(/^alu-/, '')
    : '';

  const currentRank = cleanCurrent
    ? all.findIndex(
        (item) =>
          item.studentId === cleanCurrent ||
          (item.studentCode && item.studentCode.toLowerCase().replace(/^alu-/, '') === cleanCurrent)
      ) + 1
    : 4;

  return {
    topThree: all.slice(0, 3),
    currentRank: currentRank > 0 ? currentRank : 4,
    allLeaderboard: all,
  };
};
