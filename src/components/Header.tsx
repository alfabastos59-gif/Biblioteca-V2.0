import React from 'react';
import {
  Menu,
  X,
  LayoutDashboard,
  FileText,
  Smartphone,
  ShieldCheck,
  User,
  Shield,
  LogOut,
  BookMarked,
  Lock,
  Sun,
  Moon,
  Trophy
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
  session,
  onOpenLogin,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const { theme, toggleTheme, isDark } = useTheme();

  const isStudent = session.role === 'student';
  const isAdmin = session.role === 'admin';

  const handleAdminClick = () => {
    if (isAdmin) {
      setActiveTab('admin');
    } else {
      onOpenLogin('admin', 'Painel Administrativo (ADM)');
    }
  };

  const handleReportsClick = () => {
    if (isAdmin) {
      setActiveTab('relatorios');
    } else {
      onOpenLogin('admin', 'Relatórios Administrativos');
    }
  };

  const handleStudentHistoryClick = () => {
    if (isStudent) {
      setActiveTab('meu_historico');
    } else {
      onOpenLogin('student', 'Meu Histórico de Empréstimos');
    }
  };

  return (
    <header
      className={`sticky top-0 z-40 backdrop-blur-md transition-colors duration-200 border-b ${
        isDark
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
              isDark
                ? 'bg-[#092032]/80 border-[#163650]'
                : 'bg-slate-100 border-slate-200'
            }`}
          >
            <button
              id="nav-inicio"
              onClick={() => setActiveTab('inicio')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer ${
                activeTab === 'inicio'
                  ? isDark
                    ? 'bg-[#1dbb64] text-slate-950 font-bold shadow-[0_0_12px_rgba(29,187,100,0.4)]'
                    : 'bg-[#23c65e] text-white font-bold shadow-sm'
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
                  ? isDark
                    ? 'bg-[#1dbb64] text-slate-950 font-bold shadow-[0_0_12px_rgba(29,187,100,0.4)]'
                    : 'bg-[#23c65e] text-white font-bold shadow-sm'
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
                  ? isDark
                    ? 'bg-[#1dbb64] text-slate-950 font-bold shadow-[0_0_12px_rgba(29,187,100,0.4)]'
                    : 'bg-[#23c65e] text-white font-bold shadow-sm'
                  : isDark
                  ? 'text-slate-300 hover:text-white hover:bg-[#133e4a]/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/80'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Ranking</span>
            </button>

            {/* If logged in as student, show "Meu Histórico" */}
            {isStudent && (
              <button
                id="nav-meu-historico"
                onClick={() => setActiveTab('meu_historico')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'meu_historico'
                    ? isDark
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(29,187,100,0.4)]'
                      : 'bg-[#23c65e] text-white font-bold shadow-sm'
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
                  ? isDark
                    ? 'bg-[#1dbb64] text-slate-950 font-bold shadow-[0_0_12px_rgba(29,187,100,0.4)]'
                    : 'bg-[#23c65e] text-white font-bold shadow-sm'
                  : isDark
                  ? 'text-slate-300 hover:text-white hover:bg-[#133e4a]/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/80'
              }`}
            >
              Sugestões
            </button>
            <button
              id="nav-sobre"
              onClick={() => setActiveTab('sobre')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer ${
                activeTab === 'sobre'
                  ? isDark
                    ? 'bg-[#1dbb64] text-slate-950 font-bold shadow-[0_0_12px_rgba(29,187,100,0.4)]'
                    : 'bg-[#23c65e] text-white font-bold shadow-sm'
                  : isDark
                  ? 'text-slate-300 hover:text-white hover:bg-[#133e4a]/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/80'
              }`}
            >
              Sobre
            </button>
          </nav>

          {/* Quick View Switches, Theme Toggle & User Session */}
          <div className="hidden lg:flex items-center gap-2.5">
            {/* View Switcher Pills */}
            <div
              className={`flex items-center p-1 rounded-xl border ${
                isDark
                  ? 'bg-[#071828] border-[#163650]'
                  : 'bg-slate-100 border-slate-200'
              }`}
            >
              <button
                id="btn-switch-admin"
                onClick={handleAdminClick}
                title={isAdmin ? 'Painel Administrativo' : 'Acesso Restrito ao Administrador'}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'admin'
                    ? isDark
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm font-bold'
                      : 'bg-amber-100 text-amber-900 border border-amber-300 shadow-sm font-bold'
                    : isDark
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {isAdmin ? <LayoutDashboard className="w-3.5 h-3.5 text-amber-500" /> : <Lock className="w-3.5 h-3.5 text-amber-500" />}
                <span>Admin</span>
              </button>

              <button
                id="btn-switch-relatorios"
                onClick={handleReportsClick}
                title={isAdmin ? 'Relatórios Gerais da Biblioteca' : 'Acesso Restrito ao Administrador'}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'relatorios'
                    ? isDark
                      ? 'bg-[#133e4a] text-emerald-400 border border-emerald-500/40 shadow-sm font-bold'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-sm font-bold'
                    : isDark
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Relatórios</span>
              </button>

              <button
                id="btn-switch-mobile"
                onClick={() => setActiveTab('mobile_view')}
                title="Abrir Simulador Mobile"
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'mobile_view'
                    ? isDark
                      ? 'bg-[#133e4a] text-emerald-400 border border-emerald-500/40 shadow-sm'
                      : 'bg-blue-100 text-blue-800 border border-blue-300 shadow-sm font-bold'
                    : isDark
                    ? 'text-slate-400 hover:text-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile</span>
              </button>
            </div>

            {/* THEME TOGGLE SWITCH (DARK / LIGHT AS REQUESTED) */}
            <button
              id="btn-toggle-theme"
              onClick={toggleTheme}
              title={isDark ? 'Mudar para Tema Claro (Imagem)' : 'Mudar para Tema Escuro (Atual)'}
              className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 text-xs font-medium transition-all cursor-pointer ${
                isDark
                  ? 'bg-[#092032] hover:bg-[#133e4a] text-amber-300 border-[#163650]'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300 shadow-sm'
              }`}
            >
              {isDark ? (
                <>
                  <Moon className="w-4 h-4 text-emerald-400" />
                  <span className="hidden xl:inline text-[11px] font-semibold text-slate-300">Tema Escuro</span>
                </>
              ) : (
                <>
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span className="hidden xl:inline text-[11px] font-semibold text-slate-700">Tema Claro</span>
                </>
              )}
            </button>

            {/* Design System Guide */}
            <button
              id="btn-design-system"
              onClick={onOpenDesignSystem}
              title="Guia Visual / Padrão de Design"
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isDark
                  ? 'bg-[#092032] hover:bg-[#133e4a] text-slate-300 hover:text-emerald-400 border-[#163650]'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-emerald-600 border-slate-200'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
            </button>

            {/* User Session Profile / Login Trigger */}
            {isAdmin ? (
              <div className="flex items-center gap-2 pl-1">
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold ${
                    isDark
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                      : 'bg-amber-100 border-amber-300 text-amber-900'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5 text-amber-500" />
                  <span>ADM Ativo</span>
                </div>
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
            className={`flex items-center justify-between p-2.5 rounded-xl border ${
              isDark ? 'bg-[#001424] border-[#163650]' : 'bg-white border-slate-200'
            }`}
          >
            <span className={`text-xs font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Tema Atual: <strong className="text-emerald-500">{isDark ? 'Escuro (Deep Navy)' : 'Claro (Moderno Escola)'}</strong>
            </span>
            <button
              onClick={toggleTheme}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 border ${
                isDark
                  ? 'bg-[#092032] text-amber-300 border-[#163650]'
                  : 'bg-slate-100 text-slate-900 border-slate-300'
              }`}
            >
              {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-blue-500" />}
              <span>Alternar Tema</span>
            </button>
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
          </div>

          <div className={`border-t pt-3 flex flex-col gap-2 ${isDark ? 'border-[#163650]' : 'border-slate-200'}`}>
            <button
              onClick={() => {
                handleAdminClick();
                setMobileMenuOpen(false);
              }}
              className={`flex items-center gap-2 p-2.5 rounded-xl text-sm font-medium ${
                isDark ? 'bg-[#092032] text-amber-300' : 'bg-amber-50 text-amber-900 border border-amber-200'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-amber-500" />
              <span>Painel Administrativo {isAdmin ? '(Liberado)' : '(Requer Senha)'}</span>
            </button>
            <button
              onClick={() => {
                handleReportsClick();
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
        </div>
      )}
    </header>
  );
};

