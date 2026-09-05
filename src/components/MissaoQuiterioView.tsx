import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Star,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  BookOpen,
  Award,
  BookMarked,
  Flame,
  Volume2,
  VolumeX,
  ChevronRight,
  GraduationCap,
  X,
  ShieldAlert,
  ArrowLeft,
  User,
  AlertCircle,
  Check,
  Play,
  Database,
  Search,
  BadgeCheck,
  BookCheck,
  ArrowRightLeft,
  Layers,
  Bookmark,
} from 'lucide-react';
import { Book, Loan, Student, UserSession } from '../types';
import { useTheme } from '../context/ThemeContext';
import { QuiterioMascot, MascotMood } from './QuiterioMascot';
import { getQuestionsForBook, QuizQuestion } from '../data/quizQuestions';
import {
  getStudentGameData,
  addGamePoints,
  getTopSchoolRanking,
  recordAttemptCompletion,
  resetStudentAttempts,
  MAX_QUIZ_ATTEMPTS,
  StudentScoreData,
  BookScoreDetail,
} from '../utils/quiterioScores';
import {
  playCorrectSound,
  playWrongSound,
  playTickSound,
  playCatMeowSound,
  playCelebrationSound,
  setSoundEnabled,
} from '../utils/gameAudio';

interface MissaoQuiterioViewProps {
  books: Book[];
  loans: Loan[];
  students: Student[];
  currentSession: UserSession;
  onSelectBook?: (book: Book) => void;
  onNavigateToCatalog?: () => void;
  onNavigateToRanking?: () => void;
  onBackToHome?: () => void;
}

// Sample students for quick selection and easy testing on smartphone
const SAMPLE_STUDENTS = [
  { code: 'VER-0001', name: 'Veronica Gonçalves', class: '1º Ano A', bookTitle: 'Desenganos da vida Humana' },
  { code: 'RUA-0004', name: 'Ruan Santos da Silva', class: '1º A', bookTitle: 'Poemas Escolhidos' },
  { code: 'KEM-0008', name: 'Kemilly Santana', class: '2º A', bookTitle: 'Poesias reunidas' },
  { code: 'KAL-0003', name: 'Kalil Lopes', class: '2º A', bookTitle: 'História e Memória do Município' },
  { code: 'ELI-0010', name: 'Eliel Bastos', class: '3º A', bookTitle: 'As Melhores Histórias de Fernando Sabino' },
  { code: 'ADR-0007', name: 'Adrielly', class: '1º B', bookTitle: 'O Cortiço' },
  { code: 'KAI-0009', name: 'Kailan', class: '1º A', bookTitle: 'Dom Casmurro' },
];

// 30 seconds timer per question, exactly as in the reference video
const QUESTION_TIMER_SECONDS = 30;

export const MissaoQuiterioView: React.FC<MissaoQuiterioViewProps> = ({
  books,
  loans,
  students,
  currentSession,
  onNavigateToCatalog,
  onNavigateToRanking,
  onBackToHome,
}) => {
  const { isDark } = useTheme();

  // Student Identification State: If user is logged in as a student in session, use it;
  // otherwise null, and automatically request student code on open!
  const initialStudent = currentSession.student || null;

  const [activeStudent, setActiveStudent] = useState<Student | null>(initialStudent);
  const [studentCodeInput, setStudentCodeInput] = useState<string>(
    initialStudent?.studentCode || ''
  );
  // Prompt for student code automatically whenever there is no authenticated student!
  const [isCodeModalOpen, setIsCodeModalOpen] = useState<boolean>(!initialStudent);
  const [codeError, setCodeError] = useState<string>('');
  const [failedAttempts, setFailedAttempts] = useState<number>(0);
  const [isReturningHome, setIsReturningHome] = useState<boolean>(false);
  const [isBadgesModalOpen, setIsBadgesModalOpen] = useState<boolean>(false);
  const [isBookSelectorModalOpen, setIsBookSelectorModalOpen] = useState<boolean>(false);
  const [showSchoolPodiumMobile, setShowSchoolPodiumMobile] = useState<boolean>(false);

  // Book Selector Modal State for matching student loans database
  const [bookSelectorTab, setBookSelectorTab] = useState<'loans' | 'catalog'>('loans');
  const [bookSelectorFilter, setBookSelectorFilter] = useState<'all' | 'active'>('all');
  const [bookSearchQuery, setBookSearchQuery] = useState<string>('');

  // Audio mute state
  const [soundOn, setSoundOn] = useState<boolean>(true);

  // Score & Gamification Data
  const [gameData, setGameData] = useState<StudentScoreData>(() => {
    const codeOrId = activeStudent?.studentCode || activeStudent?.id || 'visitante';
    return getStudentGameData(codeOrId, activeStudent?.name || 'Estudante Convidado');
  });

  // Animated rolling score display for juicy 3D gaming feel
  const [displayScore, setDisplayScore] = useState<number>(() => {
    const codeOrId = activeStudent?.studentCode || activeStudent?.id || 'visitante';
    return getStudentGameData(codeOrId, activeStudent?.name || 'Estudante Convidado').score;
  });

  useEffect(() => {
    if (gameData.score !== displayScore) {
      const start = displayScore;
      const end = gameData.score;
      const duration = 650;
      const startTime = performance.now();

      const animate = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const current = Math.round(start + (end - start) * progress);
        setDisplayScore(current);
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    }
  }, [gameData.score]);

  // Controls displaying the mascot's book-by-book scoreboard view
  // DEFAULT TO FALSE so the Quiz Card, Active Question, and Countdown Clock are ALWAYS VISIBLE!
  const [showBookScoresView, setShowBookScoresView] = useState<boolean>(false);

  const [leaderboard, setLeaderboard] = useState(() =>
    getTopSchoolRanking(activeStudent?.studentCode)
  );

  // Sync when student changes
  useEffect(() => {
    if (activeStudent) {
      const data = getStudentGameData(
        activeStudent.studentCode || activeStudent.id,
        activeStudent.name
      );
      setGameData(data);
      setLeaderboard(getTopSchoolRanking(activeStudent.studentCode));
    }
  }, [activeStudent]);

  // Cross-reference books borrowed or returned by this student from the database
  const studentLoans = useMemo(() => {
    if (!activeStudent) return [];
    const sCode = (activeStudent.studentCode || '').trim().toLowerCase().replace(/^alu-/, '');
    const sId = (activeStudent.id || '').trim().toLowerCase().replace(/^alu-/, '');
    const sName = (activeStudent.name || '').trim().toLowerCase();
    const sEmail = (activeStudent.email || '').trim().toLowerCase();

    return loans.filter((l) => {
      const lCode = (l.studentCode || '').trim().toLowerCase().replace(/^alu-/, '');
      const lName = (l.studentName || '').trim().toLowerCase();
      const lEmail = (l.studentEmail || '').trim().toLowerCase();

      const codeMatch = (sCode && lCode === sCode) || (sId && lCode === sId);
      const emailMatch = sEmail && lEmail && sEmail === lEmail;
      const nameMatch = sName && lName && (sName === lName || sName.includes(lName) || lName.includes(sName));

      return codeMatch || emailMatch || nameMatch;
    });
  }, [activeStudent, loans]);

  // Active loans (in progress or overdue) and returned loans from database
  const activeStudentLoans = useMemo(() => {
    return studentLoans.filter((l) => l.status === 'em_andamento' || l.status === 'atrasado');
  }, [studentLoans]);

  const returnedStudentLoans = useMemo(() => {
    return studentLoans.filter((l) => l.status === 'devolvido');
  }, [studentLoans]);

  // Unique books from student's loans, sorted by active/overdue loans first
  const studentBooks = useMemo(() => {
    const map = new Map<string, { book: Book; loan: Loan }>();
    studentLoans.forEach((loan) => {
      const matchedBook =
        books.find((b) => b.id === loan.bookId) ||
        books.find((b) => b.title.trim().toLowerCase() === loan.bookTitle.trim().toLowerCase()) || {
          id: loan.bookId || `loan_${loan.id}`,
          title: loan.bookTitle,
          author: loan.bookAuthor,
          cover: loan.bookCover || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&auto=format&fit=crop&q=80',
          category: 'Literatura',
          rating: 5,
          reviewsCount: 1,
          status: 'disponivel',
          pages: 100,
          year: 2026,
          publisher: 'Biblioteca Maria Quitéria',
          location: 'Geral',
          synopsis: `Obra emprestada para o aluno ${loan.studentName}.`,
          isbn: '000-0000000000',
          totalCopies: 1,
          availableCopies: 1,
        };

      const key = (loan.bookId || matchedBook.id || loan.bookTitle).trim().toLowerCase();
      if (!map.has(key)) {
        map.set(key, { book: matchedBook, loan });
      }
    });

    const list = Array.from(map.values());
    list.sort((a, b) => {
      const priority = { atrasado: 0, em_andamento: 1, devolvido: 2 };
      return (priority[a.loan.status] ?? 3) - (priority[b.loan.status] ?? 3);
    });
    return list;
  }, [studentLoans, books]);

  // Default book for quiz: Strictly prioritize the student's borrowed book from the database!
  const defaultBook = useMemo(() => {
    if (studentBooks.length > 0) {
      const activeOrOverdue = studentBooks.find(
        (sb) => sb.loan.status === 'em_andamento' || sb.loan.status === 'atrasado'
      );
      if (activeOrOverdue) return activeOrOverdue.book;
      return studentBooks[0].book;
    }
    const opp = books.find((b) => b.title.toLowerCase().includes('pequeno príncipe'));
    if (opp) return opp;
    return (
      books[0] || {
        id: 'default_book',
        title: 'O Pequeno Príncipe',
        author: 'Antoine de Saint-Exupéry',
        cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&auto=format&fit=crop&q=80',
        category: 'Clássico',
        rating: 5,
        reviewsCount: 42,
        status: 'disponivel',
        pages: 96,
        year: 1943,
        publisher: 'Reynal & Hitchcock',
        location: 'Estante A1',
        synopsis: 'Um clássico atemporal sobre amizade e valores humanos.',
        isbn: '9788522005239',
        totalCopies: 5,
        availableCopies: 3,
      }
    );
  }, [books, studentBooks]);

  const [selectedBookForQuiz, setSelectedBookForQuiz] = useState<Book>(defaultBook);

  // Automatically synchronize selected book with student loans from database
  useEffect(() => {
    if (activeStudent && studentBooks.length > 0) {
      const isAlreadyInLoans = studentBooks.some(
        (sb) =>
          sb.book.id === selectedBookForQuiz.id ||
          sb.book.title.trim().toLowerCase() === selectedBookForQuiz.title.trim().toLowerCase()
      );
      if (!isAlreadyInLoans || selectedBookForQuiz.id === 'default_book') {
        const activeOrOverdue = studentBooks.find(
          (sb) => sb.loan.status === 'em_andamento' || sb.loan.status === 'atrasado'
        );
        const bookToUse = activeOrOverdue ? activeOrOverdue.book : studentBooks[0].book;
        setSelectedBookForQuiz(bookToUse);
      }
    }
  }, [activeStudent, studentBooks]);

  // Check if current selected quiz book matches an active/past loan of this student in the database
  const currentMatchedLoan = useMemo(() => {
    if (!activeStudent || !selectedBookForQuiz) return null;
    const match = studentBooks.find(
      (sb) =>
        sb.book.id === selectedBookForQuiz.id ||
        sb.book.title.trim().toLowerCase() === selectedBookForQuiz.title.trim().toLowerCase()
    );
    return match ? match.loan : null;
  }, [activeStudent, selectedBookForQuiz, studentBooks]);

  // Current Question Set
  const currentQuestions: QuizQuestion[] = useMemo(() => {
    return getQuestionsForBook(selectedBookForQuiz);
  }, [selectedBookForQuiz]);

  // Quiz Game State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(QUESTION_TIMER_SECONDS);
  const [isTimerActive, setIsTimerActive] = useState<boolean>(true);
  const [isGameStarted, setIsGameStarted] = useState<boolean>(true);
  const [roundCompleted, setRoundCompleted] = useState<boolean>(false);
  const [roundStats, setRoundStats] = useState({ correct: 0, pointsEarned: 0 });
  const [floatingScore, setFloatingScore] = useState<number | null>(null);
  const [coverHasError, setCoverHasError] = useState<boolean>(false);

  // Mascot Mood & Speech Bubble Text (Exact from video)
  const [mascotMood, setMascotMood] = useState<MascotMood>('talking');
  const [isMeowing, setIsMeowing] = useState<boolean>(false);
  const [speechBubbleText, setSpeechBubbleText] = useState<string>(
    'Vamos testar seu conhecimento sobre o livro que você leu? 🐾'
  );

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const autoAdvanceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentQuestionIndexRef = useRef<number>(0);
  const roundStatsRef = useRef({ correct: 0, pointsEarned: 0 });

  const activeQuestion: QuizQuestion | undefined = currentQuestions[currentQuestionIndex];

  // Reset question state
  const startQuestion = (idx: number, activateTimer = true) => {
    if (autoAdvanceTimeoutRef.current) {
      clearTimeout(autoAdvanceTimeoutRef.current);
      autoAdvanceTimeoutRef.current = null;
    }
    currentQuestionIndexRef.current = idx;
    setCurrentQuestionIndex(idx);
    setSelectedOption(null);
    setIsAnswered(false);
    setIsCorrect(false);
    setTimeLeft(QUESTION_TIMER_SECONDS);
    setIsTimerActive(activateTimer);
    setMascotMood('talking');
    setIsMeowing(false);
    setSpeechBubbleText('Vamos testar seu conhecimento sobre o livro que você leu? 🐾');
    setFloatingScore(null);
    setCoverHasError(false);
  };

  // Start Playing - Triggered exclusively when the student clicks "Jogar"
  const handleStartGame = () => {
    if ((gameData.attemptsCount || 0) >= MAX_QUIZ_ATTEMPTS) {
      setShowBookScoresView(true);
      setMascotMood('talking');
      setSpeechBubbleText(
        'Miau! Você já utilizou todas as 5 tentativas disponíveis! Veja sua pontuação em cada livro! 🐾'
      );
      return;
    }
    setIsGameStarted(true);
    setIsTimerActive(true);
    setTimeLeft(QUESTION_TIMER_SECONDS);
    setMascotMood('talking');
    setIsMeowing(true);
    setSpeechBubbleText('Miau! Valendo! 🐾 Responda antes que os 30 segundos acabem!');
    if (soundOn) playCatMeowSound();
    setTimeout(() => {
      setIsMeowing(false);
    }, 1800);
  };

  const handlePetQuiterio = () => {
    if (soundOn) playCatMeowSound();
    setIsMeowing(true);
    setSpeechBubbleText('Miau!! 🐾 Quitério adora carinho e leitores dedicados!');
    setTimeout(() => {
      setIsMeowing(false);
    }, 2200);
  };

  // Timer countdown
  useEffect(() => {
    if (!isTimerActive || isAnswered || roundCompleted) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleTimeUp();
          return 0;
        }
        if (prev <= 6 && soundOn) {
          playTickSound();
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (autoAdvanceTimeoutRef.current) clearTimeout(autoAdvanceTimeoutRef.current);
    };
  }, [isTimerActive, isAnswered, roundCompleted, soundOn]);

  const handleTimeUp = () => {
    if (autoAdvanceTimeoutRef.current) {
      clearTimeout(autoAdvanceTimeoutRef.current);
      autoAdvanceTimeoutRef.current = null;
    }
    setIsAnswered(true);
    setIsCorrect(false);
    setIsTimerActive(false);
    setMascotMood('thinking');
    setSpeechBubbleText('O tempo acabou! Mas não desanime, o aprendizado continua! 🐾');
    if (soundOn) playWrongSound();

    // Pula para a próxima pergunta automaticamente após o tempo acabar
    autoAdvanceTimeoutRef.current = setTimeout(() => {
      handleNextQuestion();
    }, 550);
  };

  // Handle Option Click
  const handleSelectOption = (index: number) => {
    if (isAnswered) {
      handleNextQuestion();
      return;
    }
    if (!activeQuestion) return;

    if (autoAdvanceTimeoutRef.current) {
      clearTimeout(autoAdvanceTimeoutRef.current);
      autoAdvanceTimeoutRef.current = null;
    }

    setIsAnswered(true);
    setIsTimerActive(false);
    setSelectedOption(index);

    const correct = index === activeQuestion.correctIndex;
    setIsCorrect(correct);

    const studentKey = activeStudent?.studentCode || activeStudent?.id || 'aluno_anonimo';
    const studentName = activeStudent?.name || 'Leitor Apaixonado';

    if (correct) {
      const totalPoints = 100;

      setFloatingScore(totalPoints);
      setMascotMood('celebrating');
      setIsMeowing(true);
      setSpeechBubbleText('Miau!! 🐾 Você mandou bem! Continua lendo e acertando as perguntas!');

      if (soundOn) {
        playCorrectSound();
        setTimeout(() => {
          playCatMeowSound();
        }, 250);
      }

      // Confetti burst
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#38bdf8', '#fbbf24', '#34d399', '#f43f5e', '#a855f7'],
        });
      } catch {
        // Confetti fallback
      }

      roundStatsRef.current.correct += 1;
      roundStatsRef.current.pointsEarned += totalPoints;
      setRoundStats({ ...roundStatsRef.current });

      // Persist score & update leaderboard
      const { updatedData } = addGamePoints(
        studentKey,
        studentName,
        totalPoints,
        true,
        selectedBookForQuiz.title,
        selectedBookForQuiz.author,
        selectedBookForQuiz.cover
      );
      setGameData(updatedData);
      setLeaderboard(getTopSchoolRanking(activeStudent?.studentCode));
    } else {
      setMascotMood('thinking');
      setIsMeowing(false);
      setSpeechBubbleText('Quase lá! Na próxima pergunta você brilha! Continue lendo! 🐾');

      if (soundOn) playWrongSound();

      const { updatedData } = addGamePoints(
        studentKey,
        studentName,
        0,
        false,
        selectedBookForQuiz.title,
        selectedBookForQuiz.author,
        selectedBookForQuiz.cover
      );
      setGameData(updatedData);
      setLeaderboard(getTopSchoolRanking(activeStudent?.studentCode));
    }

    // Pula para a próxima pergunta automaticamente de forma rápida (450ms) tanto se acertar quanto se errar
    autoAdvanceTimeoutRef.current = setTimeout(() => {
      handleNextQuestion();
    }, 450);
  };

  // Next Question or Complete with 5-attempt limit tracking
  const handleNextQuestion = () => {
    if (autoAdvanceTimeoutRef.current) {
      clearTimeout(autoAdvanceTimeoutRef.current);
      autoAdvanceTimeoutRef.current = null;
    }
    const nextIdx = currentQuestionIndexRef.current + 1;
    if (nextIdx < currentQuestions.length) {
      startQuestion(nextIdx, true);
    } else {
      const studentKey = activeStudent?.studentCode || activeStudent?.id || 'aluno_anonimo';
      const studentName = activeStudent?.name || 'Leitor Apaixonado';

      // Record completed attempt for this book (enforcing max 5 attempts)
      const { updatedData, isLimitReached } = recordAttemptCompletion(
        studentKey,
        studentName,
        selectedBookForQuiz.title,
        selectedBookForQuiz.author,
        selectedBookForQuiz.cover,
        roundStatsRef.current.pointsEarned,
        roundStatsRef.current.correct,
        currentQuestions.length
      );

      setGameData(updatedData);
      setLeaderboard(getTopSchoolRanking(activeStudent?.studentCode));
      setRoundCompleted(true);
      setIsTimerActive(false);
      setIsGameStarted(false);

      if (isLimitReached) {
        setMascotMood('celebrating');
        setIsMeowing(true);
        setSpeechBubbleText(
          'Miau!! 🎓 Incrível! Você completou sua 5ª e última tentativa! Veja sua pontuação para cada livro! 🐾'
        );
        setShowBookScoresView(true);
        if (soundOn) playCelebrationSound();
      } else {
        setMascotMood('celebrating');
        setSpeechBubbleText(
          `Parabéns, Leitor de Ouro! Tentativa ${updatedData.attemptsCount} de ${MAX_QUIZ_ATTEMPTS} concluída com sucesso! 🏆`
        );
        if (soundOn) playCelebrationSound();
      }
    }
  };

  const restartQuiz = () => {
    if ((gameData.attemptsCount || 0) >= MAX_QUIZ_ATTEMPTS) {
      setShowBookScoresView(true);
      setMascotMood('talking');
      setSpeechBubbleText(
        'Miau! Você já utilizou suas 5 tentativas na Missão! Não é possível iniciar novas partidas. Veja sua pontuação por livro! 🐾'
      );
      return;
    }
    roundStatsRef.current = { correct: 0, pointsEarned: 0 };
    setRoundCompleted(false);
    setRoundStats({ correct: 0, pointsEarned: 0 });
    setShowBookScoresView(false);
    setIsGameStarted(false);
    startQuestion(0, false);
    setMascotMood('talking');
    setSpeechBubbleText('Miau! Pronto para uma nova rodada? Clique em Jogar para iniciar o tempo! 🐾');
  };

  const handleSelectBookForQuiz = (book: Book, isFromLoans: boolean = false) => {
    setIsBookSelectorModalOpen(false);
    if ((gameData.attemptsCount || 0) >= MAX_QUIZ_ATTEMPTS) {
      setShowBookScoresView(true);
      setMascotMood('talking');
      setSpeechBubbleText(
        'Miau! Você já utilizou todas as 5 tentativas disponíveis! Veja sua pontuação em cada livro! 🐾'
      );
      return;
    }
    roundStatsRef.current = { correct: 0, pointsEarned: 0 };
    setSelectedBookForQuiz(book);
    setRoundCompleted(false);
    setRoundStats({ correct: 0, pointsEarned: 0 });
    setShowBookScoresView(false);
    setIsGameStarted(false);
    startQuestion(0, false);
    setMascotMood('talking');
    if (isFromLoans) {
      setSpeechBubbleText(`Miau! Livro "${book.title}" sincronizado com o seu empréstimo no banco de dados! Clique em Jogar para iniciar o tempo! 🐾`);
    } else {
      setSpeechBubbleText(`Miau! Livro "${book.title}" selecionado para o desafio! Clique em Jogar para iniciar o tempo! 🐾`);
    }
  };

  // Student Identification Modal handler with code verification and sample student support
  const selectStudentByCode = (rawCode: string) => {
    setCodeError('');
    const cleanInput = rawCode.trim().toLowerCase().replace(/^alu-/, '');

    // 1. Search in main students array
    let foundStudent = students.find((s) => {
      const sCode = (s.studentCode || '').trim().toLowerCase().replace(/^alu-/, '');
      const sId = (s.id || '').trim().toLowerCase().replace(/^alu-/, '');
      return sCode === cleanInput || sId === cleanInput;
    });

    // 2. Search in sample students
    if (!foundStudent) {
      const sampleMatch = SAMPLE_STUDENTS.find(
        (s) => s.code.toLowerCase().replace(/^alu-/, '') === cleanInput
      );
      if (sampleMatch) {
        foundStudent = {
          id: sampleMatch.code,
          studentCode: sampleMatch.code,
          name: sampleMatch.name,
          email: `${sampleMatch.code.toLowerCase()}@escola.edu.br`,
          class: sampleMatch.class,
          avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
          activeLoansCount: 1,
          totalLoansCount: 5,
          joinedDate: '2026-02-10',
        };
      }
    }

    if (!foundStudent) {
      if (soundOn) playWrongSound();
      const nextCount = failedAttempts + 1;
      setFailedAttempts(nextCount);

      if (nextCount >= 3) {
        setCodeError(
          'Código incorreto! Limite de 3 tentativas atingido. Retornando ao início...'
        );
        setIsReturningHome(true);
        setTimeout(() => {
          setIsCodeModalOpen(false);
          if (onBackToHome) {
            onBackToHome();
          }
        }, 1500);
      } else {
        const remaining = 3 - nextCount;
        setCodeError(
          `Código de aluno incorreto! Tentativa ${nextCount} de 3 (restam ${remaining} ${
            remaining === 1 ? 'tentativa' : 'tentativas'
          }).`
        );
      }
      return;
    }

    setFailedAttempts(0);
    setIsReturningHome(false);
    setActiveStudent(foundStudent);
    setIsCodeModalOpen(false);
    setCodeError('');
    setShowBookScoresView(false);
    setIsGameStarted(true);
    setIsTimerActive(true);
    setTimeLeft(QUESTION_TIMER_SECONDS);

    // Synchronize loan books from the student database
    const matchedLoans = loans.filter((l) => {
      const sCode = (foundStudent!.studentCode || '').trim().toLowerCase().replace(/^alu-/, '');
      const sId = (foundStudent!.id || '').trim().toLowerCase().replace(/^alu-/, '');
      const sName = (foundStudent!.name || '').trim().toLowerCase();
      const sEmail = (foundStudent!.email || '').trim().toLowerCase();

      const lCode = (l.studentCode || '').trim().toLowerCase().replace(/^alu-/, '');
      const lName = (l.studentName || '').trim().toLowerCase();
      const lEmail = (l.studentEmail || '').trim().toLowerCase();

      const codeMatch = (sCode && lCode === sCode) || (sId && lCode === sId);
      const emailMatch = sEmail && lEmail && sEmail === lEmail;
      const nameMatch = sName && lName && (sName === lName || sName.includes(lName) || lName.includes(sName));

      return codeMatch || emailMatch || nameMatch;
    });

    if (matchedLoans.length > 0) {
      const activeOrOverdue = matchedLoans.find(
        (l) => l.status === 'em_andamento' || l.status === 'atrasado'
      ) || matchedLoans[0];

      const foundBook =
        books.find((b) => b.id === activeOrOverdue.bookId) ||
        books.find((b) => b.title.trim().toLowerCase() === activeOrOverdue.bookTitle.trim().toLowerCase()) || {
          id: activeOrOverdue.bookId || `loan_${activeOrOverdue.id}`,
          title: activeOrOverdue.bookTitle,
          author: activeOrOverdue.bookAuthor,
          cover: activeOrOverdue.bookCover || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&auto=format&fit=crop&q=80',
          category: 'Literatura',
          rating: 5,
          reviewsCount: 1,
          status: 'disponivel',
          pages: 100,
          year: 2026,
          publisher: 'Biblioteca Maria Quitéria',
          location: 'Geral',
          synopsis: `Obra do empréstimo de ${activeOrOverdue.studentName}.`,
          isbn: '000-0000000000',
          totalCopies: 1,
          availableCopies: 1,
        };

      setSelectedBookForQuiz(foundBook);
      setSpeechBubbleText(
        `Miau! Olá ${foundStudent.name}! Identifiquei seu empréstimo do livro "${foundBook.title}" no banco de dados! Clique em Jogar para iniciar! 🐾`
      );
    } else {
      setSpeechBubbleText(
        `Miau! Olá ${foundStudent.name}! Não encontramos empréstimos ativos no banco de dados, mas você pode praticar o Quiz com os livros do acervo! 🐾`
      );
    }

    const existingData = getStudentGameData(
      foundStudent.studentCode || foundStudent.id,
      foundStudent.name
    );
    setGameData(existingData);
    setLeaderboard(getTopSchoolRanking(foundStudent.studentCode));
  };

  const handleIdentifyStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReturningHome) return;
    if (!studentCodeInput.trim()) {
      setCodeError('Por favor, digite seu Código de Aluno.');
      return;
    }
    selectStudentByCode(studentCodeInput);
  };

  const handleResetAttempts = () => {
    if (!activeStudent) return;
    const code = activeStudent.studentCode || activeStudent.id;
    const updated = resetStudentAttempts(code, activeStudent.name);
    setGameData({ ...updated });
    setShowBookScoresView(false);
    setIsGameStarted(true);
    setIsTimerActive(true);
    setTimeLeft(QUESTION_TIMER_SECONDS);
    setMascotMood('talking');
    setSpeechBubbleText('Miau! Suas tentativas foram reiniciadas! Boa sorte no desafio! 🐾');
    if (soundOn) playCatMeowSound();
  };

  // Handle Close Modal: always returns to home screen as requested
  const handleCloseModal = () => {
    setIsCodeModalOpen(false);
    if (onBackToHome) {
      onBackToHome();
    }
  };

  return (
    <div
      className={`min-h-[calc(100vh-80px)] py-4 px-3 sm:px-6 relative overflow-hidden transition-colors ${
        isDark
          ? 'bg-gradient-to-b from-[#0d0520] via-[#160a36] to-[#0a0319] text-slate-100'
          : 'bg-gradient-to-b from-[#0d0520] via-[#160a36] to-[#0a0319] text-white'
      }`}
    >
      {/* Background Soft Stars Atmosphere with Floating Twinkling Lights */}
      <div
        className="absolute inset-0 pointer-events-none opacity-35 bg-[radial-gradient(#f59e0b_1.2px,transparent_1.2px)] [background-size:24px_24px]"
        aria-hidden="true"
      />
      {[
        { top: '8%', left: '6%', size: 'w-4 h-4', delay: 0, duration: 4.2 },
        { top: '18%', left: '92%', size: 'w-5 h-5', delay: 1.1, duration: 4.8 },
        { top: '60%', left: '4%', size: 'w-3.5 h-3.5', delay: 0.6, duration: 3.9 },
        { top: '75%', left: '94%', size: 'w-4 h-4', delay: 1.7, duration: 4.5 },
        { top: '30%', left: '12%', size: 'w-3 h-3', delay: 2.2, duration: 3.6 },
        { top: '82%', left: '48%', size: 'w-4 h-4', delay: 0.9, duration: 4.4 },
        { top: '12%', left: '80%', size: 'w-3 h-3', delay: 1.4, duration: 3.8 },
      ].map((s, idx) => (
        <motion.div
          key={idx}
          animate={{
            y: [0, -12, 0],
            opacity: [0.3, 0.9, 0.3],
            scale: [0.9, 1.25, 0.9],
          }}
          transition={{
            repeat: Infinity,
            duration: s.duration,
            delay: s.delay,
            ease: 'easeInOut',
          }}
          className={`absolute pointer-events-none text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)] ${s.size}`}
          style={{ top: s.top, left: s.left }}
        >
          <Sparkles className="w-full h-full fill-amber-300 text-amber-300" />
        </motion.div>
      ))}

      <div className="max-w-6xl mx-auto relative z-10 flex flex-col gap-4 sm:gap-5">
        {/* ========================================================================= */}
        {/* 1. TOP HEADER BANNER: "RANKING DA LEITURA - Desafie-se • Leia • Conquiste Pontos!" */}
        {/* ========================================================================= */}
        <div className="relative flex flex-col items-center justify-center text-center pt-1 pb-1">
          {/* Back to Home button */}
          {onBackToHome && (
            <div className="absolute left-0 top-0 flex items-center gap-2">
              <button
                id="btn-quiterio-back-home"
                type="button"
                onClick={onBackToHome}
                title="Voltar para a Página Inicial"
                className="px-3 py-1.5 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md backdrop-blur-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Início</span>
              </button>
            </div>
          )}

          {/* Sound & Student Profile button */}
          <div className="absolute right-0 top-0 flex items-center gap-2">
            <button
              id="btn-quiterio-sound-toggle"
              onClick={() => {
                const next = !soundOn;
                setSoundOn(next);
                setSoundEnabled(next);
              }}
              title={soundOn ? 'Desativar Sons' : 'Ativar Sons'}
              className={`p-2 rounded-full border transition-all cursor-pointer shadow-md ${
                soundOn
                  ? 'bg-amber-400 text-amber-950 border-amber-300 hover:bg-amber-300 hover:scale-105'
                  : 'bg-slate-700/80 text-slate-300 border-slate-600 hover:bg-slate-600'
              }`}
            >
              {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>

          {/* 3D Stylized Title Banner (Exact match to video, optimized for Smartphone & Desktop) */}
          <motion.div
            initial={{ y: -16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 280, damping: 20 }}
            className="flex flex-col items-center px-1"
          >
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-amber-300 to-amber-500 drop-shadow-[0_4px_0_#9a3412] text-center leading-tight">
              Ranking da Leitura
            </h1>
            {/* Arched subtitle ribbon */}
            <div className="mt-1 px-3 sm:px-6 py-0.5 sm:py-1 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 text-amber-950 text-[11px] sm:text-xs md:text-sm font-black shadow-[0_2px_0_#b45309] tracking-wide flex items-center gap-1.5 sm:gap-2 border-2 border-amber-200">
              <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-950" />
              <span>Desafie-se • Leia • Conquiste Pontos!</span>
              <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-950" />
            </div>
          </motion.div>
        </div>

        {/* ========================================================================= */}
        {/* 2. TOP CARDS BAR: Smartphone Compact Bar (< md) OR Desktop 2-Cols (>= md) */}
        {/* ========================================================================= */}

        {/* --- MOBILE VIEW: Compact Single Bar with 0 overflow and ~70px height --- */}
        <div className="md:hidden flex flex-col gap-2">
          <div className="p-2.5 sm:p-3 rounded-2xl border-3 border-[#ea580c] border-b-[5px] border-[#9a3412] bg-[#2e1065] shadow-[0_4px_0_#7c2d12]">
            <div className="flex items-center justify-between gap-2">
              {/* Mascot Mini Portrait + Student Identification */}
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div
                  onClick={() => setIsCodeModalOpen(true)}
                  title="Trocar aluno / Digitar código"
                  className="w-10 h-10 rounded-full border-2 border-amber-300 border-b-2 border-amber-600 bg-[#ea580c] flex items-center justify-center overflow-hidden flex-shrink-0 cursor-pointer shadow-sm active:scale-95"
                >
                  <QuiterioMascot size="sm" className="scale-60 -mt-2" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-white truncate max-w-[125px]">
                      {activeStudent ? activeStudent.name : 'Convidado'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsCodeModalOpen(true)}
                      className="text-[10px] font-black text-[#facc15] hover:text-white underline cursor-pointer flex-shrink-0"
                    >
                      {activeStudent ? 'Trocar' : 'Código'}
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-amber-300/90 font-medium">
                    <span>🐾 {gameData.attemptsCount || 0}/{MAX_QUIZ_ATTEMPTS} chances</span>
                    <span>•</span>
                    <span className="text-amber-200 font-bold">#{leaderboard.currentRank} lugar</span>
                  </div>
                </div>
              </div>

              {/* Score Pill with Star - Guaranteed NO overflow on smartphone */}
              <div className="flex items-center gap-1.5 bg-gradient-to-b from-[#ffd200] via-[#ffbe00] to-[#f59e0b] text-[#3b1404] px-3 py-1 rounded-xl border-2 border-amber-200 border-b-2 border-[#b45309] shadow-xs flex-shrink-0">
                <Star className="w-4 h-4 fill-[#3b1404] text-[#3b1404]" />
                <span className="text-lg sm:text-xl font-black font-mono tracking-tight">{displayScore}</span>
              </div>
            </div>

            {/* Quick action bar for mobile */}
            <div className="mt-2 pt-1.5 border-t border-purple-900/60 flex items-center justify-between text-[11px]">
              <button
                type="button"
                onClick={() => setShowSchoolPodiumMobile(!showSchoolPodiumMobile)}
                className="text-[#facc15] hover:text-white font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>🏆 {showSchoolPodiumMobile ? 'Ocultar Pódio' : 'Ver Pódio da Escola'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowBookScoresView(!showBookScoresView)}
                  className="text-amber-200 hover:text-white font-bold underline cursor-pointer"
                >
                  {showBookScoresView ? 'Ir para o Quiz' : 'Pontos por Livro'}
                </button>
              </div>
            </div>
          </div>

          {/* Collapsible Mobile School Podium */}
          <AnimatePresence>
            {showSchoolPodiumMobile && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3 rounded-2xl border-3 border-[#ea580c] border-b-4 border-[#9a3412] bg-[#2e1065] shadow-md text-white space-y-1.5"
              >
                <div className="text-xs font-black text-[#facc15] uppercase tracking-wider mb-1">
                  Top 3 Leitores da Escola:
                </div>
                {leaderboard.topThree.slice(0, 3).map((item, idx) => {
                  const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉';
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between px-2.5 py-1 rounded-lg bg-[#1e0a3c] border border-purple-900/50 text-xs"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>{medal}</span>
                        <span className="font-bold truncate max-w-[130px]">{item.studentName}</span>
                      </div>
                      <span className="font-mono font-black text-[#facc15]">{item.score} pts</span>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* --- DESKTOP VIEW: 2-Column Expanded Cards (Hidden on mobile < md) --- */}
        <div className="hidden md:grid md:grid-cols-2 gap-3 sm:gap-4 items-stretch">
          {/* Top Left Card: Sua Pontuação (Matching uploaded image) */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="relative p-4 sm:p-5 rounded-3xl border-4 border-[#ea580c] border-b-[6px] border-[#9a3412] bg-[#2e1065] shadow-[0_6px_0_#7c2d12,0_10px_25px_rgba(0,0,0,0.5)] flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3.5">
              {/* Mascot Mini Portrait in circular gold-bordered frame with orange background */}
              <div
                onClick={() => setIsCodeModalOpen(true)}
                title="Trocar aluno"
                className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-amber-300 border-b-3 border-amber-600 bg-[#ea580c] flex items-center justify-center overflow-hidden shadow-md flex-shrink-0 cursor-pointer hover:scale-105 transition-transform"
              >
                <QuiterioMascot size="sm" className="scale-65 -mt-3" />
              </div>

              <div>
                <span className="text-xs sm:text-sm font-black text-[#facc15] uppercase tracking-wider block drop-shadow-xs">
                  Sua Pontuação
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-base sm:text-lg font-black text-white truncate max-w-[170px]">
                    {activeStudent ? activeStudent.name : 'Aluno Convidado'}
                  </span>
                  <button
                    onClick={() => setIsCodeModalOpen(true)}
                    className="text-xs font-black text-[#facc15] hover:text-yellow-200 underline cursor-pointer"
                    title="Trocar Aluno"
                  >
                    Trocar
                  </button>
                </div>

                {/* 🐾 Tentativas 5/5 Counter Pill */}
                <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-[11px] font-black uppercase px-2.5 py-0.5 rounded-lg border flex items-center gap-1 shadow-inner ${
                      (gameData.attemptsCount || 0) >= MAX_QUIZ_ATTEMPTS
                        ? 'bg-rose-500/30 text-rose-200 border-rose-400/60'
                        : 'bg-[#1e0a3c] text-[#facc15] border-purple-900/60'
                    }`}
                  >
                    <span>🐾</span>
                    <span>
                      Tentativas: <strong>{gameData.attemptsCount || 0}/{MAX_QUIZ_ATTEMPTS}</strong>
                      {(gameData.attemptsCount || 0) >= MAX_QUIZ_ATTEMPTS ? ' (Fim)' : ''}
                    </span>
                  </span>

                  {/* 5 mini paws */}
                  <div
                    className="flex items-center gap-1 bg-[#16062c] px-2 py-0.5 rounded-lg border border-purple-900/50"
                    title={`${gameData.attemptsCount || 0} de ${MAX_QUIZ_ATTEMPTS} tentativas utilizadas`}
                  >
                    {[1, 2, 3, 4, 5].map((num) => (
                      <span
                        key={num}
                        className={`text-xs transition-all ${
                          num <= (gameData.attemptsCount || 0)
                            ? 'opacity-100 scale-105'
                            : 'opacity-25 grayscale'
                        }`}
                      >
                        🐾
                      </span>
                    ))}
                  </div>

                  {/* Direct button to open per-book score */}
                  <button
                    type="button"
                    onClick={() => setShowBookScoresView(true)}
                    className="text-xs font-bold text-white hover:text-[#facc15] underline cursor-pointer ml-1"
                  >
                    Ver por livro
                  </button>
                </div>
              </div>
            </div>

            {/* Score Big Display with 3D Golden Star Pill - Exact from uploaded image */}
            <div className="flex items-center gap-2.5 bg-gradient-to-b from-[#ffd200] via-[#ffbe00] to-[#f59e0b] text-[#3b1404] px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl border-2 border-amber-200 border-b-4 border-[#b45309] shadow-[0_4px_0_#9a3412] flex-shrink-0">
              <Star className="w-6 h-6 text-[#3b1404] fill-[#3b1404] drop-shadow-sm" />
              <span className="text-2xl sm:text-3xl font-black tracking-tight font-mono">
                {displayScore}
              </span>
            </div>
          </motion.div>

          {/* Top Right Card: Ranking da Escola (Vertical 3D Podium Layout matching image) */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="relative p-4 sm:p-5 rounded-3xl border-4 border-[#ea580c] border-b-[6px] border-[#9a3412] bg-[#2e1065] shadow-[0_6px_0_#7c2d12,0_10px_25px_rgba(0,0,0,0.5)] flex flex-col justify-between gap-2.5"
          >
            {/* Top 3 List Vertically Stacked */}
            <div className="flex flex-col gap-1.5 flex-1 justify-center">
              {leaderboard.topThree.slice(0, 3).map((item, idx) => {
                const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉';
                const rankText = idx === 0 ? '1º' : idx === 1 ? '2º' : '3º';
                const rankColor =
                  idx === 0 ? 'text-[#facc15]' : idx === 1 ? 'text-slate-200' : 'text-amber-500';
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-[#1e0a3c] border border-purple-900/60 text-xs font-bold text-white shadow-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm leading-none">{medal}</span>
                      <span className={`font-extrabold ${rankColor}`}>{rankText}</span>
                      <span className="truncate max-w-[120px] font-bold text-white">
                        {item.studentName.split(' ')[0]}
                      </span>
                    </div>
                    <span className="font-mono font-black text-[#facc15]">{item.score}</span>
                  </div>
                );
              })}
            </div>

            {/* Current Student Rank Pill */}
            <div className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-b from-[#ffd200] via-[#ffbe00] to-[#f59e0b] text-[#3b1404] text-xs font-black shadow-[0_3px_0_#9a3412] border border-amber-200 border-b-2 border-[#b45309]">
              <Star className="w-3.5 h-3.5 fill-[#3b1404] text-[#3b1404]" />
              <span>
                Você está em <strong>{leaderboard.currentRank}º lugar</strong>!
              </span>
            </div>
          </motion.div>
        </div>

        {/* ========================================================================= */}
        {/* 2.5 COMPARISON BANNER: Comparação dos Empréstimos com o Banco de Dados do Aluno */}
        {/* ========================================================================= */}
        {activeStudent && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl sm:rounded-3xl border-3 sm:border-4 p-3 sm:p-4 mb-3 sm:mb-4 shadow-[0_5px_0_#7c2d12,0_10px_25px_rgba(0,0,0,0.5)] transition-all ${
              currentMatchedLoan
                ? 'bg-[#2e1065] border-[#ea580c]'
                : 'bg-[#2e1065] border-[#ea580c]'
            }`}
          >
            {/* Top row: Comparison Status Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-purple-900/60">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center border shadow-xs ${
                    currentMatchedLoan
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      : 'bg-[#1e0a3c] text-amber-300 border-purple-900/60'
                  }`}
                >
                  <Database className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5">
                      <span>Comparação de Empréstimos no Banco de Dados</span>
                      {currentMatchedLoan ? (
                        <span className="text-[10px] font-black text-emerald-300 bg-emerald-900/60 border border-emerald-500/40 px-2 py-0.2 rounded-full flex items-center gap-1">
                          <BadgeCheck className="w-3 h-3 text-emerald-400" />
                          <span>Combinando com o Aluno</span>
                        </span>
                      ) : studentLoans.length > 0 ? (
                        <span className="text-[10px] font-bold text-amber-300 bg-amber-900/60 border border-amber-500/40 px-2 py-0.2 rounded-full">
                          {studentLoans.length} empréstimo(s) no banco
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-800/80 border border-slate-700 px-2 py-0.2 rounded-full">
                          0 empréstimos no banco
                        </span>
                      )}
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Aluno: <strong className="text-amber-300">{activeStudent.name}</strong> • Matrícula/Código:{' '}
                    <strong className="text-slate-200">{activeStudent.studentCode || 'Cadastrado'}</strong> • Turma:{' '}
                    <span className="text-slate-200">{activeStudent.class}</span>
                  </p>
                </div>
              </div>

              {/* Action: Open Book Selector Modal */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => {
                    setBookSelectorTab(studentBooks.length > 0 ? 'loans' : 'catalog');
                    setIsBookSelectorModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-amber-950 font-black text-xs shadow-[0_2px_0_#9a3412] border border-amber-200 border-b-2 border-orange-800 active:translate-y-0.5 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>Trocar Livro do Aluno</span>
                  {studentBooks.length > 0 && (
                    <span className="bg-amber-950 text-amber-200 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                      {studentBooks.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Middle: Active Book Loan Match Details */}
            {currentMatchedLoan ? (
              <div className="mt-2.5 pt-1 flex flex-col md:flex-row md:items-center justify-between gap-2.5 bg-emerald-950/40 border border-emerald-500/25 rounded-xl p-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-12 rounded-md overflow-hidden bg-slate-800 border border-emerald-500/40 flex-shrink-0">
                    {selectedBookForQuiz.cover ? (
                      <img
                        src={selectedBookForQuiz.cover}
                        alt={selectedBookForQuiz.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <BookOpen className="w-4 h-4 text-emerald-400 m-auto mt-4" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-black text-emerald-300 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        Livro da Missão Validado no Banco de Dados:
                      </span>
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.2 rounded-md border ${
                          currentMatchedLoan.status === 'em_andamento'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : currentMatchedLoan.status === 'atrasado'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                        }`}
                      >
                        {currentMatchedLoan.status === 'em_andamento'
                          ? 'Em Andamento'
                          : currentMatchedLoan.status === 'atrasado'
                          ? 'Prazo Expirado'
                          : 'Devolvido / Lido'}
                      </span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-black text-white truncate max-w-sm sm:max-w-md">
                      {selectedBookForQuiz.title}
                    </h4>
                    <p className="text-[10px] text-slate-300">
                      Retirado em: <strong className="text-white">{currentMatchedLoan.loanDate}</strong> • Devolução prevista:{' '}
                      <strong className="text-white">{currentMatchedLoan.returnDate}</strong>
                    </p>
                  </div>
                </div>

                {/* Score in this book if any */}
                {(gameData.bookScores || {})[selectedBookForQuiz.title] && (
                  <div className="self-start md:self-center px-2.5 py-1 rounded-lg bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[11px] font-bold flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>
                      Pontuação neste livro:{' '}
                      <strong>
                        {(gameData.bookScores || {})[selectedBookForQuiz.title]?.points} pts
                      </strong>
                    </span>
                  </div>
                )}
              </div>
            ) : studentBooks.length > 0 ? (
              <div className="mt-2.5 pt-1 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <p className="text-xs text-amber-200">
                    O livro atual (<strong>{selectedBookForQuiz.title}</strong>) é do acervo geral. Seus empréstimos registrados no banco de dados estão disponíveis abaixo para combinar com o Quiz!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleSelectBookForQuiz(studentBooks[0].book, true)}
                  className="px-2.5 py-1 rounded-lg bg-amber-400 text-amber-950 text-[11px] font-black hover:bg-amber-300 cursor-pointer self-start sm:self-auto shrink-0"
                >
                  Mudar para {studentBooks[0].book.title.slice(0, 20)}... ➔
                </button>
              </div>
            ) : (
              <div className="mt-2.5 pt-1 p-2.5 rounded-xl bg-[#1e0a3c] border border-purple-900/60 flex items-center gap-2.5 text-slate-200 text-xs">
                <BookOpen className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <p>
                  Nenhum empréstimo ativo registrado para este aluno no momento. Você pode treinar livremente com as perguntas do livro <strong>{selectedBookForQuiz.title}</strong> ou retirar um exemplar na biblioteca escolar para validar seu empréstimo oficial!
                </p>
              </div>
            )}

            {/* Quick-switch row: If student has multiple borrowed books in the database */}
            {studentBooks.length > 1 && (
              <div className="mt-2 pt-2 border-t border-white/10 flex items-center gap-2 overflow-x-auto pb-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex-shrink-0 flex items-center gap-1">
                  <BookCheck className="w-3 h-3 text-amber-400" />
                  Seus Empréstimos:
                </span>
                <div className="flex items-center gap-1.5 flex-nowrap">
                  {studentBooks.map((sb) => {
                    const isCurrent =
                      selectedBookForQuiz.id === sb.book.id ||
                      selectedBookForQuiz.title.trim().toLowerCase() === sb.book.title.trim().toLowerCase();
                    return (
                      <button
                        key={sb.book.id || sb.loan.id}
                        type="button"
                        onClick={() => handleSelectBookForQuiz(sb.book, true)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 flex-shrink-0 border ${
                          isCurrent
                            ? 'bg-emerald-500 text-slate-950 border-emerald-300 shadow-sm font-black'
                            : 'bg-white/10 text-slate-200 hover:bg-white/20 border-white/15'
                        }`}
                        title={sb.book.title}
                      >
                        {isCurrent && <Check className="w-3 h-3 text-slate-950" />}
                        <span className="max-w-[130px] truncate">{sb.book.title}</span>
                        <span
                          className={`text-[9px] px-1 rounded-xs font-semibold ${
                            sb.loan.status === 'em_andamento'
                              ? 'bg-emerald-900/60 text-emerald-200'
                              : sb.loan.status === 'atrasado'
                              ? 'bg-rose-900/60 text-rose-200'
                              : 'bg-cyan-900/60 text-cyan-200'
                          }`}
                        >
                          {sb.loan.status === 'em_andamento'
                            ? 'Ativo'
                            : sb.loan.status === 'atrasado'
                            ? 'Vencido'
                            : 'Lido'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* 3. MAIN GAME QUIZ AREA: Quitério Mascot (Left) + 3D Cat Quiz Window (Right) */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-center my-auto pt-2">
          {/* Left Column: Mascot Quitério with Speech Bubble */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center order-2 lg:order-1">
            <QuiterioMascot
              mood={mascotMood}
              size="lg"
              showSpeechBubble={true}
              speechText={speechBubbleText}
              isMeowing={isMeowing}
              onPetCat={handlePetQuiterio}
            />
          </div>

          {/* Right Column: 3D Quiz Window Themed on Quitério the Cat */}
          <div className="lg:col-span-7 order-1 lg:order-2">
            <motion.div
              layout
              className="relative p-4 sm:p-6 md:p-7 rounded-[28px] sm:rounded-[36px] border-4 sm:border-[5px] border-[#ea580c] border-b-[8px] sm:border-b-[10px] border-[#9a3412] bg-gradient-to-b from-[#fffefc] via-[#fff9f2] to-[#ffedd5] text-[#2e1305] shadow-[0_12px_0_#7c2d12,0_20px_35px_rgba(0,0,0,0.45)] ring-2 sm:ring-4 ring-orange-300/60"
            >
              {/* Cute Cat Badge Header on top of 3D Window with Interactive Tabs */}
              <div className="flex items-center justify-center -mt-8 sm:-mt-10 mb-3 flex-wrap gap-2">
                <div className="inline-flex items-center gap-1.5 p-1 rounded-full bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 shadow-[0_4px_0_#9a3412] border-2 border-amber-200 border-b-[3px] border-[#9a3412]">
                  <button
                    type="button"
                    onClick={() => {
                      if ((gameData.attemptsCount || 0) >= MAX_QUIZ_ATTEMPTS) {
                        setSpeechBubbleText(
                          'Miau! Você já completou suas 5 tentativas! Confira seus pontos por livro abaixo! 🐾'
                        );
                        return;
                      }
                      setShowBookScoresView(false);
                    }}
                    className={`px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                      !showBookScoresView && (gameData.attemptsCount || 0) < MAX_QUIZ_ATTEMPTS
                        ? 'bg-amber-400 text-amber-950 shadow-sm border border-amber-200'
                        : 'text-amber-100 hover:text-white'
                    }`}
                  >
                    <span>🐾</span>
                    <span>
                      {(gameData.attemptsCount || 0) >= MAX_QUIZ_ATTEMPTS
                        ? 'Desafio Finalizado (5/5)'
                        : !isGameStarted
                        ? 'Desafio Literário'
                        : `Questão ${currentQuestionIndex + 1}/${currentQuestions.length}`}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowBookScoresView(true)}
                    className={`px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                      showBookScoresView || (gameData.attemptsCount || 0) >= MAX_QUIZ_ATTEMPTS
                        ? 'bg-amber-400 text-amber-950 shadow-sm border border-amber-200'
                        : 'text-amber-100 hover:text-white'
                    }`}
                  >
                    <span>⭐</span>
                    <span>Pontos por Livro</span>
                    {Object.keys(gameData.bookScores || {}).length > 0 && (
                      <span className="bg-amber-950 text-amber-300 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                        {Object.keys(gameData.bookScores || {}).length}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Floating +100 Points animated badge when user clicks right answer */}
              <AnimatePresence>
                {floatingScore !== null && (
                  <motion.div
                    initial={{ opacity: 0, y: 0, scale: 0.5 }}
                    animate={{ opacity: 1, y: -45, scale: 1.25 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.8 }}
                    className="absolute top-4 right-6 sm:right-8 z-30 pointer-events-none px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 text-amber-950 font-black text-base sm:text-xl shadow-[0_4px_0_#9a3412] flex items-center gap-1.5 border-2 border-amber-200 border-b-3 border-orange-800"
                  >
                    <Sparkles className="w-5 h-5 text-amber-950 fill-amber-950" />
                    +{floatingScore} PONTOS!
                  </motion.div>
                )}
              </AnimatePresence>

              {!activeStudent ? (
                /* Card de Acesso Bloqueado se não houver aluno identificado */
                <div className="py-8 px-4 text-center flex flex-col items-center">
                  <div className="w-16 h-16 rounded-3xl bg-amber-500/15 border-2 border-amber-500/30 flex items-center justify-center text-amber-600 mb-3 shadow-inner">
                    <ShieldAlert className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-[#2e1305] mb-2">
                    Acesso Restrito a Alunos Cadastrados
                  </h3>
                  <p className="text-xs sm:text-sm text-amber-900/80 max-w-md mx-auto mb-5 font-medium">
                    Digite seu <strong>Código de Aluno</strong> para responder às perguntas e salvar seus pontos no Ranking do Quitério!
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    {onBackToHome && (
                      <button
                        type="button"
                        onClick={onBackToHome}
                        className="px-5 py-2.5 rounded-2xl border-2 border-amber-300 bg-white text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer hover:bg-amber-50 text-amber-950 shadow-sm transition-all"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Voltar ao Início</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsCodeModalOpen(true)}
                      className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-amber-950 text-xs sm:text-sm font-black flex items-center gap-2 cursor-pointer shadow-[0_4px_0_#9a3412] border-2 border-amber-200 border-b-3 border-orange-800 active:translate-y-0.5 transition-all"
                    >
                      <User className="w-4 h-4" />
                      <span>Digitar Código do Aluno</span>
                    </button>
                  </div>
                </div>
              ) : showBookScoresView || (gameData.attemptsCount || 0) >= MAX_QUIZ_ATTEMPTS ? (
                /* ========================================================================= */
                /* 🐾 BOLETIM DO QUITÉRIO: PONTUAÇÃO POR LIVRO (Cat's Book Scoreboard) */
                /* ========================================================================= */
                <div className="py-2 flex flex-col gap-3.5">
                  {/* Top Header inside 3D Window */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 border-b-2 border-amber-300/80 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 border-2 border-amber-200 border-b-4 border-orange-800 flex items-center justify-center text-white shadow-md flex-shrink-0">
                        <GraduationCap className="w-6 h-6 sm:w-7 sm:h-7" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-lg sm:text-xl font-black text-[#2e1305]">
                            Boletim do Quitério
                          </h3>
                          <span className="text-[10px] sm:text-xs font-black bg-amber-200 text-amber-950 px-2.5 py-0.5 rounded-full border border-amber-300">
                            Pontos por Livro
                          </span>
                        </div>
                        <p className="text-xs text-amber-900/80 font-medium">
                          Desempenho de <strong>{activeStudent ? activeStudent.name : 'Aluno'}</strong> em cada livro
                        </p>
                      </div>
                    </div>

                    {/* Attempts Status Pill */}
                    <div
                      className={`px-3 py-1.5 rounded-xl border-2 font-black text-xs flex items-center gap-1.5 shadow-sm ${
                        (gameData.attemptsCount || 0) >= MAX_QUIZ_ATTEMPTS
                          ? 'bg-rose-100 text-rose-950 border-rose-400 border-b-3 border-rose-700'
                          : 'bg-amber-100 text-amber-950 border-amber-300 border-b-3 border-amber-600'
                      }`}
                    >
                      <span>🐾</span>
                      <span>
                        {(gameData.attemptsCount || 0) >= MAX_QUIZ_ATTEMPTS
                          ? '5 de 5 Tentativas Usadas (Finalizado)'
                          : `${gameData.attemptsCount || 0} de ${MAX_QUIZ_ATTEMPTS} Tentativas Usadas`}
                      </span>
                    </div>
                  </div>

                  {/* Warning Notice when 5 attempts are exhausted */}
                  {(gameData.attemptsCount || 0) >= MAX_QUIZ_ATTEMPTS && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-100 via-orange-100 to-amber-200 border-2 border-amber-400 border-b-4 border-amber-600 text-amber-950 shadow-sm flex items-start sm:items-center gap-3"
                    >
                      <div className="w-10 h-10 rounded-xl bg-amber-400 border border-amber-500 flex items-center justify-center text-xl flex-shrink-0 shadow-sm">
                        🐱🎓
                      </div>
                      <div className="text-xs sm:text-sm font-bold leading-snug">
                        <span className="font-black text-orange-950">
                          Miau! Limite de 5 tentativas concluído!
                        </span>{' '}
                        Você utilizou todas as suas 5 chances no quiz. Conforme as regras da missão, você não pode mais jogar novas partidas. Veja abaixo sua pontuação conquistada em cada livro! 🐾
                      </div>
                    </motion.div>
                  )}

                  {/* Books Scores List */}
                  <div className="space-y-2.5 max-h-[340px] sm:max-h-[380px] overflow-y-auto pr-1">
                    {Object.keys(gameData.bookScores || {}).length === 0 ? (
                      <div className="p-6 text-center rounded-2xl bg-white/70 border-2 border-amber-200 border-dashed flex flex-col items-center">
                        <BookOpen className="w-10 h-10 text-amber-400 mb-2" />
                        <h4 className="text-base font-black text-[#2e1305]">Nenhum livro pontuado ainda!</h4>
                        <p className="text-xs text-amber-800/80 max-w-xs mt-1">
                          Escolha um livro e responda às perguntas do Quitério para registrar seus primeiros pontos no boletim!
                        </p>
                      </div>
                    ) : (
                      (Object.values(gameData.bookScores || {}) as BookScoreDetail[]).map((bookScore, idx) => {
                        const matchedBook =
                          books.find((b) => b.title.toLowerCase() === bookScore.bookTitle.toLowerCase()) ||
                          selectedBookForQuiz;
                        const cover = bookScore.bookCover || matchedBook.cover;
                        const percentage =
                          bookScore.totalQuestions > 0
                            ? Math.round((bookScore.correctAnswers / bookScore.totalQuestions) * 100)
                            : 0;

                        return (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.06 }}
                            className="p-3 sm:p-3.5 rounded-2xl bg-white/95 border-2 border-amber-300 border-b-4 border-amber-500 shadow-[0_3px_0_#d97706] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-amber-400 transition-all"
                          >
                            {/* Left: Book Cover + Details */}
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                              <div className="w-12 h-16 sm:w-13 sm:h-17 rounded-xl border-2 border-amber-400 border-b-3 border-amber-600 shadow-md overflow-hidden bg-amber-100 flex-shrink-0 flex items-center justify-center">
                                {cover ? (
                                  <img
                                    src={cover}
                                    alt={bookScore.bookTitle}
                                    className="w-full h-full object-cover"
                                    referrerPolicy="no-referrer"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white">
                                    <BookOpen className="w-5 h-5 text-amber-100" />
                                  </div>
                                )}
                              </div>

                              <div className="truncate flex-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-[9px] font-black uppercase text-orange-700 bg-orange-100 px-2 py-0.5 rounded-md border border-orange-200">
                                    Livro Desafiado
                                  </span>
                                  <span className="text-[10px] font-semibold text-amber-800 truncate">
                                    {bookScore.bookAuthor || matchedBook.author || 'Literatura'}
                                  </span>
                                </div>
                                <h4 className="text-sm sm:text-base font-black text-[#2e1305] truncate mt-0.5">
                                  {bookScore.bookTitle}
                                </h4>
                                <p className="text-[11px] text-amber-900/90 font-bold mt-0.5 flex items-center gap-1">
                                  <span>🐾</span>
                                  <span>
                                    {percentage === 100
                                      ? '🏆 Miau! Acertou tudo! Leitor Nota 10!'
                                      : percentage >= 60
                                      ? '🌟 Muito bem! Você leu com bastante atenção!'
                                      : '📖 Bom esforço! Continue explorando esta obra!'}
                                  </span>
                                </p>
                              </div>
                            </div>

                            {/* Right: Score and Accuracy Stats */}
                            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-amber-200">
                              {/* Accuracy */}
                              <div className="px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-center">
                                <span className="text-[9px] uppercase font-extrabold text-amber-800 block">
                                  Acertos
                                </span>
                                <span className="text-xs sm:text-sm font-black text-emerald-700">
                                  {bookScore.correctAnswers}/{bookScore.totalQuestions} ({percentage}%)
                                </span>
                              </div>

                              {/* Score Pill 3D */}
                              <div className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 font-black text-sm sm:text-base border-2 border-amber-200 border-b-3 border-amber-700 shadow-[0_2px_0_#b45309] flex items-center gap-1.5">
                                <Star className="w-4 h-4 fill-amber-950 text-amber-950" />
                                <span>{bookScore.points} pts</span>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })
                    )}
                  </div>

                  {/* Summary & Actions inside 3D Window */}
                  <div className="pt-2 border-t-2 border-amber-300/70 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 text-xs font-bold text-amber-950 flex-wrap">
                      <span>
                        Total Geral: <strong>{gameData.score} pts</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Ranking: <strong>{leaderboard.currentRank}º lugar</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap justify-end w-full sm:w-auto">
                      {(gameData.attemptsCount || 0) < MAX_QUIZ_ATTEMPTS && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setBookSelectorTab(studentBooks.length > 0 ? 'loans' : 'catalog');
                              setIsBookSelectorModalOpen(true);
                            }}
                            className="px-3.5 py-2 rounded-xl border-2 border-amber-300 bg-white hover:bg-amber-50 text-amber-950 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5" />
                            <span>Trocar Livro</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowBookScoresView(false);
                              if (roundCompleted) restartQuiz();
                              handleStartGame();
                            }}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-xs shadow-[0_3px_0_#064e3b] border-2 border-emerald-300 border-b-3 border-emerald-800 active:translate-y-0.5 cursor-pointer flex items-center gap-1.5"
                          >
                            <span>Jogar Desafio ({MAX_QUIZ_ATTEMPTS - (gameData.attemptsCount || 0)} restantes)</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ) : activeQuestion && !roundCompleted ? (
                <>
                  {/* ========================================================================= */}
                  {/* HIGH-VISIBILITY 3D COUNTDOWN TIMER & QUIZ HEADER (Smartphone & Desktop)   */}
                  {/* ========================================================================= */}
                  <div className="flex items-center justify-between gap-2 border-b-2 border-amber-200/80 pb-2.5">
                    {/* Book Badge (Thumbnail + Title + Question count) */}
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="w-9 h-12 sm:w-11 sm:h-15 rounded-xl border-2 border-amber-400 border-b-2 sm:border-b-3 border-amber-600 shadow-sm overflow-hidden bg-amber-100 flex-shrink-0 flex items-center justify-center relative">
                        {!coverHasError && activeQuestion.bookCover ? (
                          <img
                            src={activeQuestion.bookCover}
                            alt={activeQuestion.bookTitle}
                            onError={() => setCoverHasError(true)}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-amber-400 to-orange-600 flex flex-col items-center justify-center p-0.5 text-white">
                            <BookOpen className="w-3.5 h-3.5 text-amber-100" />
                            <span className="text-[6px] font-black uppercase text-center mt-0.5 line-clamp-1">
                              Livro
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[9px] sm:text-[11px] font-black uppercase tracking-wider text-orange-800 bg-orange-100 px-1.5 sm:px-2 py-0.5 rounded-md border border-orange-200">
                            Questão {currentQuestionIndex + 1}/{currentQuestions.length}
                          </span>
                          {currentMatchedLoan ? (
                            <span className="text-[9px] sm:text-[10px] font-black text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                              <BadgeCheck className="w-3 h-3 text-emerald-600" />
                              <span>Empréstimo no Banco</span>
                            </span>
                          ) : (
                            <span className="text-[9px] sm:text-[10px] font-medium text-amber-900 bg-amber-100 border border-amber-200 px-1.5 py-0.5 rounded-md">
                              Acervo Geral
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setBookSelectorTab(studentBooks.length > 0 ? 'loans' : 'catalog');
                              setIsBookSelectorModalOpen(true);
                            }}
                            className="text-[9px] sm:text-[10px] font-bold text-amber-800 hover:text-amber-950 bg-amber-200/80 hover:bg-amber-300 px-1.5 py-0.5 rounded-md border border-amber-300 transition-all cursor-pointer flex items-center gap-1"
                            title="Trocar livro do desafio"
                          >
                            <ArrowRightLeft className="w-3 h-3" />
                            <span>Trocar</span>
                          </button>
                        </div>
                        <h3 className="text-xs sm:text-base font-black text-[#2e1305] truncate mt-0.5" title={activeQuestion.bookTitle}>
                          {activeQuestion.bookTitle}
                        </h3>
                      </div>
                    </div>

                    {/* 3D Countdown Timer Pill - ALWAYS VISIBLE, Flex-Shrink-0, High Contrast & Tactile */}
                    <div
                      id="quiterio-quiz-timer-pill"
                      className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1 sm:py-1.5 rounded-xl border-2 border-b-3 transition-all shadow-[0_2px_0_#b45309] flex-shrink-0 ${
                        timeLeft <= 5 && isTimerActive
                          ? 'bg-gradient-to-r from-rose-500 to-red-600 text-white border-rose-300 border-b-rose-900 shadow-[0_2px_0_#881337] animate-pulse ring-2 ring-rose-400/60'
                          : 'bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 border-amber-200 border-amber-700'
                      }`}
                      title={`Tempo restante: ${timeLeft} segundos`}
                    >
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-current stroke-[2.5]" />
                      <span className="text-xl sm:text-3xl font-black tracking-tight font-mono">
                        {timeLeft}s
                      </span>
                    </div>
                  </div>

                  {/* Visual 30-second Countdown Progress Bar */}
                  <div className="w-full bg-amber-200/70 rounded-full h-1.5 sm:h-2 mt-2 overflow-hidden border border-amber-300/80">
                    <motion.div
                      className={`h-full rounded-full transition-all duration-300 ${
                        timeLeft <= 5
                          ? 'bg-rose-500'
                          : timeLeft <= 10
                          ? 'bg-orange-500'
                          : 'bg-gradient-to-r from-amber-400 to-emerald-500'
                      }`}
                      style={{ width: `${(timeLeft / QUESTION_TIMER_SECONDS) * 100}%` }}
                    />
                  </div>

                  {/* Active Question Box */}
                  <div className="my-3 sm:my-4 p-3 sm:p-4 rounded-2xl bg-white/90 border-2 border-amber-200/90 border-b-3 border-amber-300 shadow-xs">
                    <h2 className="text-xs sm:text-base md:text-lg font-black leading-snug text-[#2b1408]">
                      {activeQuestion.question}
                    </h2>
                  </div>

                  {/* 3D Options Grid (A, B, C, D) - Optimized for Smartphone single-column & Tablet 2-column */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3.5">
                    {activeQuestion.options.map((optionText, optIndex) => {
                      const letter = String.fromCharCode(65 + optIndex); // A, B, C, D
                      const isSelected = selectedOption === optIndex;
                      const isThisCorrect = optIndex === activeQuestion.correctIndex;

                      // Visual styling with 3D depth and lively arcade colors matching the theme
                      let cardStyle =
                        'bg-[#fffdf9] hover:bg-[#fff7ed] text-[#2e1305] border-2 border-amber-300 border-b-4 border-[#ea580c] shadow-[0_4px_0_#c2410c] active:translate-y-1 active:border-b-2 active:shadow-[0_1px_0_#c2410c]';
                      let badgeStyle =
                        'bg-amber-100 text-[#ea580c] border-2 border-amber-300 shadow-xs';

                      if (isAnswered) {
                        if (isThisCorrect) {
                          // Bright vibrant emerald green with 3D depth
                          cardStyle =
                            'bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black border-2 border-emerald-300 border-b-4 border-emerald-800 shadow-[0_4px_0_#064e3b]';
                          badgeStyle = 'bg-white text-emerald-700 border-2 border-emerald-200';
                        } else if (isSelected && !isThisCorrect) {
                          // Rose red on wrong choice with 3D depth
                          cardStyle =
                            'bg-rose-50 text-rose-950 font-black border-2 border-rose-300 border-b-4 border-rose-600 shadow-[0_4px_0_#9f1239]';
                          badgeStyle = 'bg-rose-600 text-white border-2 border-rose-400';
                        } else {
                          cardStyle =
                            'opacity-40 bg-slate-50 border-2 border-slate-200 border-b-2 border-slate-300 text-slate-500 shadow-none';
                          badgeStyle = 'bg-slate-200 text-slate-600 border-transparent';
                        }
                      }

                      return (
                        <motion.button
                          key={optIndex}
                          whileHover={!isAnswered ? { scale: 1.01 } : {}}
                          whileTap={!isAnswered ? { scale: 0.98 } : {}}
                          onClick={() => {
                            if (isAnswered) {
                              handleNextQuestion();
                            } else {
                              handleSelectOption(optIndex);
                            }
                          }}
                          className={`p-3 sm:p-3.5 rounded-2xl text-left transition-all flex items-center justify-between gap-2.5 cursor-pointer min-h-[52px] ${cardStyle}`}
                        >
                          <div className="flex items-center sm:items-start gap-2.5">
                            <span
                              className={`font-black text-xs sm:text-sm w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${badgeStyle}`}
                            >
                              {letter}
                            </span>
                            <span className="text-xs sm:text-sm font-black leading-tight text-inherit">
                              {optionText}
                            </span>
                          </div>

                          {/* Status Icon */}
                          {isAnswered && (
                            <div className="flex-shrink-0">
                              {isThisCorrect ? (
                                <CheckCircle2 className="w-5 h-5 text-white fill-emerald-600 drop-shadow-sm" />
                              ) : isSelected ? (
                                <XCircle className="w-5 h-5 text-rose-600 drop-shadow-sm" />
                              ) : null}
                            </div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Feedback & Next Button Row (3D Tactile Layout) */}
                  {isAnswered && (
                    <div
                      onClick={() => handleNextQuestion()}
                      className="mt-4 pt-3.5 border-t-2 border-amber-300/60 flex flex-col sm:flex-row items-center justify-between gap-3 cursor-pointer"
                    >
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        {/* +100 Pontos 3D Badge */}
                        {isCorrect ? (
                          <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 font-black text-xs sm:text-sm shadow-[0_3px_0_#b45309] border-2 border-amber-300 border-b-3 border-amber-700 flex-shrink-0">
                            <Star className="w-4 h-4 fill-amber-950" />
                            <span>+100 pontos!</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-slate-200 text-slate-700 font-bold text-xs shadow-sm border border-slate-300 flex-shrink-0">
                            <span>0 pontos</span>
                          </div>
                        )}

                        {/* Kitten cheer bubble pill */}
                        <div className="flex-1 sm:flex-initial px-3 sm:px-3.5 py-2 rounded-2xl bg-gradient-to-r from-amber-100 to-orange-100 border-2 border-amber-300/80 border-b-3 border-amber-400 text-xs sm:text-sm text-amber-950 font-bold leading-tight flex items-center gap-2 shadow-sm">
                          <span className="text-sm">🐾</span>
                          <div>
                            <span className="block">
                              {isCorrect
                                ? 'Você mandou bem! Continua lendo e acertando as perguntas!'
                                : 'Quase lá! Continue lendo que você consegue!'}
                            </span>
                            <span className="text-[10px] text-amber-800/80 font-bold block mt-0.5 animate-pulse">
                              {currentQuestionIndex < currentQuestions.length - 1
                                ? 'Indo para a próxima pergunta...'
                                : 'Indo para o resultado...'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 3D Next Button - Native button with zero lag */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNextQuestion();
                        }}
                        className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 active:scale-95 active:translate-y-1 text-white font-black text-xs sm:text-sm shadow-[0_4px_0_#064e3b] border-2 border-emerald-300 border-b-4 border-emerald-800 flex items-center justify-center gap-2 cursor-pointer transition-all"
                        title="Avançar imediatamente"
                      >
                        <span>
                          {currentQuestionIndex < currentQuestions.length - 1
                            ? 'Próxima Pergunta'
                            : 'Ver Resultado'}
                        </span>
                        <ArrowRight className="w-4 h-4 animate-pulse" />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                /* ========================================================================= */
                /* ROUND COMPLETED VIEW (With 5 Attempts Limit Check) */
                /* ========================================================================= */
                <div className="py-6 flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-3xl bg-amber-400/30 border-2 border-amber-400 border-b-4 border-amber-600 flex items-center justify-center text-amber-600 shadow-[0_4px_0_#b45309] mb-3">
                    <Trophy className="w-9 h-9" />
                  </div>
                  <h3 className="text-2xl font-black text-[#2e1305]">
                    {(gameData.attemptsCount || 0) >= MAX_QUIZ_ATTEMPTS
                      ? '5 de 5 Tentativas Concluídas! 🎓'
                      : 'Missão Cumprida!'}
                  </h3>
                  <p className="text-sm text-amber-900/80 max-w-md mt-1 mb-5 font-medium">
                    {(gameData.attemptsCount || 0) >= MAX_QUIZ_ATTEMPTS ? (
                      <span>
                        Miau! Você atingiu o limite de <strong>5 tentativas</strong> na Missão do Quitério! Veja agora a sua pontuação para cada livro desafiado!
                      </span>
                    ) : (
                      <span>
                        Você completou o desafio do livro{' '}
                        <strong className="text-orange-700">{selectedBookForQuiz.title}</strong>!
                      </span>
                    )}
                  </p>

                  <div className="grid grid-cols-2 gap-3 max-w-xs w-full mb-5">
                    <div className="p-3 rounded-2xl bg-white/90 border-2 border-amber-300 border-b-4 border-amber-500 shadow-[0_3px_0_#d97706]">
                      <span className="text-[10px] uppercase font-black text-amber-700 block">
                        Pontos Ganhos
                      </span>
                      <span className="text-xl font-black text-amber-600">
                        +{roundStats.pointsEarned}
                      </span>
                    </div>
                    <div className="p-3 rounded-2xl bg-white/90 border-2 border-emerald-300 border-b-4 border-emerald-600 shadow-[0_3px_0_#059669]">
                      <span className="text-[10px] uppercase font-black text-emerald-700 block">
                        Acertos
                      </span>
                      <span className="text-xl font-black text-emerald-600">
                        {roundStats.correct} / {currentQuestions.length}
                      </span>
                    </div>
                  </div>

                  {/* Attempts summary badge */}
                  <div className="mb-5 px-4 py-1.5 rounded-full bg-amber-200/90 border border-amber-300 text-amber-950 text-xs font-black">
                    🐾 Tentativa {gameData.attemptsCount || 0} de {MAX_QUIZ_ATTEMPTS} finalizada
                    {(gameData.attemptsCount || 0) >= MAX_QUIZ_ATTEMPTS
                      ? ' • Limite máximo alcançado'
                      : ` • Restam ${MAX_QUIZ_ATTEMPTS - (gameData.attemptsCount || 0)} tentativa(s)`}
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3">
                    {(gameData.attemptsCount || 0) >= MAX_QUIZ_ATTEMPTS ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setShowBookScoresView(true)}
                          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-amber-950 font-black text-sm flex items-center gap-2 border-2 border-amber-200 border-b-4 border-orange-800 shadow-[0_4px_0_#9a3412] active:translate-y-0.5 cursor-pointer transition-all"
                        >
                          <span>🐾 Ver Pontuação de Cada Livro</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                        {onNavigateToCatalog && (
                          <button
                            type="button"
                            onClick={onNavigateToCatalog}
                            className="px-5 py-3 rounded-2xl border-2 border-amber-300 bg-white hover:bg-amber-50 text-amber-900 font-bold text-sm flex items-center gap-2 cursor-pointer shadow-sm transition-all"
                          >
                            <BookOpen className="w-4 h-4" />
                            <span>Ver Outros Livros</span>
                          </button>
                        )}
                      </>
                    ) : (
                      <>
                        <button
                          onClick={restartQuiz}
                          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 text-amber-950 font-black text-xs sm:text-sm flex items-center gap-2 border-2 border-amber-200 border-b-3 border-orange-700 shadow-[0_3px_0_#c2410c] active:translate-y-0.5 cursor-pointer transition-all"
                        >
                          <RotateCcw className="w-4 h-4" />
                          <span>Jogar Novamente ({MAX_QUIZ_ATTEMPTS - (gameData.attemptsCount || 0)} restantes)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setBookSelectorTab(studentBooks.length > 0 ? 'loans' : 'catalog');
                            setIsBookSelectorModalOpen(true);
                          }}
                          className="px-4 py-2.5 rounded-2xl border-2 border-amber-300 bg-white hover:bg-amber-50 text-amber-900 font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-sm transition-all"
                        >
                          <ArrowRightLeft className="w-4 h-4" />
                          <span>Trocar Livro</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowBookScoresView(true)}
                          className="px-4 py-2.5 rounded-2xl bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-950 font-black text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer transition-all"
                        >
                          <span>⭐ Pontos por Livro</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4. BOTTOM BAR: Responsive for Smartphone [Conquistas] [3 Step Pills] [Mês de Leitura] */}
        {/* ========================================================================= */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 pb-4 border-t border-white/15">
          {/* Left / Mobile Row: Conquistas 3D Button + Mobile Trophy */}
          <div className="flex items-center justify-between w-full sm:w-auto gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setIsBadgesModalOpen(true)}
              className="px-4 py-2 rounded-2xl bg-gradient-to-r from-purple-700 to-indigo-800 hover:from-purple-600 hover:to-indigo-700 border-2 border-purple-400 border-b-4 border-purple-950 shadow-[0_3px_0_#1e1b4b] active:translate-y-0.5 active:border-b-2 text-white font-black text-xs flex items-center gap-2 cursor-pointer transition-all"
            >
              <Award className="w-4 h-4 text-amber-300" />
              <span>Conquistas</span>
            </button>

            <button
              type="button"
              onClick={() => setShowBookScoresView(true)}
              className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 border-2 border-amber-300 border-b-4 border-orange-800 shadow-[0_3px_0_#9a3412] active:translate-y-0.5 active:border-b-2 text-amber-950 font-black text-xs flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <span>🐾</span>
              <span>Pontos por Livro</span>
            </button>

            {/* Mobile-only Mês de Leitura badge */}
            <div className="flex sm:hidden items-center gap-2">
              <div className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 font-black text-xs shadow-[0_2px_0_#b45309] border border-amber-200 border-b-2 border-amber-700 flex items-center gap-1.5">
                <Star className="w-3 h-3 fill-amber-950" />
                <span>Mês de Leitura</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-amber-400/20 border-2 border-amber-400/60 flex items-center justify-center text-amber-400 shadow-sm">
                <Trophy className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Center: 3 Connected Purple Pills (Responsive) */}
          <div className="flex items-center justify-center gap-1 sm:gap-2 px-3 py-1.5 rounded-2xl bg-purple-950/70 border-2 border-purple-500/40 border-b-3 border-purple-950 text-white shadow-md w-full sm:w-auto text-center">
            <div className="flex items-center gap-1 text-[10px] sm:text-xs font-bold text-slate-200">
              <BookOpen className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>Leia livros</span>
            </div>
            <ChevronRight className="w-3 h-3 text-purple-400 flex-shrink-0" />
            <div className="flex items-center gap-1 text-[10px] sm:text-xs font-bold text-slate-200">
              <GraduationCap className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <span>Responda desafios</span>
            </div>
            <ChevronRight className="w-3 h-3 text-purple-400 flex-shrink-0" />
            <div className="flex items-center gap-1 text-[10px] sm:text-xs font-bold text-slate-200">
              <Trophy className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <span>Ganhe pontos</span>
            </div>
          </div>

          {/* Right: Mês de Leitura Badge (Desktop) */}
          <div className="hidden sm:flex items-center gap-2">
            <div className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 font-black text-xs shadow-[0_3px_0_#b45309] flex items-center gap-1.5 border-2 border-amber-300 border-b-3 border-amber-700">
              <Star className="w-3 h-3 fill-amber-950" />
              <span>Mês de Leitura</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-amber-400/20 border-2 border-amber-400/60 flex items-center justify-center text-amber-400 shadow-md">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. CONQUISTAS POPUP MODAL */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isBadgesModalOpen && (
          <div
            onClick={() => setIsBadgesModalOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-sm border-2 rounded-3xl p-5 bg-[#0e1233] border-purple-500/50 text-white shadow-2xl"
            >
              <button
                type="button"
                onClick={() => setIsBadgesModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-5 h-5 text-amber-400" />
                <h3 className="font-extrabold text-base text-amber-300">
                  Suas Conquistas
                </h3>
              </div>

              <div className="space-y-2.5">
                <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-600 border border-indigo-400 text-amber-300 flex items-center justify-center flex-shrink-0">
                    <BookMarked className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white">Leitor Dedicado</h4>
                    <p className="text-[11px] text-slate-400">Acerte ao menos 1 pergunta no Quiz Literário</p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500 border border-amber-300 text-amber-950 flex items-center justify-center flex-shrink-0">
                    <Star className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white">Mestre das Histórias</h4>
                    <p className="text-[11px] text-slate-400">Alcance mais de 500 pontos no ranking escolar</p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-rose-500 border border-rose-300 text-white flex items-center justify-center flex-shrink-0">
                    <Flame className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white">Desafio Ler Mais</h4>
                    <p className="text-[11px] text-slate-400">Acerte 3 ou mais perguntas seguidas sem errar</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 6. STUDENT CODE INPUT MODAL (Prompt for Student Code) */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isCodeModalOpen && (
          <div
            onClick={handleCloseModal}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`relative w-full max-w-md border-3 rounded-3xl p-6 shadow-2xl ${
                isDark ? 'bg-[#240c4a] border-[#ea580c] shadow-[0_6px_0_#7c2d12]' : 'bg-[#fffdfa] border-[#ea580c] shadow-[0_6px_0_#7c2d12]'
              }`}
            >
              {/* Botão Fechar (X) - Retorna ao início */}
              <button
                id="btn-fechar-modal-aluno"
                type="button"
                onClick={handleCloseModal}
                disabled={isReturningHome}
                className={`absolute top-4 right-4 p-2 rounded-full transition-all cursor-pointer ${
                  isDark
                    ? 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                    : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                } disabled:opacity-40`}
                aria-label="Fechar janela e voltar ao início"
                title="Fechar e voltar ao início"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Mascot welcome in the modal */}
              <div className="flex flex-col items-center text-center mb-4">
                <QuiterioMascot size="sm" mood={isReturningHome ? 'sad' : 'talking'} />
                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1.5">
                  Identificação do Aluno
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mt-1">
                  Digite seu <strong>Código de Aluno</strong> para registrar seus pontos na Missão Quitério!
                </p>
              </div>

              {codeError && (
                <div
                  className={`mb-3.5 p-2.5 rounded-xl border text-xs text-center font-bold transition-all ${
                    isReturningHome
                      ? 'bg-rose-500 text-white border-rose-600 shadow-lg animate-pulse'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {codeError}
                </div>
              )}

              <form onSubmit={handleIdentifyStudent} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider text-center">
                    Código do Aluno
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={studentCodeInput}
                      onChange={(e) => setStudentCodeInput(e.target.value)}
                      disabled={isReturningHome}
                      autoFocus
                      placeholder="Digite seu código"
                      className={`w-full px-4 py-3 rounded-2xl border text-base font-mono uppercase tracking-widest text-center focus:outline-none focus:ring-2 disabled:opacity-50 ${
                        isDark
                          ? 'bg-[#1a0735] border-purple-900/60 text-white focus:border-amber-400 focus:ring-amber-400/20'
                          : 'bg-amber-50/50 border-amber-300 text-slate-900 focus:border-amber-500 focus:ring-amber-500/20'
                      }`}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={isReturningHome}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-amber-950 font-black text-sm shadow-[0_3px_0_#b45309] flex items-center justify-center gap-2 cursor-pointer active:translate-y-0.5 transition-all disabled:opacity-50"
                  >
                    {isReturningHome ? (
                      <span>Retornando ao Início...</span>
                    ) : (
                      <>
                        <span>🐾 Entrar na Missão</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleCloseModal}
                    disabled={isReturningHome}
                    className={`w-full py-2.5 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer disabled:opacity-50 ${
                      isDark
                        ? 'border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800'
                        : 'border-slate-300 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    Voltar ao Início
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 7. BOOK SELECTOR MODAL: Escolha de Livro para Quiz */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isBookSelectorModalOpen && (
          <div
            onClick={() => setIsBookSelectorModalOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg max-h-[85vh] rounded-[28px] border-4 border-amber-500 border-b-[8px] border-orange-800 bg-gradient-to-b from-[#fffefc] to-[#ffedd5] text-[#2e1305] shadow-2xl p-4 sm:p-6 flex flex-col"
            >
              <button
                type="button"
                onClick={() => setIsBookSelectorModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full text-amber-900/60 hover:text-amber-950 hover:bg-amber-200/60 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header */}
              <div className="flex items-center gap-3 mb-3 border-b-2 border-amber-300/80 pb-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-400 border-2 border-amber-200 border-b-4 border-orange-700 flex items-center justify-center text-xl shadow-sm flex-shrink-0">
                  <Database className="w-5 h-5 sm:w-6 sm:h-6 text-amber-950" />
                </div>
                <div className="flex-1 pr-6">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base sm:text-lg font-black text-[#2e1305]">
                      Trocar Livro da Missão Quitério
                    </h3>
                    {activeStudent && (
                      <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <BadgeCheck className="w-3 h-3 text-emerald-600" />
                        <span>Banco do Aluno Conectado</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-amber-900/80 font-medium mt-0.5">
                    {activeStudent
                      ? `Aluno: ${activeStudent.name} (${activeStudent.studentCode || 'Código ativo'})`
                      : 'Selecione a obra combinada com o seu empréstimo para o Quiz!'}
                  </p>
                </div>
              </div>

              {/* Tabs: Meus Empréstimos no Banco vs Acervo Geral */}
              <div className="flex items-center gap-2 mb-2.5 p-1 rounded-2xl bg-amber-200/70 border border-amber-300">
                <button
                  type="button"
                  onClick={() => setBookSelectorTab('loans')}
                  className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    bookSelectorTab === 'loans'
                      ? 'bg-orange-600 text-white shadow-sm'
                      : 'text-amber-950 hover:bg-amber-300/50'
                  }`}
                >
                  <BookCheck className="w-3.5 h-3.5" />
                  <span>Meus Empréstimos</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      bookSelectorTab === 'loans'
                        ? 'bg-orange-800 text-amber-200'
                        : 'bg-amber-300 text-amber-950'
                    }`}
                  >
                    {studentBooks.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setBookSelectorTab('catalog')}
                  className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    bookSelectorTab === 'catalog'
                      ? 'bg-orange-600 text-white shadow-sm'
                      : 'text-amber-950 hover:bg-amber-300/50'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Acervo Geral</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      bookSelectorTab === 'catalog'
                        ? 'bg-orange-800 text-amber-200'
                        : 'bg-amber-300 text-amber-950'
                    }`}
                  >
                    {books.length}
                  </span>
                </button>
              </div>

              {/* Sub-filters or Search depending on active tab */}
              {bookSelectorTab === 'loans' ? (
                <div className="flex items-center justify-between gap-2 mb-2 px-1">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setBookSelectorFilter('all')}
                      className={`px-2.5 py-0.8 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${
                        bookSelectorFilter === 'all'
                          ? 'bg-amber-900 text-white shadow-xs'
                          : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                      }`}
                    >
                      Todos ({studentBooks.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setBookSelectorFilter('active')}
                      className={`px-2.5 py-0.8 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${
                        bookSelectorFilter === 'active'
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
                      }`}
                    >
                      Em Andamento ({activeStudentLoans.length})
                    </button>
                  </div>
                  <span className="text-[10px] text-amber-900/70 font-semibold hidden sm:inline">
                    Base: Banco de Empréstimos
                  </span>
                </div>
              ) : (
                <div className="relative mb-2.5 px-0.5">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-amber-800" />
                  <input
                    type="text"
                    value={bookSearchQuery}
                    onChange={(e) => setBookSearchQuery(e.target.value)}
                    placeholder="Pesquisar por título ou autor no acervo..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-amber-300 bg-white/95 text-xs text-[#2e1305] placeholder:text-amber-800/50 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              )}

              {/* Book List Grid */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 my-1">
                {bookSelectorTab === 'loans' ? (
                  studentBooks.length === 0 ? (
                    <div className="py-8 px-4 text-center rounded-2xl bg-amber-100/70 border-2 border-dashed border-amber-300">
                      <Bookmark className="w-8 h-8 text-amber-600 mx-auto mb-2 opacity-60" />
                      <h4 className="text-sm font-black text-[#2e1305]">
                        Nenhum empréstimo ativo no banco de dados
                      </h4>
                      <p className="text-xs text-amber-900/80 mt-1 max-w-sm mx-auto">
                        O aluno <strong>{activeStudent?.name || 'ativo'}</strong> ainda não possui livros registrados na tabela de empréstimos.
                      </p>
                      <button
                        type="button"
                        onClick={() => setBookSelectorTab('catalog')}
                        className="mt-3 px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-black shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>Ver Livros do Acervo Geral</span>
                      </button>
                    </div>
                  ) : (
                    studentBooks
                      .filter((sb) => {
                        if (bookSelectorFilter === 'active') {
                          return sb.loan.status === 'em_andamento' || sb.loan.status === 'atrasado';
                        }
                        return true;
                      })
                      .map((sb) => {
                        const isCurrent =
                          selectedBookForQuiz.id === sb.book.id ||
                          selectedBookForQuiz.title.trim().toLowerCase() === sb.book.title.trim().toLowerCase();
                        const bookScore = (gameData.bookScores || {})[sb.book.title];

                        return (
                          <div
                            key={sb.book.id || sb.loan.id}
                            onClick={() => handleSelectBookForQuiz(sb.book, true)}
                            className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                              isCurrent
                                ? 'bg-amber-200/90 border-amber-500 border-b-4 border-orange-700 shadow-[0_2px_0_#c2410c]'
                                : 'bg-white/95 hover:bg-amber-50 border-amber-300/80 border-b-3 border-amber-400 shadow-xs'
                            }`}
                          >
                            <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                              <div className="w-12 h-16 rounded-xl overflow-hidden border-2 border-amber-300 flex-shrink-0 bg-amber-100 flex items-center justify-center shadow-xs">
                                {sb.book.cover ? (
                                  <img
                                    src={sb.book.cover}
                                    alt={sb.book.title}
                                    className="w-full h-full object-cover"
                                    referrerPolicy="no-referrer"
                                  />
                                ) : (
                                  <BookOpen className="w-5 h-5 text-amber-500" />
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span
                                    className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${
                                      sb.loan.status === 'em_andamento'
                                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                        : sb.loan.status === 'atrasado'
                                        ? 'bg-rose-100 text-rose-800 border-rose-300'
                                        : 'bg-cyan-100 text-cyan-800 border-cyan-300'
                                    }`}
                                  >
                                    {sb.loan.status === 'em_andamento'
                                      ? 'Em Andamento'
                                      : sb.loan.status === 'atrasado'
                                      ? 'Prazo Expirado'
                                      : 'Devolvido / Lido'}
                                  </span>
                                  <span className="text-[10px] text-amber-900/70 font-semibold">
                                    Cód: {sb.loan.id}
                                  </span>
                                </div>

                                <h4 className="text-xs sm:text-sm font-black text-[#2e1305] truncate mt-0.5">
                                  {sb.book.title}
                                </h4>
                                <span className="text-[11px] text-amber-900/80 font-medium block truncate">
                                  {sb.book.author}
                                </span>

                                <div className="flex items-center gap-2 mt-1 text-[10px] text-amber-950/80 flex-wrap">
                                  <span>Retirado: <strong>{sb.loan.loanDate}</strong></span>
                                  <span>•</span>
                                  <span>Devolução: <strong>{sb.loan.returnDate}</strong></span>
                                </div>

                                {bookScore && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-md mt-1">
                                    <Star className="w-3 h-3 fill-emerald-600 text-emerald-600" />
                                    <span>Pontuado: {bookScore.points} pts ({bookScore.score}/{bookScore.totalQuestions})</span>
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center justify-end sm:flex-col sm:items-end gap-1 flex-shrink-0">
                              {isCurrent ? (
                                <span className="text-[11px] font-black bg-orange-600 text-white px-3 py-1.5 rounded-xl shadow-xs flex items-center gap-1">
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Livro Atual</span>
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectBookForQuiz(sb.book, true);
                                  }}
                                  className="text-[11px] font-black text-amber-950 bg-amber-400 hover:bg-amber-300 px-3 py-1.5 rounded-xl border border-amber-500 shadow-xs cursor-pointer transition-all active:translate-y-0.5"
                                >
                                  Jogar Missão ➔
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                  )
                ) : (
                  books
                    .filter((b) => {
                      if (!bookSearchQuery.trim()) return true;
                      const q = bookSearchQuery.toLowerCase();
                      return (
                        b.title.toLowerCase().includes(q) ||
                        b.author.toLowerCase().includes(q) ||
                        b.category.toLowerCase().includes(q)
                      );
                    })
                    .map((b) => {
                      const isCurrent =
                        selectedBookForQuiz.id === b.id ||
                        selectedBookForQuiz.title.trim().toLowerCase() === b.title.trim().toLowerCase();
                      const bookScore = (gameData.bookScores || {})[b.title];

                      return (
                        <div
                          key={b.id}
                          onClick={() => handleSelectBookForQuiz(b, false)}
                          className={`p-2.5 sm:p-3 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                            isCurrent
                              ? 'bg-amber-200/90 border-amber-500 border-b-4 border-orange-700 shadow-[0_2px_0_#c2410c]'
                              : 'bg-white/95 hover:bg-amber-50 border-amber-300/80 border-b-3 border-amber-400 shadow-xs'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <div className="w-10 h-14 rounded-lg overflow-hidden border border-amber-300 flex-shrink-0 bg-amber-100 flex items-center justify-center">
                              {b.cover ? (
                                <img
                                  src={b.cover}
                                  alt={b.title}
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <BookOpen className="w-4 h-4 text-amber-500" />
                              )}
                            </div>
                            <div className="truncate">
                              <h4 className="text-xs sm:text-sm font-black text-[#2e1305] truncate">
                                {b.title}
                              </h4>
                              <span className="text-[11px] text-amber-900/80 font-medium block truncate">
                                {b.author}
                              </span>
                              {bookScore && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-md mt-1">
                                  <span>✓ Pontuado:</span>
                                  <strong>{bookScore.points} pts</strong>
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex-shrink-0">
                            {isCurrent ? (
                              <span className="text-[10px] sm:text-xs font-black bg-orange-600 text-white px-2.5 py-1 rounded-xl shadow-xs">
                                Selecionado
                              </span>
                            ) : (
                              <span className="text-[10px] sm:text-xs font-bold text-amber-900 bg-amber-100 px-2.5 py-1 rounded-xl hover:bg-amber-200">
                                Escolher
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                )}
              </div>

              {/* Footer */}
              <div className="pt-3 border-t-2 border-amber-300/80 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setIsBookSelectorModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-xs border border-amber-500 shadow-xs cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
