import React from 'react';
import { Search, BookOpen, Users, RefreshCw, BarChart3, ChevronRight, Star, Sparkles, Film } from 'lucide-react';
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
  onOpenOpeningVideo?: () => void;
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
  onOpenOpeningVideo,
  searchQuery,
  setSearchQuery,
  onSearchSubmit,
}) => {
  const { isDark, isKinetic, isPurple, isEmerald } = useTheme();
  const featuredBooks = books.filter((b) => b.featured).slice(0, 5);
  const activeLoansCount = loans.filter((l) => l.status === 'em_andamento' || l.status === 'atrasado').length;

  return (
    <div className="relative overflow-hidden">
      {/* Hero Visual Section */}
      <div
        className={`relative pt-8 pb-14 lg:pt-12 lg:pb-16 border-b transition-colors duration-200 ${
          isEmerald
            ? 'bg-[#021726] border-[#072d42]'
            : isPurple
            ? 'bg-[#13072b] border-[#3e196e]'
            : isKinetic
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
              isEmerald
                ? 'bg-gradient-to-t from-[#021726] via-[#021726]/85 to-transparent'
                : isPurple
                ? 'bg-gradient-to-t from-[#13072b] via-[#13072b]/85 to-transparent'
                : isDark
                ? 'bg-gradient-to-t from-[#001424] via-[#001424]/80 to-transparent'
                : 'bg-gradient-to-t from-slate-100 via-white/80 to-transparent'
            }`}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Row: Left Content (Title, Subtitle, Search) + Right Magic Illustration */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-10">
            {/* Left Column (7 cols): Text & Search */}
            <div className="lg:col-span-7">
              {/* Badge & Quick Opening Trigger */}
              <div className="flex flex-wrap items-center gap-2.5 mb-4">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide border ${
                  isEmerald
                    ? 'bg-[#00e676]/15 text-[#00e676] border-[#00e676]/30'
                    : isPurple
                    ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                    : isKinetic
                    ? 'bg-[#0088cc]/15 text-cyan-300 border-[#0088cc]/30'
                    : isDark
                    ? 'bg-[#1dbb64]/15 text-emerald-400 border-[#1dbb64]/30'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Biblioteca Oficial CECMQ</span>
                </span>

                {onOpenOpeningVideo && (
                  <button
                    id="hero-watch-opening-video-btn"
                    type="button"
                    onClick={onOpenOpeningVideo}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-extrabold transition-all duration-200 cursor-pointer bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 border border-amber-500/40 shadow-sm hover:scale-105 active:scale-95 group"
                  >
                    <Film className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform" />
                    <span>▶ Assistir Vídeo de Abertura</span>
                  </button>
                )}
              </div>

              {/* Title & Subtitle */}
              <h1
                className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight mb-3 ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                Nossa Biblioteca, <br />
                <span
                  className={
                    isEmerald
                      ? 'text-[#00e676] drop-shadow-[0_0_25px_rgba(0,230,118,0.45)]'
                      : isPurple
                      ? 'bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-300 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(168,85,247,0.5)]'
                      : isKinetic
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
                  isEmerald
                    ? 'text-slate-300'
                    : isPurple
                    ? 'text-purple-200/90'
                    : isDark
                    ? 'text-slate-300'
                    : 'text-slate-600'
                }`}
              >
                Encontre livros, autores e histórias que inspiram e transformam.
              </p>

              {/* Search Bar matching the exact requested UI */}
              <form onSubmit={onSearchSubmit} className="relative max-w-2xl">
                <div className="relative flex items-center">
                  <input
                    id="hero-search-input"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar livros, autores, categorias..."
                    className={`w-full pl-5 pr-14 py-4 rounded-2xl border text-sm sm:text-base transition-all focus:outline-none ${
                      isEmerald
                        ? 'bg-[#021827]/90 text-white placeholder-slate-400 border-[#0b4d5e] focus:border-[#00e676] focus:ring-2 focus:ring-[#00e676]/30 shadow-xl'
                        : isPurple
                        ? 'bg-[#16082d] text-white placeholder-purple-300/60 border-[#3d196f] focus:border-[#a855f7] focus:ring-2 focus:ring-[#a855f7]/30 shadow-xl'
                        : isKinetic
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
                      isEmerald
                        ? 'bg-[#00e676] hover:bg-[#00c864] text-slate-950 shadow-[0_0_15px_rgba(0,230,118,0.4)]'
                        : isPurple
                        ? 'bg-[#a855f7] hover:bg-[#9333ea] text-white shadow-[0_0_12px_rgba(168,85,247,0.5)]'
                        : isKinetic
                        ? 'bg-[#0088cc] hover:bg-[#0077b5] text-white shadow-[0_0_10px_rgba(0,136,204,0.35)]'
                        : isDark
                        ? 'bg-[#1dbb64] hover:bg-[#16a354] text-white shadow-[0_0_10px_rgba(29,187,100,0.3)]'
                        : 'bg-[#23c65e] hover:bg-[#1fa950] text-white'
                    }`}
                  >
                    <Search className={`w-5 h-5 ${isEmerald ? 'text-slate-950' : ''}`} />
                  </button>
                </div>
              </form>
            </div>

            {/* Right Column (5 cols): Magic Book Illustration (Emerald / Petróleo or Purple Cosmic) */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
              {isEmerald || !isPurple ? (
                /* ILUSTRAÇÃO PETRÓLEO & ESMERALDA NEON (Imagem 34.jpg) */
                <div className="relative w-full max-w-md h-64 sm:h-72 flex items-center justify-center">
                  <svg
                    viewBox="0 0 450 320"
                    className="w-full h-full drop-shadow-[0_10px_35px_rgba(0,230,118,0.25)]"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <radialGradient id="emeraldBookGlow" cx="200" cy="210" r="150" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#fef08a" stopOpacity="0.85" />
                        <stop offset="30%" stopColor="#f59e0b" stopOpacity="0.45" />
                        <stop offset="65%" stopColor="#0284c7" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#021726" stopOpacity="0" />
                      </radialGradient>
                      <linearGradient id="tableWood" x1="50" y1="280" x2="420" y2="280" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#1e130c" />
                        <stop offset="50%" stopColor="#2c1a0e" />
                        <stop offset="100%" stopColor="#180e08" />
                      </linearGradient>
                      <linearGradient id="bookRedSpine" x1="280" y1="165" x2="400" y2="165" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#991b1b" />
                        <stop offset="70%" stopColor="#b91c1c" />
                        <stop offset="100%" stopColor="#7f1d1d" />
                      </linearGradient>
                      <linearGradient id="bookAmberSpine" x1="275" y1="200" x2="405" y2="200" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#b45309" />
                        <stop offset="60%" stopColor="#d97706" />
                        <stop offset="100%" stopColor="#92400e" />
                      </linearGradient>
                      <linearGradient id="bookBlueSpine" x1="270" y1="240" x2="410" y2="240" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#0e3f60" />
                        <stop offset="65%" stopColor="#0284c7" />
                        <stop offset="100%" stopColor="#072d42" />
                      </linearGradient>
                    </defs>

                    {/* Fundo de luz ambiente mágica */}
                    <circle cx="200" cy="200" r="140" fill="url(#emeraldBookGlow)" />

                    {/* Superfície da mesa rústica */}
                    <path
                      d="M30 270 Q225 265 420 270 L430 310 Q225 315 20 310 Z"
                      fill="url(#tableWood)"
                      stroke="#422513"
                      strokeWidth="1.5"
                    />

                    {/* Sombra suave dos livros sobre a mesa */}
                    <ellipse cx="200" cy="275" rx="140" ry="12" fill="#000000" fillOpacity="0.55" filter="blur(4px)" />

                    {/* LIVRO ABERTO (À ESQUERDA/CENTRO) EMANANDO LUZ DOURADA */}
                    <path
                      d="M80 255 Q130 268 190 260 L190 264 Q130 272 78 259 Z"
                      fill="#78350f"
                    />
                    <path
                      d="M190 260 Q250 268 300 255 L302 259 Q250 272 190 264 Z"
                      fill="#78350f"
                    />

                    {/* Páginas do livro aberto */}
                    <path
                      d="M190 255 C150 258 110 245 85 240 L85 210 C115 215 155 228 190 225 Z"
                      fill="#fef9c3"
                      stroke="#ca8a04"
                      strokeWidth="0.8"
                    />
                    <path d="M100 220 C125 223 150 230 175 228" stroke="#ca8a04" strokeWidth="1" strokeOpacity="0.6" strokeDasharray="3 2" />
                    <path d="M100 228 C125 231 150 238 175 236" stroke="#ca8a04" strokeWidth="1" strokeOpacity="0.6" strokeDasharray="3 2" />
                    <path d="M100 236 C125 239 150 246 175 244" stroke="#ca8a04" strokeWidth="1" strokeOpacity="0.6" strokeDasharray="3 2" />

                    <path
                      d="M190 225 C225 228 265 215 295 210 L295 240 C270 245 230 258 190 255 Z"
                      fill="#fef08a"
                      stroke="#ca8a04"
                      strokeWidth="0.8"
                    />
                    <path d="M205 228 C230 230 255 223 280 220" stroke="#ca8a04" strokeWidth="1" strokeOpacity="0.6" strokeDasharray="3 2" />
                    <path d="M205 236 C230 238 255 231 280 228" stroke="#ca8a04" strokeWidth="1" strokeOpacity="0.6" strokeDasharray="3 2" />
                    <path d="M205 244 C230 246 255 239 280 236" stroke="#ca8a04" strokeWidth="1" strokeOpacity="0.6" strokeDasharray="3 2" />

                    {/* Lombada central */}
                    <path d="M190 225 L190 258" stroke="#a16207" strokeWidth="2.5" />

                    {/* Feixes de luz ascendentes e partículas douradas */}
                    <path d="M190 220 L160 120" stroke="#fde047" strokeWidth="1.5" strokeOpacity="0.7" strokeDasharray="4 6" />
                    <path d="M190 220 L190 100" stroke="#fef08a" strokeWidth="2" strokeOpacity="0.8" strokeDasharray="5 7" />
                    <path d="M190 220 L225 115" stroke="#fde047" strokeWidth="1.5" strokeOpacity="0.7" strokeDasharray="4 6" />
                    <circle cx="160" cy="140" r="3" fill="#fef08a" opacity="0.9" />
                    <circle cx="220" cy="130" r="2.5" fill="#fef08a" opacity="0.9" />
                    <circle cx="185" cy="110" r="3.5" fill="#ffffff" opacity="0.9" />
                    <circle cx="140" cy="170" r="2" fill="#fde047" opacity="0.8" />
                    <circle cx="240" cy="165" r="2" fill="#fde047" opacity="0.8" />

                    {/* PILHA DE LIVROS ENCADERNADOS (À DIREITA) */}
                    {/* Livro 3 (Base - Azul Noturno) */}
                    <g filter="drop-shadow(0 4px 6px rgba(0,0,0,0.4))">
                      <rect x="270" y="242" width="138" height="26" rx="4" fill="url(#bookBlueSpine)" stroke="#0c4a6e" strokeWidth="1" />
                      <rect x="274" y="245" width="6" height="20" rx="2" fill="#38bdf8" fillOpacity="0.4" />
                      <line x1="288" y1="246" x2="288" y2="264" stroke="#f1f5f9" strokeWidth="1" strokeOpacity="0.3" />
                      <line x1="392" y1="246" x2="392" y2="264" stroke="#f1f5f9" strokeWidth="1" strokeOpacity="0.3" />
                      <path d="M408 245 L416 248 L416 262 L408 265 Z" fill="#f8fafc" stroke="#94a3b8" strokeWidth="0.5" />
                    </g>

                    {/* Livro 2 (Meio - Couro Dourado / Âmbar) */}
                    <g filter="drop-shadow(0 4px 6px rgba(0,0,0,0.4))">
                      <rect x="276" y="210" width="128" height="26" rx="4" fill="url(#bookAmberSpine)" stroke="#78350f" strokeWidth="1" />
                      <rect x="282" y="213" width="5" height="20" rx="1.5" fill="#fde047" fillOpacity="0.5" />
                      <line x1="294" y1="214" x2="294" y2="232" stroke="#fef3c7" strokeWidth="1" strokeOpacity="0.4" />
                      <line x1="388" y1="214" x2="388" y2="232" stroke="#fef3c7" strokeWidth="1" strokeOpacity="0.4" />
                      <path d="M404 213 L412 216 L412 230 L404 233 Z" fill="#fef9c3" stroke="#d97706" strokeWidth="0.5" />
                    </g>

                    {/* Livro 1 (Topo - Couro Vinho / Vermelho Nobre com Arabesco) */}
                    <g filter="drop-shadow(0 5px 8px rgba(0,0,0,0.5))">
                      <rect x="282" y="176" width="118" height="28" rx="4" fill="url(#bookRedSpine)" stroke="#581c87" strokeWidth="1" />
                      <rect x="288" y="180" width="6" height="20" rx="2" fill="#f59e0b" fillOpacity="0.7" />
                      <line x1="300" y1="180" x2="300" y2="200" stroke="#fde047" strokeWidth="1.2" strokeOpacity="0.6" />
                      <line x1="382" y1="180" x2="382" y2="200" stroke="#fde047" strokeWidth="1.2" strokeOpacity="0.6" />
                      <circle cx="340" cy="190" r="4" fill="#fbbf24" fillOpacity="0.6" />
                      <path d="M400 179 L408 182 L408 198 L400 201 Z" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.5" />
                    </g>
                  </svg>

                  {/* FRASE DA IMAGEM 34.JPG: "Conhecimento também transforma vidas!" */}
                  <div className="absolute top-3 right-0 sm:right-2 text-right select-none pointer-events-none">
                    <div className="flex items-center justify-end gap-1 mb-0.5">
                      <Sparkles className="w-4 h-4 text-[#38bdf8] drop-shadow-[0_0_8px_rgba(56,189,248,0.9)] animate-pulse" />
                      <span className="text-sm sm:text-base font-bold tracking-wide text-[#7dd3fc] drop-shadow-[0_2px_12px_rgba(56,189,248,0.8)]">
                        Conhecimento
                      </span>
                    </div>
                    <span className="block text-xs font-medium text-[#38bdf8] italic tracking-wider drop-shadow-[0_1px_8px_rgba(56,189,248,0.6)]">
                      também
                    </span>
                    <span className="block text-sm sm:text-base font-extrabold text-[#bae6fd] tracking-tight drop-shadow-[0_2px_12px_rgba(56,189,248,0.9)]">
                      transforma vidas!
                    </span>
                  </div>
                </div>
              ) : (
                /* ILUSTRAÇÃO TEMA ROXO CÓSMICO */
                <div className="relative w-full max-w-md h-64 sm:h-72 flex items-center justify-center">
                  <svg
                    viewBox="0 0 450 320"
                    className="w-full h-full drop-shadow-[0_10px_35px_rgba(168,85,247,0.3)]"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <linearGradient id="bookLightGlow" x1="225" y1="260" x2="225" y2="70" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#fef08a" stopOpacity="0.85" />
                        <stop offset="35%" stopColor="#f472b6" stopOpacity="0.6" />
                        <stop offset="70%" stopColor="#c084fc" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
                      </linearGradient>
                      <linearGradient id="bookCoverGrad" x1="120" y1="270" x2="330" y2="270" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#6b21a8" />
                        <stop offset="50%" stopColor="#a855f7" />
                        <stop offset="100%" stopColor="#6b21a8" />
                      </linearGradient>
                      <linearGradient id="planetGrad" x1="260" y1="50" x2="320" y2="110" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#f472b6" />
                        <stop offset="100%" stopColor="#9333ea" />
                      </linearGradient>
                    </defs>

                    {/* Light Burst Beam from Book Center */}
                    <path
                      d="M225 240 L120 70 L330 70 Z"
                      fill="url(#bookLightGlow)"
                    />
                    <path
                      d="M225 240 L160 50 L290 50 Z"
                      fill="url(#bookLightGlow)"
                      opacity="0.8"
                    />

                    {/* Open Book Base */}
                    <path
                      d="M225 250 C190 238 150 238 120 255 C120 255 125 270 225 265 Z"
                      fill="#4c1d95"
                    />
                    <path
                      d="M225 245 C190 230 150 230 115 250 C115 250 120 262 225 255 Z"
                      fill="#7c3aed"
                    />
                    <path
                      d="M225 240 C190 222 150 222 110 245 C110 245 115 255 225 248 Z"
                      fill="#f5d0fe"
                    />

                    <path
                      d="M225 250 C260 238 300 238 330 255 C330 255 325 270 225 265 Z"
                      fill="#4c1d95"
                    />
                    <path
                      d="M225 245 C260 230 300 230 335 250 C335 250 330 262 225 255 Z"
                      fill="#7c3aed"
                    />
                    <path
                      d="M225 240 C260 222 300 222 340 245 C340 245 335 255 225 248 Z"
                      fill="#f5d0fe"
                    />

                    {/* Spine of the Book */}
                    <ellipse cx="225" cy="265" rx="14" ry="4" fill="#a855f7" />

                    {/* Planet with Rings (Saturn) */}
                    <g transform="translate(300, 80)">
                      <path
                        d="M -30 6 A 35 12 0 0 1 30 -6"
                        stroke="#fbbf24"
                        strokeWidth="3.5"
                        fill="none"
                        opacity="0.85"
                      />
                      <circle cx="0" cy="0" r="18" fill="url(#planetGrad)" />
                      <path
                        d="M 30 -6 A 35 12 0 0 1 -30 6"
                        stroke="#fef08a"
                        strokeWidth="3.5"
                        fill="none"
                      />
                    </g>

                    {/* Idea Lightbulb at the Center Light Beam */}
                    <g transform="translate(225, 125)">
                      <circle cx="0" cy="0" r="24" fill="#fde047" opacity="0.3" />
                      <path
                        d="M-10 -5 C-15 -18 15 -18 10 -5 C8 -1 7 4 5 7 L-5 7 C-7 4 -8 -1 -10 -5 Z"
                        fill="#fef08a"
                        stroke="#f59e0b"
                        strokeWidth="2"
                      />
                      <rect x="-4" y="8" width="8" height="3" rx="1.5" fill="#f59e0b" />
                      <rect x="-3" y="12" width="6" height="2" rx="1" fill="#d97706" />
                      <path d="M-4 -6 L0 -2 L4 -6" stroke="#d97706" strokeWidth="1.5" fill="none" />
                      <line x1="0" y1="-22" x2="0" y2="-18" stroke="#fef08a" strokeWidth="2" strokeLinecap="round" />
                      <line x1="-16" y1="-14" x2="-13" y2="-11" stroke="#fef08a" strokeWidth="2" strokeLinecap="round" />
                      <line x1="16" y1="-14" x2="13" y2="-11" stroke="#fef08a" strokeWidth="2" strokeLinecap="round" />
                    </g>

                    {/* Musical Notes Floating */}
                    <g transform="translate(325, 140)">
                      <circle cx="-6" cy="4" r="3.5" fill="#f472b6" />
                      <circle cx="6" cy="1" r="3.5" fill="#f472b6" />
                      <line x1="-3" y1="4" x2="-3" y2="-10" stroke="#f472b6" strokeWidth="2" />
                      <line x1="9" y1="1" x2="9" y2="-13" stroke="#f472b6" strokeWidth="2" />
                      <line x1="-3" y1="-9" x2="9" y2="-12" stroke="#f472b6" strokeWidth="2.5" />
                    </g>
                    <g transform="translate(170, 80)">
                      <circle cx="0" cy="0" r="3" fill="#e879f9" />
                      <line x1="3" y1="0" x2="3" y2="-10" stroke="#e879f9" strokeWidth="1.8" />
                      <path d="M3 -10 C6 -9 8 -6 8 -4" stroke="#e879f9" strokeWidth="1.8" fill="none" />
                    </g>

                    <circle cx="150" cy="120" r="8" fill="#ec4899" opacity="0.8" />
                    <path d="M140 122 C146 118 156 118 160 122" stroke="#fbcfe8" strokeWidth="1.5" fill="none" />

                    <path d="M125 90 L128 97 L135 100 L128 103 L125 110 L122 103 L115 100 L122 97 Z" fill="#fde047" />
                    <path d="M280 45 L282 50 L287 52 L282 54 L280 59 L278 54 L273 52 L278 50 Z" fill="#fef08a" />
                    <path d="M370 115 L371 119 L375 120 L371 121 L370 125 L369 121 L365 120 L369 119 Z" fill="#e879f9" />
                    <circle cx="190" cy="50" r="2" fill="#ffffff" opacity="0.9" />
                    <circle cx="210" cy="70" r="1.5" fill="#fef08a" />
                    <circle cx="260" cy="150" r="2" fill="#ffffff" />
                    <circle cx="340" cy="190" r="2" fill="#ec4899" />
                    <circle cx="170" cy="180" r="2.5" fill="#fde047" />

                    <path
                      d="M210 230 Q 180 160 160 100"
                      stroke="#c084fc"
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                      fill="none"
                      opacity="0.7"
                    />
                    <path
                      d="M240 230 Q 280 170 310 110"
                      stroke="#f472b6"
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                      fill="none"
                      opacity="0.7"
                    />
                  </svg>

                  {/* Inspirational Text Badge: "Mais que livros, novos mundos!" */}
                  <div className="absolute right-0 top-6 sm:top-8 max-w-[130px] text-right pointer-events-none select-none">
                    <span className="block text-sm sm:text-base font-bold italic tracking-wide text-[#e9d5ff] drop-shadow-[0_2px_10px_rgba(168,85,247,0.6)] leading-tight">
                      Mais que livros,
                    </span>
                    <span className="block text-xs sm:text-sm font-extrabold text-[#f472b6] drop-shadow-[0_2px_10px_rgba(244,114,182,0.6)]">
                      novos mundos!
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 4 Metric Cards matching the exact color scheme from image */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-14">
            {/* 1. Livros cadastrados (Azul #0284c7 na imagem 34.jpg) */}
            <div
              className={`backdrop-blur-sm border rounded-2xl p-4 sm:p-5 flex items-center gap-4 transition-colors shadow-sm ${
                isEmerald
                  ? 'bg-[#062438] border-[#0c4061] hover:border-[#0284c7]/50'
                  : isPurple
                  ? 'bg-[#240f47] border-[#3e196e] hover:border-[#a855f7]/50'
                  : isKinetic
                  ? 'bg-[#1a1c1e] border-[#2a313a] hover:border-[#0088cc]/50'
                  : isDark
                  ? 'bg-[#092032]/80 border-[#163650] hover:border-emerald-500/40'
                  : 'bg-white border-slate-200 hover:border-blue-300'
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-[#0284c7] flex items-center justify-center text-white shrink-0 shadow-md">
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
                <span className={`text-xs sm:text-sm font-medium ${isEmerald ? 'text-slate-400' : isPurple ? 'text-purple-200/80' : isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Livros cadastrados
                </span>
              </div>
            </div>

            {/* 2. Alunos cadastrados (Roxo / Índigo #5b21b6 na imagem 34.jpg) */}
            <div
              className={`backdrop-blur-sm border rounded-2xl p-4 sm:p-5 flex items-center gap-4 transition-colors shadow-sm ${
                isEmerald
                  ? 'bg-[#12193b] border-[#232c66] hover:border-[#6366f1]/50'
                  : isPurple
                  ? 'bg-[#240f47] border-[#3e196e] hover:border-[#a855f7]/50'
                  : isKinetic
                  ? 'bg-[#1a1c1e] border-[#2a313a] hover:border-[#00a651]/50'
                  : isDark
                  ? 'bg-[#092032]/80 border-[#163650] hover:border-purple-500/40'
                  : 'bg-white border-slate-200 hover:border-purple-300'
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-[#5b21b6] flex items-center justify-center text-white shrink-0 shadow-md">
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
                <span className={`text-xs sm:text-sm font-medium ${isEmerald ? 'text-slate-400' : isPurple ? 'text-purple-200/80' : isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Alunos cadastrados
                </span>
              </div>
            </div>

            {/* 3. Empréstimos ativos (Âmbar #b45309 com ícone dourado na imagem 34.jpg) */}
            <div
              className={`backdrop-blur-sm border rounded-2xl p-4 sm:p-5 flex items-center gap-4 transition-colors shadow-sm ${
                isEmerald
                  ? 'bg-[#201a0f] border-[#4d3a17] hover:border-[#b45309]/50'
                  : isPurple
                  ? 'bg-[#240f47] border-[#3e196e] hover:border-[#a855f7]/50'
                  : isKinetic
                  ? 'bg-[#1a1c1e] border-[#2a313a] hover:border-[#f25622]/50'
                  : isDark
                  ? 'bg-[#092032]/80 border-[#163650] hover:border-amber-500/40'
                  : 'bg-white border-slate-200 hover:border-amber-300'
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-[#b45309] flex items-center justify-center text-[#f59e0b] shrink-0 shadow-md">
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
                <span className={`text-xs sm:text-sm font-medium ${isEmerald ? 'text-slate-400' : isPurple ? 'text-purple-200/80' : isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Empréstimos ativos
                </span>
              </div>
            </div>

            {/* 4. Total de empréstimos (Verde Esmeralda Petróleo #059669 com ícone menta na imagem 34.jpg) */}
            <div
              className={`backdrop-blur-sm border rounded-2xl p-4 sm:p-5 flex items-center gap-4 transition-colors shadow-sm ${
                isEmerald
                  ? 'bg-[#052924] border-[#0d4f43] hover:border-[#059669]/50'
                  : isPurple
                  ? 'bg-[#240f47] border-[#3e196e] hover:border-[#a855f7]/50'
                  : isKinetic
                  ? 'bg-[#1a1c1e] border-[#2a313a] hover:border-[#0088cc]/50'
                  : isDark
                  ? 'bg-[#092032]/80 border-[#163650] hover:border-emerald-500/40'
                  : 'bg-white border-slate-200 hover:border-emerald-300'
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-[#059669] flex items-center justify-center text-[#34d399] shrink-0 shadow-md">
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
                <span className={`text-xs sm:text-sm font-medium ${isEmerald ? 'text-slate-400' : isPurple ? 'text-purple-200/80' : isDark ? 'text-slate-400' : 'text-slate-500'}`}>
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
                  isEmerald
                    ? 'text-[#00e676] hover:text-emerald-300'
                    : isPurple
                    ? 'text-[#c084fc] hover:text-white'
                    : isDark
                    ? 'text-[#1dbb64] hover:text-emerald-300'
                    : 'text-emerald-600 hover:text-emerald-700'
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
                    isEmerald
                      ? 'bg-[#062438] border-[#0c4061] hover:border-[#00e676] hover:shadow-[0_12px_25px_rgba(0,0,0,0.5),0_0_15px_rgba(0,230,118,0.25)]'
                      : isPurple
                      ? 'bg-[#250f4f] border-[#3e196e] hover:border-[#a855f7] hover:shadow-[0_12px_25px_rgba(0,0,0,0.5),0_0_15px_rgba(168,85,247,0.3)]'
                      : isDark
                      ? 'bg-[#092032] border-[#163650] hover:border-[#1dbb64] hover:shadow-[0_12px_25px_rgba(0,0,0,0.5),0_0_15px_rgba(29,187,100,0.2)]'
                      : 'bg-white border-slate-200 hover:border-[#23c65e] hover:shadow-lg shadow-sm'
                  }`}
                >
                  {/* Book Cover */}
                  <div
                    className={`relative aspect-[3/4] w-full rounded-xl overflow-hidden mb-3 border ${
                      isEmerald
                        ? 'bg-[#021827] border-[#0c4061]/60'
                        : isPurple
                        ? 'bg-[#15072b] border-[#3e196e]/60'
                        : isDark
                        ? 'bg-[#031320] border-[#1e3a5f]/50'
                        : 'bg-slate-100 border-slate-200'
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
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md backdrop-blur-sm shadow-sm ${
                        isEmerald ? 'bg-[#00e676] text-slate-950 font-bold' : isPurple ? 'bg-[#9333ea] text-white' : 'bg-[#23c65e] text-white'
                      }`}>
                        Disponível
                      </span>
                    </div>
                  </div>

                  {/* Book Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3
                        className={`text-sm font-bold transition-colors line-clamp-1 ${
                          isEmerald
                            ? 'text-white group-hover:text-[#00e676]'
                            : isPurple
                            ? 'text-white group-hover:text-[#c084fc]'
                            : isDark
                            ? 'text-white group-hover:text-[#1dbb64]'
                            : 'text-slate-900 group-hover:text-[#23c65e]'
                        }`}
                      >
                        {book.title}
                      </h3>
                      <p className={`text-xs line-clamp-1 mb-2 ${isEmerald ? 'text-slate-400' : isPurple ? 'text-purple-200/70' : isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {book.author}
                      </p>
                    </div>

                    <div
                      className={`flex items-center justify-between pt-2 border-t ${
                        isEmerald ? 'border-[#0c4061]/60' : isPurple ? 'border-[#3e196e]/60' : isDark ? 'border-[#163650]/60' : 'border-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-1 text-amber-400 text-xs font-semibold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{book.rating}</span>
                      </div>
                      <span
                        className={`text-[11px] font-medium group-hover:underline ${
                          isPurple ? 'text-[#c084fc]' : isDark ? 'text-emerald-400' : 'text-emerald-600'
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


