import React from 'react';
import {
  Menu,
  X,
  LayoutDashboard,
  FileText,
  Smartphone,
  User,
  Shield,
  LogOut,
  BookMarked,
  Sun,
  Moon,
  Trophy,
  Palette,
  Sparkles,
  Cat,
  BookPlus,
  Camera
} from 'lucide-react';
import { ActiveTab, UserSession } from '../types';
import { Logo } from './Logo';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenDesignSystem: () => void;
  onOpenNewLoan?: () => void;
  onOpenNewSuggestion?: () => void;
  onOpenRegisterBook?: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  session: UserSession;
  onOpenLogin: (mode?: 'student' | 'admin', featureName?: string) => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenDesignSystem,
  onOpenRegisterBook,
  session,
  onOpenLogin,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const { toggleTheme, setTheme, isDark, isKinetic, isClassicDark, isLight } = useTheme();

  const isStudent = session.role === 'student';
  const isAdmin = session.role === 'admin';

  return (
    <header
      className={`sticky top-0 z-40 backdrop-blur-md transition-colors duration-200 border-b ${
        isKinetic
          ? 'bg-[#0c1014]/95 border-[#2a313a] text-slate-100'
          : isDark
          ? 'bg-[#001424]/95 border-[#163650] text-slate-100'
          : 'bg-white/95 border-slate-200 text-slate-900 shadow-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo */}
          <div
            id="brand-logo"
            onClick={() => setActiveTab('inicio')}
            className="cursor-pointer group select-none flex items-center gap-3"
          >
            <Logo size="md" />
          </div>

          {/* Desktop Navigation Links */}
          <nav
            className={`hidden md:flex items-center gap-1 p-1.5 rounded-full border transition-colors ${
              isKinetic
                ? 'bg-[#1a1c1e] border-[#2a313a]'
                : isDark
                ? 'bg-[#092032]/80 border-[#163650]'
                : 'bg-slate-100 border-slate-200'
            }`}
          >
            <button
              id="nav-inicio"
              onClick={() => setActiveTab('inicio')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer ${
                activeTab === 'inicio'
                  ? isKinetic
                    ? 'bg-[#0088cc] text-white font-bold shadow-[0_0_12px_rgba(0,136,204,0.4)]'
                    : isDark
                    ? 'bg-[#1dbb64] text-slate-950 font-bold shadow-[0_0_12px_rgba(29,187,100,0.4)]'
                    : 'bg-[#23c65e] text-white font-bold shadow-sm'
                  : isKinetic
                  ? 'text-slate-300 hover:text-white hover:bg-[#2a313a]'
                  : isDark
                  ? 'text-slate-300 hover:text-white hover:bg-[#133e4a]/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/80'
              }`}
            >
              Início
            </button>
            <button
              id="nav-catalogo"
              onClick={() => setActiveTab('catalogo')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer ${
                activeTab === 'catalogo'
                  ? isKinetic
                    ? 'bg-[#0088cc] text-white font-bold shadow-[0_0_12px_rgba(0,136,204,0.4)]'
                    : isDark
                    ? 'bg-[#1dbb64] text-slate-950 font-bold shadow-[0_0_12px_rgba(29,187,100,0.4)]'
                    : 'bg-[#23c65e] text-white font-bold shadow-sm'
                  : isKinetic
                  ? 'text-slate-300 hover:text-white hover:bg-[#2a313a]'
                  : isDark
                  ? 'text-slate-300 hover:text-white hover:bg-[#133e4a]/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/80'
              }`}
            >
              Catálogo
            </button>
            <button
              id="nav-ranking"
              onClick={() => setActiveTab('ranking')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'ranking'
                  ? isKinetic
                    ? 'bg-[#0088cc] text-white font-bold shadow-[0_0_12px_rgba(0,136,204,0.4)]'
                    : isDark
                    ? 'bg-[#1dbb64] text-slate-950 font-bold shadow-[0_0_12px_rgba(29,187,100,0.4)]'
                    : 'bg-[#23c65e] text-white font-bold shadow-sm'
                  : isKinetic
                  ? 'text-slate-300 hover:text-white hover:bg-[#2a313a]'
                  : isDark
                  ? 'text-slate-300 hover:text-white hover:bg-[#133e4a]/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/80'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Ranking</span>
            </button>

            {/* MISSÃO QUITÉRIO (Quiz Game Mascot Tab) */}
            <button
              id="nav-missao-quiterio"
              onClick={() => setActiveTab('missao_quiterio')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'missao_quiterio'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-[0_0_15px_rgba(245,158,11,0.5)] scale-105'
                  : isKinetic
                  ? 'text-amber-400 hover:text-amber-300 hover:bg-[#2a313a]'
                  : isDark
                  ? 'text-amber-400 hover:text-amber-300 hover:bg-amber-400/10'
                  : 'text-amber-700 hover:text-amber-800 hover:bg-amber-100/80 font-semibold'
              }`}
            >
              <Cat className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              <span>Missão Quitério</span>
            </button>

            {/* If logged in as student, show "Meu Histórico" */}
            {isStudent && (
              <button
                id="nav-meu-historico"
                onClick={() => setActiveTab('meu_historico')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'meu_historico'
                    ? isKinetic
                      ? 'bg-[#00a651] text-white font-bold shadow-[0_0_12px_rgba(0,166,81,0.4)]'
                      : isDark
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(29,187,100,0.4)]'
                      : 'bg-[#23c65e] text-white font-bold shadow-sm'
                    : isKinetic
                    ? 'text-[#00a651] hover:text-[#00a651]/80 hover:bg-[#2a313a]'
                    : isDark
                    ? 'text-emerald-400 hover:text-emerald-300 hover:bg-[#133e4a]/60'
                    : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                <BookMarked className="w-3.5 h-3.5" />
                <span>Meu Histórico</span>
              </button>
            )}

            <button
              id="nav-sugestoes"
              onClick={() => setActiveTab('sugestoes')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer ${
                activeTab === 'sugestoes'
                  ? isKinetic
                    ? 'bg-[#0088cc] text-white font-bold shadow-[0_0_12px_rgba(0,136,204,0.4)]'
                    : isDark
                    ? 'bg-[#1dbb64] text-slate-950 font-bold shadow-[0_0_12px_rgba(29,187,100,0.4)]'
                    : 'bg-[#23c65e] text-white font-bold shadow-sm'
                  : isKinetic
                  ? 'text-slate-300 hover:text-white hover:bg-[#2a313a]'
                  : isDark
                  ? 'text-slate-300 hover:text-white hover:bg-[#133e4a]/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/80'
              }`}
            >
              Sugestões
            </button>

            {/* BOTÃO CADASTRO DE LIVROS (Com Câmera no Smartphone) */}
            <button
              id="nav-cadastro-livros"
              onClick={onOpenRegisterBook}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                isKinetic
                  ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/40'
                  : isDark
                  ? 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-300'
              }`}
            >
              <Camera className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
              <span>Cadastro de Livros</span>
            </button>

            <button
              id="nav-sobre"
              onClick={() => setActiveTab('sobre')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer ${
                activeTab === 'sobre'
                  ? isKinetic
                    ? 'bg-[#0088cc] text-white font-bold shadow-[0_0_12px_rgba(0,136,204,0.4)]'
                    : isDark
                    ? 'bg-[#1dbb64] text-slate-950 font-bold shadow-[0_0_12px_rgba(29,187,100,0.4)]'
                    : 'bg-[#23c65e] text-white font-bold shadow-sm'
                  : isKinetic
                  ? 'text-slate-300 hover:text-white hover:bg-[#2a313a]'
                  : isDark
                  ? 'text-slate-300 hover:text-white hover:bg-[#133e4a]/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/80'
              }`}
            >
              Sobre
            </button>
          </nav>

          {/* Theme Toggle & User Session */}
          <div className="hidden lg:flex items-center gap-2.5">
            {/* THEME TOGGLE SWITCH (DARK / LIGHT / KINETIC) */}
            <button
              id="btn-toggle-theme"
              onClick={toggleTheme}
              title={`Tema atual: ${
                isKinetic ? 'Kinetic' : isClassicDark ? 'Escuro' : 'Claro'
              }. Clique para alternar (Escuro → Claro → Kinetic)`}
              className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 text-xs font-medium transition-all cursor-pointer ${
                isKinetic
                  ? 'bg-[#1a1c1e] hover:bg-[#2a313a] text-[#0088cc] border-[#2a313a] shadow-sm'
                  : isClassicDark
                  ? 'bg-[#092032] hover:bg-[#133e4a] text-amber-300 border-[#163650]'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300 shadow-sm'
              }`}
            >
              {isKinetic ? (
                <>
                  <Palette className="w-4 h-4 text-[#0088cc]" />
                  <span className="hidden xl:inline text-[11px] font-semibold text-slate-200">Kinetic</span>
                </>
              ) : isClassicDark ? (
                <>
                  <Moon className="w-4 h-4 text-emerald-400" />
                  <span className="hidden xl:inline text-[11px] font-semibold text-slate-300">Escuro</span>
                </>
              ) : (
                <>
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span className="hidden xl:inline text-[11px] font-semibold text-slate-700">Claro</span>
                </>
              )}
            </button>

            {/* User Session Profile / Login Trigger */}
            {isAdmin ? (
              <div className="flex items-center gap-2 pl-1">
                <button
                  id="btn-header-go-admin"
                  onClick={() => setActiveTab('admin')}
                  title="Abrir Painel Administrativo"
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'admin'
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                      : isDark
                      ? 'bg-amber-500/15 hover:bg-amber-500/25 border-amber-500/40 text-amber-300'
                      : 'bg-amber-100 hover:bg-amber-200 border-amber-300 text-amber-900'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5 text-amber-500" />
                  <span>Painel ADM</span>
                </button>
                <button
                  onClick={onLogout}
                  title="Sair do Modo Administrador"
                  className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                    isDark
                      ? 'bg-[#092032] hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border-[#163650]'
                      : 'bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-600 border-slate-200'
                  }`}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : isStudent && session.student ? (
              <div className="flex items-center gap-2 pl-1">
                <button
                  onClick={() => setActiveTab('meu_historico')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                    isDark
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                  }`}
                >
                  <img
                    src={session.student.avatar}
                    alt={session.student.name}
                    className="w-5 h-5 rounded-full object-cover border border-emerald-400"
                  />
                  <span className="max-w-[100px] truncate">{session.student.name.split(' ')[0]}</span>
                  <span className={`font-mono text-[10px] ${isDark ? 'text-emerald-400/80' : 'text-emerald-700'}`}>
                    ({(session.student.studentCode || '').replace(/^ALU-/, '')})
                  </span>
                </button>
                <button
                  onClick={onLogout}
                  title="Sair da Conta do Aluno"
                  className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                    isDark
                      ? 'bg-[#092032] hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border-[#163650]'
                      : 'bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-600 border-slate-200'
                  }`}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                id="btn-acessar-header"
                onClick={() => onOpenLogin('student')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  isDark
                    ? 'bg-[#1dbb64] hover:bg-[#16a354] text-slate-950 shadow-[0_0_15px_rgba(29,187,100,0.3)] hover:shadow-[0_0_20px_rgba(29,187,100,0.5)]'
                    : 'bg-[#23c65e] hover:bg-[#1fa950] text-white shadow-sm'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Entrar / Acessar</span>
              </button>
            )}
          </div>

          {/* Mobile menu trigger + theme toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              aria-label="Alternar Tema"
              className={`p-2 rounded-lg border ${
                isDark
                  ? 'bg-[#092032] text-amber-300 border-[#163650]'
                  : 'bg-slate-100 text-amber-600 border-slate-300'
              }`}
            >
              {isDark ? <Moon className="w-4 h-4 text-emerald-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
            </button>

            {isStudent && session.student && (
              <img
                src={session.student.avatar}
                alt={session.student.name}
                className="w-7 h-7 rounded-full border border-emerald-400 object-cover"
                onClick={() => setActiveTab('meu_historico')}
              />
            )}
            <button
              id="btn-mobile-menu"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-lg border ${
                isDark
                  ? 'bg-[#092032] text-slate-300 hover:text-white border-[#163650]'
                  : 'bg-slate-100 text-slate-700 hover:text-slate-900 border-slate-300'
              }`}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          className={`md:hidden border-b px-4 pt-3 pb-5 space-y-2 animate-in slide-in-from-top duration-200 ${
            isDark ? 'bg-[#071828] border-[#163650]' : 'bg-slate-50 border-slate-200'
          }`}
        >
          {/* User Session Bar in Mobile */}
          <div
            className={`p-3 rounded-xl border flex items-center justify-between mb-2 ${
              isDark ? 'bg-[#001424] border-[#163650]' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            {isAdmin ? (
              <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold">
                <Shield className="w-4 h-4 text-amber-500" />
                <span>Administrador Conectado</span>
              </div>
            ) : isStudent && session.student ? (
              <div className="flex items-center gap-2 text-xs">
                <img src={session.student.avatar} alt={session.student.name} className="w-6 h-6 rounded-full" />
                <div>
                  <div className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{session.student.name}</div>
                  <div className="text-[10px] text-emerald-500 font-mono">
                    Cód: {(session.student.studentCode || '').replace(/^ALU-/, '')}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400">
                Nenhum usuário identificado
              </div>
            )}

            {session.role !== 'guest' ? (
              <button
                onClick={() => {
                  onLogout();
                  setMobileMenuOpen(false);
                }}
                className="text-xs text-rose-400 font-bold px-2.5 py-1 rounded bg-rose-500/10 border border-rose-500/20"
              >
                Sair
              </button>
            ) : (
              <button
                onClick={() => {
                  onOpenLogin('student');
                  setMobileMenuOpen(false);
                }}
                className="text-xs font-bold px-3 py-1 rounded-lg bg-emerald-500 text-white"
              >
                Entrar
              </button>
            )}
          </div>

          {/* Theme Quick Selector in Mobile */}
          <div
            className={`p-3 rounded-2xl border ${
              isKinetic
                ? 'bg-[#1a1c1e] border-[#2a313a]'
                : isDark
                ? 'bg-[#001424] border-[#163650]'
                : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Tema Visual
              </span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                isKinetic
                  ? 'bg-[#0088cc]/20 text-[#0088cc]'
                  : isClassicDark
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {isKinetic ? 'Kinetic' : isClassicDark ? 'Escuro' : 'Claro'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => setTheme('dark')}
                className={`py-1.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 border transition-all cursor-pointer ${
                  isClassicDark
                    ? 'bg-[#092032] text-emerald-400 border-emerald-500/40 shadow-sm'
                    : isDark
                    ? 'bg-[#0c141c] text-slate-400 border-[#1e3a5f]/40 hover:text-slate-200'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:text-slate-900'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>Escuro</span>
              </button>

              <button
                onClick={() => setTheme('light')}
                className={`py-1.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 border transition-all cursor-pointer ${
                  isLight
                    ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-sm'
                    : isDark
                    ? 'bg-[#0c141c] text-slate-400 border-[#1e3a5f]/40 hover:text-slate-200'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:text-slate-900'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Claro</span>
              </button>

              <button
                onClick={() => setTheme('kinetic')}
                className={`py-1.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 border transition-all cursor-pointer ${
                  isKinetic
                    ? 'bg-[#0088cc]/20 text-[#0088cc] border-[#0088cc]/50 shadow-sm'
                    : isDark
                    ? 'bg-[#0c141c] text-slate-400 border-[#1e3a5f]/40 hover:text-slate-200'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:text-slate-900'
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                <span>Kinetic</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3">
            <button
              onClick={() => {
                setActiveTab('inicio');
                setMobileMenuOpen(false);
              }}
              className={`p-2.5 rounded-xl text-sm font-medium text-left ${
                activeTab === 'inicio'
                  ? 'bg-[#23c65e] text-white font-bold'
                  : isDark
                  ? 'bg-[#092032] text-slate-200'
                  : 'bg-white border border-slate-200 text-slate-800'
              }`}
            >
              Início
            </button>
            <button
              onClick={() => {
                setActiveTab('catalogo');
                setMobileMenuOpen(false);
              }}
              className={`p-2.5 rounded-xl text-sm font-medium text-left ${
                activeTab === 'catalogo'
                  ? 'bg-[#23c65e] text-white font-bold'
                  : isDark
                  ? 'bg-[#092032] text-slate-200'
                  : 'bg-white border border-slate-200 text-slate-800'
              }`}
            >
              Catálogo
            </button>
            <button
              onClick={() => {
                setActiveTab('ranking');
                setMobileMenuOpen(false);
              }}
              className={`p-2.5 rounded-xl text-sm font-medium text-left flex items-center gap-1.5 ${
                activeTab === 'ranking'
                  ? 'bg-[#23c65e] text-white font-bold'
                  : isDark
                  ? 'bg-[#092032] text-slate-200'
                  : 'bg-white border border-slate-200 text-slate-800'
              }`}
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Ranking</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('missao_quiterio');
                setMobileMenuOpen(false);
              }}
              className={`p-2.5 rounded-xl text-sm font-medium text-left flex items-center justify-between ${
                activeTab === 'missao_quiterio'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : isDark
                  ? 'bg-[#092032] text-amber-400'
                  : 'bg-amber-50 border border-amber-200 text-amber-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <Cat className="w-4 h-4 text-amber-500" />
                <span>Missão Quitério</span>
              </div>
            </button>
            {isStudent && (
              <button
                onClick={() => {
                  setActiveTab('meu_historico');
                  setMobileMenuOpen(false);
                }}
                className={`p-2.5 rounded-xl text-sm font-medium text-left flex items-center gap-2 ${
                  activeTab === 'meu_historico'
                    ? 'bg-[#23c65e] text-white font-bold'
                    : isDark
                    ? 'bg-[#092032] text-emerald-400'
                    : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                }`}
              >
                <BookMarked className="w-4 h-4" />
                <span>Meu Histórico</span>
              </button>
            )}
            <button
              onClick={() => {
                setActiveTab('sugestoes');
                setMobileMenuOpen(false);
              }}
              className={`p-2.5 rounded-xl text-sm font-medium text-left ${
                activeTab === 'sugestoes'
                  ? 'bg-[#23c65e] text-white font-bold'
                  : isDark
                  ? 'bg-[#092032] text-slate-200'
                  : 'bg-white border border-slate-200 text-slate-800'
              }`}
            >
              Sugestões
            </button>
            <button
              onClick={() => {
                onOpenRegisterBook?.();
                setMobileMenuOpen(false);
              }}
              className={`p-2.5 rounded-xl text-sm font-medium text-left flex items-center gap-2 ${
                isDark
                  ? 'bg-[#092032] text-emerald-400 border border-emerald-500/30'
                  : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              }`}
            >
              <Camera className="w-4 h-4 text-emerald-400" />
              <span>Cadastro de Livros</span>
            </button>
          </div>

          {isAdmin && (
            <div className={`border-t pt-3 flex flex-col gap-2 ${isDark ? 'border-[#163650]' : 'border-slate-200'}`}>
              <button
                onClick={() => {
                  setActiveTab('admin');
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center gap-2 p-2.5 rounded-xl text-sm font-medium ${
                  isDark ? 'bg-[#092032] text-amber-300' : 'bg-amber-50 text-amber-900 border border-amber-200'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-amber-500" />
                <span>Painel Administrativo</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('relatorios');
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center gap-2 p-2.5 rounded-xl text-sm font-medium ${
                  isDark ? 'bg-[#092032] text-emerald-400' : 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                }`}
              >
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>Relatórios Estatísticos</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('mobile_view');
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center gap-2 p-2.5 rounded-xl text-sm font-medium ${
                  isDark ? 'bg-[#092032] text-blue-400' : 'bg-blue-50 text-blue-900 border border-blue-200'
                }`}
              >
                <Smartphone className="w-4 h-4 text-blue-600" />
                <span>Simulador Mobile</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

