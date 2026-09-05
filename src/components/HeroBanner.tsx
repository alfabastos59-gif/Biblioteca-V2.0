import React from 'react';
import { Search, BookOpen, Users, RefreshCw, BarChart3, ChevronRight, Star } from 'lucide-react';
import { Book, Loan, Student } from '../types';
import { useTheme } from '../context/ThemeContext';
import { HomeRankingWidget } from './HomeRankingWidget';

interface HeroBannerProps {
  books: Book[];
  loans?: Loan[];
  students?: Student[];
  onSelectBook: (book: Book) => void;
  onViewCatalog: () => void;
  onViewRanking?: () => void;
  onViewMissaoQuiterio?: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  books,
  loans = [],
  students = [],
  onSelectBook,
  onViewCatalog,
  onViewRanking,
  onViewMissaoQuiterio,
  searchQuery,
  setSearchQuery,
  onSearchSubmit,
}) => {
  const { isDark, isKinetic } = useTheme();
  const featuredBooks = books.filter((b) => b.featured).slice(0, 5);
  const activeLoansCount = loans.filter((l) => l.status === 'em_andamento' || l.status === 'atrasado').length;

  return (
    <div className="relative overflow-hidden">
      {/* Hero Visual Section */}
      <div
        className={`relative pt-8 pb-16 lg:pt-14 lg:pb-20 border-b transition-colors duration-200 ${
          isKinetic
            ? 'bg-[#0c1014] border-[#2a313a]'
            : isDark
            ? 'bg-[#001424] border-[#163650]/60'
            : 'bg-gradient-to-b from-slate-100 via-white to-slate-50 border-slate-200'
        }`}
      >
        {/* Ambient background library lighting */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1507842229451-79b1be8d6293?w=1600&auto=format&fit=crop&q=80"
            alt="Biblioteca ambiente"
            className="w-full h-full object-cover object-center filter blur-[1px]"
          />
          <div
            className={`absolute inset-0 ${
              isDark
                ? 'bg-gradient-to-t from-[#001424] via-[#001424]/80 to-transparent'
                : 'bg-gradient-to-t from-slate-100 via-white/80 to-transparent'
            }`}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            {/* Title & Subtitle */}
            <h1
              className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight mb-3 ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              Nossa Biblioteca, <br />
              <span
                className={
                  isKinetic
                    ? 'text-[#0088cc] drop-shadow-[0_0_25px_rgba(0,136,204,0.4)]'
                    : isDark
                    ? 'text-[#1dbb64] drop-shadow-[0_0_25px_rgba(29,187,100,0.35)]'
                    : 'text-[#23c65e]'
                }
              >
                Nossa História.
              </span>
            </h1>
            <p
              className={`text-base sm:text-lg font-normal max-w-2xl mb-8 leading-relaxed ${
                isDark ? 'text-slate-300' : 'text-slate-600'
              }`}
            >
              Encontre livros, autores e histórias que inspiram e transformam.
            </p>

            {/* Search Bar matching Panel 1 */}
            <form onSubmit={onSearchSubmit} className="relative max-w-2xl mb-12">
              <div className="relative flex items-center">
                <input
                  id="hero-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar livros, autores, categorias..."
                  className={`w-full pl-5 pr-14 py-4 rounded-2xl border text-sm sm:text-base transition-all focus:outline-none ${
                    isKinetic
                      ? 'bg-[#1a1c1e] text-white placeholder-slate-400 border-[#2a313a] focus:border-[#0088cc] focus:ring-2 focus:ring-[#0088cc]/30 shadow-lg'
                      : isDark
                      ? 'bg-[#092032]/95 text-white placeholder-slate-400 border-[#1e3a5f] focus:border-[#1dbb64] focus:ring-2 focus:ring-[#1dbb64]/30 shadow-lg'
                      : 'bg-white text-slate-900 placeholder-slate-400 border-slate-200 focus:border-[#23c65e] focus:ring-2 focus:ring-[#23c65e]/20 shadow-md'
                  }`}
                />
                <button
                  id="hero-search-submit"
                  type="submit"
                  title="Buscar"
                  className={`absolute right-2 top-2 bottom-2 px-4 rounded-xl flex items-center justify-center transition-colors shadow-sm cursor-pointer ${
                    isKinetic
                      ? 'bg-[#0088cc] hover:bg-[#0077b5] text-white shadow-[0_0_10px_rgba(0,136,204,0.35)]'
                      : isDark
                      ? 'bg-[#1dbb64] hover:bg-[#16a354] text-white shadow-[0_0_10px_rgba(29,187,100,0.3)]'
                      : 'bg-[#23c65e] hover:bg-[#1fa950] text-white'
                  }`}
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>

          {/* 4 Metric Cards matching Panel 1 & 4 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-14">
            {/* 1. Livros cadastrados */}
            <div
              className={`backdrop-blur-sm border rounded-2xl p-4 sm:p-5 flex items-center gap-4 transition-colors shadow-sm ${
                isKinetic
                  ? 'bg-[#1a1c1e] border-[#2a313a] hover:border-[#0088cc]/50'
                  : isDark
                  ? 'bg-[#092032]/80 border-[#163650] hover:border-emerald-500/40'
                  : 'bg-white border-slate-200 hover:border-blue-300'
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-500 shrink-0">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <span
                  className={`text-2xl sm:text-3xl font-extrabold block leading-none mb-1 ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {books.length}
                </span>
                <span className={`text-xs sm:text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Livros cadastrados
                </span>
              </div>
            </div>

            {/* 2. Alunos cadastrados */}
            <div
              className={`backdrop-blur-sm border rounded-2xl p-4 sm:p-5 flex items-center gap-4 transition-colors shadow-sm ${
                isKinetic
                  ? 'bg-[#1a1c1e] border-[#2a313a] hover:border-[#00a651]/50'
                  : isDark
                  ? 'bg-[#092032]/80 border-[#163650] hover:border-purple-500/40'
                  : 'bg-white border-slate-200 hover:border-purple-300'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  isKinetic
                    ? 'bg-[#00a651]/15 border border-[#00a651]/30 text-[#00a651]'
                    : 'bg-purple-500/10 border border-purple-500/30 text-purple-500'
                }`}
              >
                <Users className="w-6 h-6" />
              </div>
              <div>
                <span
                  className={`text-2xl sm:text-3xl font-extrabold block leading-none mb-1 ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {students.length}
                </span>
                <span className={`text-xs sm:text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Alunos cadastrados
                </span>
              </div>
            </div>

            {/* 3. Empréstimos ativos */}
            <div
              className={`backdrop-blur-sm border rounded-2xl p-4 sm:p-5 flex items-center gap-4 transition-colors shadow-sm ${
                isKinetic
                  ? 'bg-[#1a1c1e] border-[#2a313a] hover:border-[#f25622]/50'
                  : isDark
                  ? 'bg-[#092032]/80 border-[#163650] hover:border-amber-500/40'
                  : 'bg-white border-slate-200 hover:border-amber-300'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  isKinetic
                    ? 'bg-[#f25622]/15 border border-[#f25622]/30 text-[#f25622]'
                    : 'bg-amber-500/10 border border-amber-500/30 text-amber-500'
                }`}
              >
                <RefreshCw className="w-6 h-6" />
              </div>
              <div>
                <span
                  className={`text-2xl sm:text-3xl font-extrabold block leading-none mb-1 ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {activeLoansCount}
                </span>
                <span className={`text-xs sm:text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Empréstimos ativos
                </span>
              </div>
            </div>

            {/* 4. Total de empréstimos */}
            <div
              className={`backdrop-blur-sm border rounded-2xl p-4 sm:p-5 flex items-center gap-4 transition-colors shadow-sm ${
                isKinetic
                  ? 'bg-[#1a1c1e] border-[#2a313a] hover:border-[#0088cc]/50'
                  : isDark
                  ? 'bg-[#092032]/80 border-[#163650] hover:border-emerald-500/40'
                  : 'bg-white border-slate-200 hover:border-emerald-300'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  isKinetic
                    ? 'bg-[#0088cc]/15 border border-[#0088cc]/30 text-[#0088cc]'
                    : 'bg-emerald-500/10 border border-emerald-500/30 text-[#23c65e]'
                }`}
              >
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <span
                  className={`text-2xl sm:text-3xl font-extrabold block leading-none mb-1 ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {loans.length}
                </span>
                <span className={`text-xs sm:text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Total de empréstimos
                </span>
              </div>
            </div>
          </div>

          {/* Livros em destaque Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2
                className={`text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2 ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                <span>Livros em destaque</span>
              </h2>
              <button
                id="btn-ver-todos-destaques"
                onClick={onViewCatalog}
                className={`text-xs sm:text-sm font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                  isDark ? 'text-[#1dbb64] hover:text-emerald-300' : 'text-emerald-600 hover:text-emerald-700'
                }`}
              >
                <span>Ver todos</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Book Cards Row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-5">
              {featuredBooks.map((book) => (
                <div
                  key={book.id}
                  id={`featured-book-${book.id}`}
                  onClick={() => onSelectBook(book)}
                  className={`group border rounded-2xl p-3 flex flex-col cursor-pointer transition-all duration-200 hover:-translate-y-1.5 ${
                    isDark
                      ? 'bg-[#092032] border-[#163650] hover:border-[#1dbb64] hover:shadow-[0_12px_25px_rgba(0,0,0,0.5),0_0_15px_rgba(29,187,100,0.2)]'
                      : 'bg-white border-slate-200 hover:border-[#23c65e] hover:shadow-lg shadow-sm'
                  }`}
                >
                  {/* Book Cover */}
                  <div
                    className={`relative aspect-[3/4] w-full rounded-xl overflow-hidden mb-3 border ${
                      isDark ? 'bg-[#031320] border-[#1e3a5f]/50' : 'bg-slate-100 border-slate-200'
                    }`}
                  >
                    <img
                      src={book.cover}
                      alt={book.title}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&auto=format&fit=crop&q=80';
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2">
                      <span className="bg-[#23c65e] text-white text-[10px] font-semibold px-2 py-0.5 rounded-md backdrop-blur-sm shadow-sm">
                        Disponível
                      </span>
                    </div>
                  </div>

                  {/* Book Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3
                        className={`text-sm font-bold transition-colors line-clamp-1 ${
                          isDark
                            ? 'text-white group-hover:text-[#1dbb64]'
                            : 'text-slate-900 group-hover:text-[#23c65e]'
                        }`}
                      >
                        {book.title}
                      </h3>
                      <p className={`text-xs line-clamp-1 mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {book.author}
                      </p>
                    </div>

                    <div
                      className={`flex items-center justify-between pt-2 border-t ${
                        isDark ? 'border-[#163650]/60' : 'border-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-1 text-amber-400 text-xs font-semibold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{book.rating}</span>
                      </div>
                      <span
                        className={`text-[11px] font-medium group-hover:underline ${
                          isDark ? 'text-emerald-400' : 'text-emerald-600'
                        }`}
                      >
                        Ver detalhes
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ranking & Destaque Section */}
          <HomeRankingWidget
            books={books}
            loans={loans}
            students={students}
            onSelectBook={onSelectBook}
            onViewFullRanking={onViewRanking || onViewCatalog}
          />
        </div>
      </div>
    </div>
  );
};


