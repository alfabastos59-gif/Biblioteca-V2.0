import React, { useState, useMemo } from 'react';
import {
  Trophy,
  TrendingUp,
  Award,
  Medal,
  Flame,
  Search,
  Filter,
  GraduationCap,
  BookOpen,
  ArrowLeft,
  Sparkles,
  Users,
  Calendar,
  Share2,
  Printer,
  ChevronRight,
  Star,
  Cat
} from 'lucide-react';
import { Book, Loan, Student } from '../types';
import { useTheme } from '../context/ThemeContext';
import { loadScoresMap } from '../utils/quiterioScores';

interface RankingViewProps {
  books: Book[];
  loans: Loan[];
  students: Student[];
  onSelectBook: (book: Book) => void;
  onBackToHome?: () => void;
  onSelectStudent?: (student: Student) => void;
  onNavigateToQuiterio?: () => void;
}

export const RankingView: React.FC<RankingViewProps> = ({
  books,
  loans,
  students,
  onSelectBook,
  onBackToHome,
  onNavigateToQuiterio,
}) => {
  const { isDark } = useTheme();

  // State Filters
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [searchStudent, setSearchStudent] = useState<string>('');
  const [searchBook, setSearchBook] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'geral' | 'alunos' | 'livros'>('geral');

  // Available classes
  const classesList = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => {
      if (s.class) set.add(s.class);
    });
    return Array.from(set).sort();
  }, [students]);

  // Dynamic Student Ranking Calculation
  const fullStudentRanking = useMemo(() => {
    const scoresMap = loadScoresMap();
    return students
      .map((student) => {
        const studentLoans = loans.filter((l) => {
          const nameMatch = l.studentName && student.name && l.studentName.trim().toLowerCase() === student.name.trim().toLowerCase();
          const emailMatch = l.studentEmail && student.email && l.studentEmail.trim().toLowerCase() === student.email.trim().toLowerCase();
          const codeMatch = l.studentCode && student.studentCode && l.studentCode.trim().toLowerCase() === student.studentCode.trim().toLowerCase();
          return nameMatch || emailMatch || codeMatch;
        });

        const calculatedCount = studentLoans.length;
        const totalCount = Math.max(calculatedCount, student.totalLoansCount || 0);

        // Find Missão Quitério points
        const cleanCode = (student.studentCode || '').toLowerCase().replace(/^alu-/, '');
        const scoreData =
          scoresMap[cleanCode] ||
          scoresMap[student.name.toLowerCase()] ||
          scoresMap[student.id];
        const quiterioScore = scoreData ? scoreData.score : 0;
        const totalPoints = totalCount * 100 + quiterioScore;

        return {
          ...student,
          totalCount,
          quiterioScore,
          totalPoints,
          activeLoans: studentLoans.filter((l) => l.status === 'em_andamento' || l.status === 'atrasado').length,
          returnedLoans: studentLoans.filter((l) => l.status === 'devolvido').length,
        };
      })
      .sort((a, b) => {
        if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
        if (b.totalCount !== a.totalCount) return b.totalCount - a.totalCount;
        return a.name.localeCompare(b.name);
      });
  }, [students, loans]);

  // Filtered Student Ranking
  const filteredStudents = useMemo(() => {
    return fullStudentRanking.filter((st) => {
      const matchClass = selectedClass === 'all' || st.class.toLowerCase() === selectedClass.toLowerCase();
      const matchSearch =
        searchStudent === '' ||
        st.name.toLowerCase().includes(searchStudent.toLowerCase()) ||
        (st.studentCode && st.studentCode.toLowerCase().includes(searchStudent.toLowerCase())) ||
        st.class.toLowerCase().includes(searchStudent.toLowerCase());
      return matchClass && matchSearch;
    });
  }, [fullStudentRanking, selectedClass, searchStudent]);

  // Dynamic Book Ranking Calculation
  const fullBookRanking = useMemo(() => {
    return books
      .map((book) => {
        const bookLoans = loans.filter((l) => {
          const idMatch = l.bookId && l.bookId === book.id;
          const titleMatch = l.bookTitle && book.title && l.bookTitle.trim().toLowerCase() === book.title.trim().toLowerCase();
          return idMatch || titleMatch;
        });

        const totalLoans = bookLoans.length;
        return {
          ...book,
          totalLoans,
        };
      })
      .sort((a, b) => {
        if (b.totalLoans !== a.totalLoans) return b.totalLoans - a.totalLoans;
        if (b.rating !== a.rating) return b.rating - a.rating;
        return a.title.localeCompare(b.title);
      });
  }, [books, loans]);

  // Filtered Book Ranking
  const filteredBooks = useMemo(() => {
    return fullBookRanking.filter((bk) => {
      if (!searchBook) return true;
      const q = searchBook.toLowerCase();
      return (
        bk.title.toLowerCase().includes(q) ||
        bk.author.toLowerCase().includes(q) ||
        bk.category.toLowerCase().includes(q)
      );
    });
  }, [fullBookRanking, searchBook]);

  // Top 3 Podium for Students
  const top1 = fullStudentRanking[0];
  const top2 = fullStudentRanking[1];
  const top3 = fullStudentRanking[2];

  // Top 1 Book
  const top1Book = fullBookRanking[0];

  // Print Ranking Handler
  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className={`min-h-screen py-8 sm:py-12 transition-colors duration-200 ${
        isDark ? 'bg-[#001424] text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-8 border-b gap-4 border-[#163650]/40">
          <div>
            {onBackToHome && (
              <button
                onClick={onBackToHome}
                className={`inline-flex items-center gap-2 text-xs font-semibold mb-3 px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                  isDark
                    ? 'bg-[#092032] border-[#163650] text-slate-300 hover:text-white hover:border-emerald-500/40'
                    : 'bg-white border-slate-200 text-slate-700 hover:text-slate-950'
                }`}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Voltar para o Início</span>
              </button>
            )}

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-md">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <h1 className={`text-2xl sm:text-4xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Quadro Geral de Rankings
                </h1>
                <p className={`text-xs sm:text-sm mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Classificação oficial de leitores da Biblioteca Maria Quitéria e livros com maior circulação
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={handlePrint}
              title="Imprimir Ranking para Mural"
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border shadow-sm transition-all cursor-pointer ${
                isDark
                  ? 'bg-[#092032] border-[#163650] text-slate-300 hover:text-white hover:border-slate-500'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Printer className="w-4 h-4 text-emerald-500" />
              <span className="hidden sm:inline">Imprimir Mural</span>
            </button>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* BANNER ESPECIAL MISSÃO QUITÉRIO                                       */}
        {/* ===================================================================== */}
        {onNavigateToQuiterio && (
          <div className="mb-8 p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-500/20 via-indigo-500/20 to-purple-500/20 border-2 border-amber-400/50 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center shadow-md flex-shrink-0">
                <Cat className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-amber-400 flex items-center gap-1.5 justify-center sm:justify-start">
                  <span>Missão Quitério: Desafio do Conhecimento</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 font-bold uppercase">
                    Novo
                  </span>
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Responda perguntas sobre os livros que você retirou na biblioteca, acumule pontos e suba no Ranking da Escola!
                </p>
              </div>
            </div>
            <button
              onClick={onNavigateToQuiterio}
              className="px-5 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-xs sm:text-sm shadow-md flex items-center gap-2 cursor-pointer transition-all hover:scale-105 flex-shrink-0"
            >
              <span>Jogar Missão Quitério 🐾</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ===================================================================== */}
        {/* PODIUM DOS CAMPEÕES DE LEITURA (TOP 3 ALUNOS)                         */}
        {/* ===================================================================== */}
        <div className="mb-10">
          <div className="text-center mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Pódio de Honra aos Leitores 2026</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 items-end max-w-4xl mx-auto">
            {/* 2º LUGAR (PRATA) */}
            {top2 && (
              <div
                className={`order-2 md:order-1 rounded-2xl p-5 border text-center transition-all shadow-md relative ${
                  isDark ? 'bg-[#061e2f] border-slate-400/30' : 'bg-white border-slate-300'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-slate-300 text-slate-900 font-black text-sm flex items-center justify-center mx-auto mb-3 shadow-md border-2 border-white">
                  2º
                </div>
                <div className="w-16 h-16 rounded-full mx-auto p-1 bg-gradient-to-tr from-slate-400 to-slate-200 shadow-md mb-2.5 group">
                  <img
                    src={top2.avatar}
                    alt={top2.name}
                    className="w-full h-full object-cover rounded-full bg-slate-800 transition-transform duration-300 ease-out hover:scale-125 cursor-pointer shadow-lg hover:shadow-2xl"
                  />
                </div>
                <h3 className={`font-bold text-base truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {top2.name}
                </h3>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{top2.class}</p>
                <div className="mt-3 py-1.5 px-3 rounded-xl bg-slate-500/10 text-slate-300 inline-flex flex-col items-center gap-0.5 font-bold text-xs">
                  <span>🥈 {top2.totalCount} {top2.totalCount === 1 ? 'livro lido' : 'livros lidos'}</span>
                  {top2.quiterioScore > 0 && (
                    <span className="text-[10px] text-amber-400 font-extrabold flex items-center gap-1">
                      <Cat className="w-3 h-3" /> +{top2.quiterioScore} pts
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* 1º LUGAR (OURO - MAIS ALTO) */}
            {top1 && (
              <div
                className={`order-1 md:order-2 rounded-2xl p-6 border text-center transition-all shadow-xl relative -mt-4 md:-mt-8 ${
                  isDark
                    ? 'bg-gradient-to-b from-[#092b42] to-[#051824] border-amber-500/50 shadow-amber-500/10 ring-2 ring-amber-400/30'
                    : 'bg-gradient-to-b from-amber-50 to-white border-amber-300 shadow-lg'
                }`}
              >
                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-[11px] font-black uppercase mb-3 shadow">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Campeão Geral</span>
                </div>
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full mx-auto p-1.5 bg-gradient-to-tr from-amber-500 via-yellow-300 to-amber-600 shadow-lg mb-3 group">
                  <img
                    src={top1.avatar}
                    alt={top1.name}
                    className="w-full h-full object-cover rounded-full bg-slate-800 transition-transform duration-300 ease-out hover:scale-125 cursor-pointer shadow-xl hover:shadow-2xl hover:rotate-2"
                  />
                </div>
                <h3 className={`font-extrabold text-lg sm:text-xl truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {top1.name}
                </h3>
                <p className={`text-xs font-semibold ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
                  Turma {top1.class}
                </p>
                <div className="mt-3.5 py-2 px-4 rounded-xl bg-amber-500 text-slate-950 font-black text-sm inline-flex flex-col items-center gap-0.5 shadow-md">
                  <span>🥇 {top1.totalCount} {top1.totalCount === 1 ? 'livro emprestado' : 'livros emprestados'}</span>
                  {top1.quiterioScore > 0 && (
                    <span className="text-[10px] bg-amber-950/20 text-amber-950 font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Cat className="w-3 h-3" /> Missão: +{top1.quiterioScore} pts
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* 3º LUGAR (BRONZE) */}
            {top3 && (
              <div
                className={`order-3 rounded-2xl p-5 border text-center transition-all shadow-md relative ${
                  isDark ? 'bg-[#061e2f] border-amber-700/30' : 'bg-white border-amber-200'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-amber-700 text-white font-black text-sm flex items-center justify-center mx-auto mb-3 shadow-md border-2 border-white">
                  3º
                </div>
                <div className="w-16 h-16 rounded-full mx-auto p-1 bg-gradient-to-tr from-amber-700 to-amber-500 shadow-md mb-2.5 group">
                  <img
                    src={top3.avatar}
                    alt={top3.name}
                    className="w-full h-full object-cover rounded-full bg-slate-800 transition-transform duration-300 ease-out hover:scale-125 cursor-pointer shadow-lg hover:shadow-2xl"
                  />
                </div>
                <h3 className={`font-bold text-base truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {top3.name}
                </h3>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{top3.class}</p>
                <div className="mt-3 py-1.5 px-3 rounded-xl bg-amber-600/10 text-amber-500 inline-flex flex-col items-center gap-0.5 font-bold text-xs">
                  <span>🥉 {top3.totalCount} {top3.totalCount === 1 ? 'livro lido' : 'livros lidos'}</span>
                  {top3.quiterioScore > 0 && (
                    <span className="text-[10px] text-amber-400 font-extrabold flex items-center gap-1">
                      <Cat className="w-3 h-3" /> +{top3.quiterioScore} pts
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Tabs (Geral / Leitores / Livros) */}
        <div className="flex items-center justify-center mb-8">
          <div
            className={`inline-flex p-1 rounded-2xl border ${
              isDark ? 'bg-[#092032] border-[#163650]' : 'bg-slate-200/80 border-slate-300'
            }`}
          >
            <button
              onClick={() => setActiveTab('geral')}
              className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'geral'
                  ? 'bg-[#23c65e] text-white shadow-sm'
                  : isDark
                  ? 'text-slate-300 hover:text-white'
                  : 'text-slate-700 hover:text-slate-950'
              }`}
            >
              Visão Geral Dupla
            </button>
            <button
              onClick={() => setActiveTab('alunos')}
              className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'alunos'
                  ? 'bg-[#23c65e] text-white shadow-sm'
                  : isDark
                  ? 'text-slate-300 hover:text-white'
                  : 'text-slate-700 hover:text-slate-950'
              }`}
            >
              Ranking de Alunos ({students.length})
            </button>
            <button
              onClick={() => setActiveTab('livros')}
              className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'livros'
                  ? 'bg-[#23c65e] text-white shadow-sm'
                  : isDark
                  ? 'text-slate-300 hover:text-white'
                  : 'text-slate-700 hover:text-slate-950'
              }`}
            >
              Livros Mais Lidos ({books.length})
            </button>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* TAB 1: VISÃO GERAL DUPLA (FIEL À IMAGEM DO USUÁRIO)                  */}
        {/* ===================================================================== */}
        {activeTab === 'geral' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* CARD ESQUERDO: RANKING DE LEITORES */}
            <div
              className={`rounded-2xl p-5 sm:p-7 border shadow-md ${
                isDark ? 'bg-[#001424] border-[#163650]' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl sm:text-2xl font-serif font-bold tracking-tight flex items-center gap-2.5">
                  <span className="text-2xl">🏆</span>
                  <span>Ranking de leitores</span>
                </h2>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${isDark ? 'bg-[#092032] text-slate-400' : 'bg-slate-100 text-slate-600'}`}>
                  {fullStudentRanking.length} alunos
                </span>
              </div>

              <div className="space-y-2.5">
                {fullStudentRanking.slice(0, 10).map((st, index) => {
                  const pos = index + 1;
                  return (
                    <div
                      key={st.id}
                      className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                        isDark
                          ? pos === 1
                            ? 'bg-[#09263a] border-amber-500/40'
                            : 'bg-[#051a2a]/80 border-[#122e44] hover:bg-[#092237]'
                          : pos === 1
                          ? 'bg-amber-50 border-amber-200'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-7 flex items-center justify-center shrink-0">
                          {pos === 1 ? '🥇' : pos === 2 ? '🥈' : pos === 3 ? '🥉' : (
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              isDark ? 'bg-[#092032] text-slate-400' : 'bg-slate-200 text-slate-600'
                            }`}>
                              {pos}
                            </span>
                          )}
                        </div>

                        <img
                          src={st.avatar}
                          alt={st.name}
                          className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-700 bg-slate-800 transition-transform duration-300 ease-out hover:scale-125 hover:shadow-lg cursor-pointer z-10"
                        />

                        <div className="min-w-0">
                          <h3 className={`text-sm font-semibold truncate ${pos === 1 ? 'font-bold' : ''}`}>
                            {st.name}
                          </h3>
                          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{st.class}</p>
                        </div>
                      </div>

                      <div className="shrink-0 pl-2 text-right">
                        <span className={`text-xs font-bold block ${pos === 1 ? 'text-amber-400' : isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          {st.totalCount} {st.totalCount === 1 ? 'livro' : 'livros'}
                        </span>
                        {st.quiterioScore > 0 && (
                          <span className="text-[10px] text-amber-400 font-bold flex items-center justify-end gap-1">
                            <Cat className="w-3 h-3" /> +{st.quiterioScore} pts
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CARD DIREITO: MAIS LIDOS */}
            <div
              className={`rounded-2xl p-5 sm:p-7 border shadow-md ${
                isDark ? 'bg-[#001424] border-[#163650]' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl sm:text-2xl font-serif font-bold tracking-tight flex items-center gap-2.5">
                  <TrendingUp className="w-6 h-6 text-emerald-400" />
                  <span>Mais lidos</span>
                </h2>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${isDark ? 'bg-[#092032] text-slate-400' : 'bg-slate-100 text-slate-600'}`}>
                  {fullBookRanking.length} livros
                </span>
              </div>

              <div className="space-y-2.5">
                {fullBookRanking.slice(0, 10).map((bk, index) => {
                  const pos = index + 1;
                  return (
                    <div
                      key={bk.id}
                      onClick={() => onSelectBook(bk)}
                      className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer group ${
                        isDark
                          ? pos === 1
                            ? 'bg-[#06242a] border-emerald-500/40 hover:border-emerald-400'
                            : 'bg-[#051a2a]/80 border-[#122e44] hover:bg-[#092237]'
                          : pos === 1
                          ? 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-6 flex items-center justify-center shrink-0">
                          <span className={`text-xs sm:text-sm font-bold ${pos === 1 ? 'text-emerald-400 text-base' : isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {pos}
                          </span>
                        </div>

                        <div className="min-w-0 pr-2">
                          <h3 className={`text-sm font-semibold truncate group-hover:underline ${isDark ? 'text-white group-hover:text-emerald-400' : 'text-slate-900 group-hover:text-emerald-700'}`}>
                            {bk.title}
                          </h3>
                          <p className={`text-xs truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{bk.author}</p>
                        </div>
                      </div>

                      <div className="shrink-0 pl-2">
                        <span className={`text-xs font-semibold ${pos === 1 ? 'text-emerald-400 font-bold' : isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          {bk.totalLoans} empr.
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* TAB 2: RANKING COMPLETO DE ALUNOS COM FILTROS                         */}
        {/* ===================================================================== */}
        {activeTab === 'alunos' && (
          <div
            className={`rounded-2xl p-5 sm:p-7 border shadow-md ${
              isDark ? 'bg-[#001424] border-[#163650]' : 'bg-white border-slate-200'
            }`}
          >
            {/* Filters Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  value={searchStudent}
                  onChange={(e) => setSearchStudent(e.target.value)}
                  placeholder="Buscar aluno por nome ou código..."
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm border focus:outline-none ${
                    isDark
                      ? 'bg-[#092032] border-[#163650] text-white focus:border-emerald-500'
                      : 'bg-white border-slate-200 text-slate-900 focus:border-emerald-500'
                  }`}
                />
              </div>

              {/* Class Selector */}
              <div className="relative">
                <Filter className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className={`w-full pl-10 pr-8 py-2.5 rounded-xl text-xs sm:text-sm border appearance-none focus:outline-none ${
                    isDark
                      ? 'bg-[#092032] border-[#163650] text-white focus:border-emerald-500'
                      : 'bg-white border-slate-200 text-slate-900 focus:border-emerald-500'
                  }`}
                >
                  <option value="all">Todas as turmas</option>
                  {classesList.map((c) => (
                    <option key={c} value={c}>
                      Turma: {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Counter tag */}
              <div className="flex items-center justify-end">
                <span className={`text-xs font-semibold px-3 py-2 rounded-xl border ${isDark ? 'bg-[#092032] border-[#163650] text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-800'}`}>
                  Exibindo {filteredStudents.length} de {students.length} leitores
                </span>
              </div>
            </div>

            {/* Students Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className={`border-b text-[11px] uppercase tracking-wider ${isDark ? 'border-[#163650] text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                    <th className="py-3 px-3">Posição</th>
                    <th className="py-3 px-3">Aluno</th>
                    <th className="py-3 px-3">Turma</th>
                    <th className="py-3 px-3 text-center">Em Andamento</th>
                    <th className="py-3 px-3 text-center">Devolvidos</th>
                    <th className="py-3 px-3 text-center">Missão Quitério</th>
                    <th className="py-3 px-3 text-right">Total de Leituras</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-[#163650]/40' : 'divide-slate-100'}`}>
                  {filteredStudents.map((st, index) => {
                    const pos = index + 1;
                    return (
                      <tr
                        key={st.id}
                        className={`hover:bg-emerald-500/5 transition-colors ${
                          pos === 1 && isDark ? 'bg-amber-500/5' : ''
                        }`}
                      >
                        <td className="py-3 px-3 font-bold">
                          {pos === 1 ? '🥇 1º' : pos === 2 ? '🥈 2º' : pos === 3 ? '🥉 3º' : `${pos}º`}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={st.avatar}
                              alt={st.name}
                              className="w-8 h-8 rounded-full object-cover bg-slate-800"
                            />
                            <div>
                              <span className="font-bold block text-slate-100">{st.name}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded-md font-medium text-xs ${isDark ? 'bg-[#092032] text-slate-300' : 'bg-slate-100 text-slate-700'}`}>
                            {st.class}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-semibold text-amber-400">
                          {st.activeLoans}
                        </td>
                        <td className="py-3 px-3 text-center font-semibold text-emerald-400">
                          {st.returnedLoans}
                        </td>
                        <td className="py-3 px-3 text-center font-semibold text-amber-400">
                          {st.quiterioScore > 0 ? (
                            <span className="inline-flex items-center gap-1 font-bold text-amber-400">
                              <Cat className="w-3.5 h-3.5" /> +{st.quiterioScore} pts
                            </span>
                          ) : (
                            <span className="text-slate-500 text-xs">-</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right font-black text-emerald-400 text-sm">
                          {st.totalCount}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* TAB 3: RANKING COMPLETO DE LIVROS COM BUSCA                           */}
        {/* ===================================================================== */}
        {activeTab === 'livros' && (
          <div
            className={`rounded-2xl p-5 sm:p-7 border shadow-md ${
              isDark ? 'bg-[#001424] border-[#163650]' : 'bg-white border-slate-200'
            }`}
          >
            {/* Search Bar */}
            <div className="flex items-center justify-between mb-6 gap-4">
              <div className="relative max-w-md w-full">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  value={searchBook}
                  onChange={(e) => setSearchBook(e.target.value)}
                  placeholder="Buscar livros no ranking por título ou autor..."
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm border focus:outline-none ${
                    isDark
                      ? 'bg-[#092032] border-[#163650] text-white focus:border-emerald-500'
                      : 'bg-white border-slate-200 text-slate-900 focus:border-emerald-500'
                  }`}
                />
              </div>

              <span className={`text-xs font-semibold px-3 py-2 rounded-xl border ${isDark ? 'bg-[#092032] border-[#163650] text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-800'}`}>
                {filteredBooks.length} obras cadastradas
              </span>
            </div>

            {/* Grid of Books */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredBooks.map((bk, index) => {
                const pos = index + 1;
                return (
                  <div
                    key={bk.id}
                    onClick={() => onSelectBook(bk)}
                    className={`rounded-2xl p-3.5 border transition-all cursor-pointer group flex flex-col justify-between ${
                      isDark
                        ? pos === 1
                          ? 'bg-[#06242a] border-emerald-500/50 shadow-md'
                          : 'bg-[#092032] border-[#163650] hover:border-emerald-500/40'
                        : pos === 1
                        ? 'bg-emerald-50/70 border-emerald-300 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-emerald-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs font-black px-2 py-0.5 rounded-md ${
                          pos === 1
                            ? 'bg-emerald-500 text-slate-950 font-extrabold'
                            : isDark
                            ? 'bg-[#001424] text-slate-300'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          #{pos} Mais Lido
                        </span>
                        <span className="text-xs font-bold text-emerald-400">
                          {bk.totalLoans} empréstimos
                        </span>
                      </div>

                      <div className="aspect-[3/4] rounded-xl overflow-hidden mb-3 bg-slate-800">
                        <img
                          src={bk.cover}
                          alt={bk.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>

                      <h3 className={`text-sm font-bold truncate group-hover:underline ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {bk.title}
                      </h3>
                      <p className={`text-xs truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {bk.author}
                      </p>
                    </div>

                    <div className={`mt-3 pt-2.5 border-t flex items-center justify-between text-xs ${isDark ? 'border-[#163650]' : 'border-slate-100'}`}>
                      <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{bk.category}</span>
                      <div className="flex items-center gap-1 text-amber-400 font-bold text-xs">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>{bk.rating}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
