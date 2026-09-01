import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { BookCatalog } from './components/BookCatalog';
import { BookDetailModal } from './components/BookDetailModal';
import { AdminDashboard } from './components/AdminDashboard';
import { ReportsView } from './components/ReportsView';
import { MobileSimulator } from './components/MobileSimulator';
import { LoansView } from './components/LoansView';
import { SuggestionsView } from './components/SuggestionsView';
import { AboutView } from './components/AboutView';
import { DesignSystemModal } from './components/DesignSystemModal';
import { LoanModal } from './components/LoanModal';
import { ManageBooksModal } from './components/ManageBooksModal';
import { AuthModal } from './components/AuthModal';
import { StudentPortalView } from './components/StudentPortalView';
import { RankingView } from './components/RankingView';
import { Footer } from './components/Footer';

import {
  INITIAL_BOOKS,
  INITIAL_LOANS,
  INITIAL_STUDENTS,
  INITIAL_SUGGESTIONS,
  INITIAL_ADMIN_USERS,
  INITIAL_AUDIT_LOGS,
} from './data/mockData';
import { Book, Loan, Student, Suggestion, ActiveTab, UserSession, AdminUser, AuditLog, AuditActionCategory } from './types';
import { useTheme } from './context/ThemeContext';

export default function App() {
  const { isDark } = useTheme();
  const DB_VERSION = 'bmq_db_v9_25_avatars';

  const [books, setBooks] = useState<Book[]>(() => {
    const version = localStorage.getItem('bmq_db_version');
    if (version !== DB_VERSION) {
      localStorage.setItem('bmq_db_version', DB_VERSION);
      localStorage.setItem('bmq_books', JSON.stringify(INITIAL_BOOKS));
      localStorage.setItem('bmq_loans', JSON.stringify(INITIAL_LOANS));
      localStorage.setItem('bmq_students', JSON.stringify(INITIAL_STUDENTS));
      localStorage.setItem('bmq_suggestions', JSON.stringify(INITIAL_SUGGESTIONS));
      localStorage.setItem('bmq_admin_users', JSON.stringify(INITIAL_ADMIN_USERS));
      localStorage.setItem('bmq_audit_logs', JSON.stringify(INITIAL_AUDIT_LOGS));
      return INITIAL_BOOKS;
    }
    const saved = localStorage.getItem('bmq_books');
    return saved ? JSON.parse(saved) : INITIAL_BOOKS;
  });

  const [loans, setLoans] = useState<Loan[]>(() => {
    const version = localStorage.getItem('bmq_db_version');
    if (version !== DB_VERSION) return INITIAL_LOANS;
    const saved = localStorage.getItem('bmq_loans');
    if (!saved) return INITIAL_LOANS;
    const parsed: Loan[] = JSON.parse(saved);
    return parsed.map((l) => ({
      ...l,
      studentCode: l.studentCode ? l.studentCode.replace(/^ALU-/, '') : undefined,
    }));
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const version = localStorage.getItem('bmq_db_version');
    if (version !== DB_VERSION) return INITIAL_STUDENTS;
    const saved = localStorage.getItem('bmq_students');
    if (!saved) return INITIAL_STUDENTS;
    const parsed: Student[] = JSON.parse(saved);
    return parsed.map((s) => ({
      ...s,
      studentCode: s.studentCode ? s.studentCode.replace(/^ALU-/, '') : s.studentCode,
    }));
  });

  const [suggestions, setSuggestions] = useState<Suggestion[]>(() => {
    const version = localStorage.getItem('bmq_db_version');
    if (version !== DB_VERSION) return INITIAL_SUGGESTIONS;
    const saved = localStorage.getItem('bmq_suggestions');
    return saved ? JSON.parse(saved) : INITIAL_SUGGESTIONS;
  });

  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(() => {
    const version = localStorage.getItem('bmq_db_version');
    if (version !== DB_VERSION) return INITIAL_ADMIN_USERS;
    const saved = localStorage.getItem('bmq_admin_users');
    return saved ? JSON.parse(saved) : INITIAL_ADMIN_USERS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const version = localStorage.getItem('bmq_db_version');
    if (version !== DB_VERSION) return INITIAL_AUDIT_LOGS;
    const saved = localStorage.getItem('bmq_audit_logs');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('bmq_favorites');
    return saved ? JSON.parse(saved) : [INITIAL_BOOKS[0]?.id || ''];
  });

  // User Security & Auth Session
  const [session, setSession] = useState<UserSession>(() => {
    const savedSession = localStorage.getItem('bmq_auth_session');
    if (savedSession) {
      try {
        return JSON.parse(savedSession);
      } catch (e) {
        return { role: 'guest' };
      }
    }
    return { role: 'guest' };
  });

  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'student' | 'admin'>('student');
  const [authTargetFeature, setAuthTargetFeature] = useState<string>('');

  // UI state
  const [activeTab, setActiveTab] = useState<ActiveTab>('inicio');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [isManageBooksOpen, setIsManageBooksOpen] = useState(false);
  const [isDesignSystemOpen, setIsDesignSystemOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Persist state to localStorage
  useEffect(() => {
    localStorage.setItem('bmq_books', JSON.stringify(books));
  }, [books]);

  useEffect(() => {
    localStorage.setItem('bmq_loans', JSON.stringify(loans));
  }, [loans]);

  useEffect(() => {
    localStorage.setItem('bmq_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('bmq_suggestions', JSON.stringify(suggestions));
  }, [suggestions]);

  useEffect(() => {
    localStorage.setItem('bmq_admin_users', JSON.stringify(adminUsers));
  }, [adminUsers]);

  useEffect(() => {
    localStorage.setItem('bmq_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('bmq_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('bmq_auth_session', JSON.stringify(session));
  }, [session]);

  // Centralized Audit Logger function
  const logAuditEvent = (
    actionCategory: AuditActionCategory,
    title: string,
    details: string,
    targetName?: string,
    customAdmin?: AdminUser
  ) => {
    const currentAdmin = customAdmin || session.admin || adminUsers[0] || INITIAL_ADMIN_USERS[0];
    const now = new Date();
    const dateStr = now.toLocaleDateString('pt-BR');
    const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const newLog: AuditLog = {
      id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: `${dateStr} às ${timeStr}`,
      adminId: currentAdmin.id,
      adminName: currentAdmin.name,
      adminAvatar: currentAdmin.avatar,
      adminRole: currentAdmin.roleLabel,
      actionCategory,
      title,
      details,
      targetName,
    };

    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Auth Triggers
  const handleOpenLogin = (mode: 'student' | 'admin' = 'student', featureName: string = '') => {
    setAuthModalMode(mode);
    setAuthTargetFeature(featureName);
    setIsAuthModalOpen(true);
  };

  const handleLoginSuccess = (newSession: UserSession) => {
    setSession(newSession);
    if (newSession.role === 'admin') {
      const activeAdm = newSession.admin || adminUsers[0] || INITIAL_ADMIN_USERS[0];
      const nowStr = new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      
      // Update lastLogin on AdminUser
      setAdminUsers((prev) =>
        prev.map((adm) => (adm.id === activeAdm.id ? { ...adm, lastLogin: nowStr } : adm))
      );

      logAuditEvent(
        'acesso',
        'Login Administrativo Realizado',
        `Acesso autenticado ao Painel Administrativo da Biblioteca Maria Quitéria por ${activeAdm.name}.`,
        activeAdm.name,
        activeAdm
      );

      setActiveTab('admin');
    } else if (newSession.role === 'student') {
      setActiveTab('meu_historico');
    }
  };

  const handleLogout = () => {
    if (session.role === 'admin' && session.admin) {
      logAuditEvent(
        'acesso',
        'Logout Administrativo',
        `Sessão administrativa encerrada por ${session.admin.name}.`,
        session.admin.name
      );
    }
    setSession({ role: 'guest' });
    setActiveTab('inicio');
  };

  // Safe Navigation Handler with Security Checks
  const handleNavigateTab = (tab: ActiveTab) => {
    if (tab === 'admin' || tab === 'relatorios') {
      if (session.role !== 'admin') {
        handleOpenLogin('admin', tab === 'admin' ? 'Painel Administrativo' : 'Relatórios');
        return;
      }
    }
    if (tab === 'meu_historico') {
      if (session.role !== 'student' || !session.student) {
        handleOpenLogin('student', 'Meu Histórico de Empréstimos');
        return;
      }
    }
    setActiveTab(tab);
  };

  // Book Selection & Loan Request
  const handleSelectBook = (book: Book) => {
    setSelectedBook(book);
  };

  const handleRequestLoan = (book: Book) => {
    setSelectedBook(book);
    setIsLoanModalOpen(true);
  };

  const handleConfirmLoan = (loanData: Omit<Loan, 'id'>) => {
    const newLoan: Loan = {
      ...loanData,
      id: `l_${Date.now()}`,
    };

    setLoans((prev) => [newLoan, ...prev]);

    // Decrement available copy
    setBooks((prev) =>
      prev.map((b) =>
        b.id === loanData.bookId
          ? {
              ...b,
              availableCopies: Math.max(0, b.availableCopies - 1),
              status: b.availableCopies - 1 <= 0 ? 'reservado' : b.status,
            }
          : b
      )
    );

    // Audit log
    logAuditEvent(
      'emprestimos',
      'Novo Empréstimo Registrado',
      `Empréstimo do livro "${loanData.bookTitle}" emitido para ${loanData.studentName} (${loanData.studentClass}). Devolução prevista para ${loanData.returnDate}.`,
      loanData.bookTitle
    );
  };

  const handleReturnLoan = (loanId: string) => {
    const targetLoan = loans.find((l) => l.id === loanId);
    if (!targetLoan) return;

    const todayStr = new Date().toLocaleDateString('pt-BR');

    setLoans((prev) =>
      prev.map((l) =>
        l.id === loanId
          ? { ...l, status: 'devolvido', actualReturnDate: todayStr }
          : l
      )
    );

    // Increment available copy
    setBooks((prev) =>
      prev.map((b) =>
        b.id === targetLoan.bookId
          ? {
              ...b,
              availableCopies: Math.min(b.totalCopies, b.availableCopies + 1),
              status: 'disponivel',
            }
          : b
      )
    );

    // Audit log
    logAuditEvent(
      'emprestimos',
      'Livro Devolvido ao Acervo',
      `Devolução do livro "${targetLoan.bookTitle}" concluída com sucesso. Aluno: ${targetLoan.studentName}.`,
      targetLoan.bookTitle
    );
  };

  const handleRenewLoan = (loanId: string) => {
    const targetLoan = loans.find((l) => l.id === loanId);
    let newDateStr = '';

    setLoans((prev) =>
      prev.map((l) => {
        if (l.id === loanId) {
          const [d, m, y] = l.returnDate.split('/').map(Number);
          const currentReturn = new Date(y, m - 1, d);
          currentReturn.setDate(currentReturn.getDate() + 7);
          newDateStr = currentReturn.toLocaleDateString('pt-BR');
          return { ...l, returnDate: newDateStr, status: 'em_andamento' };
        }
        return l;
      })
    );

    if (targetLoan) {
      logAuditEvent(
        'emprestimos',
        'Prazo de Empréstimo Renovado',
        `Prazo do livro "${targetLoan.bookTitle}" estendido em +7 dias para ${targetLoan.studentName} (novo vencimento: ${newDateStr}).`,
        targetLoan.bookTitle
      );
    }
  };

  const handleAddSuggestion = (
    newSug: Omit<Suggestion, 'id' | 'date' | 'status'>
  ) => {
    const item: Suggestion = {
      ...newSug,
      id: `sg_${Date.now()}`,
      date: new Date().toLocaleDateString('pt-BR'),
      status: 'pendente',
    };
    setSuggestions((prev) => [item, ...prev]);
  };

  const handleDeleteSuggestion = (suggestionId: string) => {
    if (session.role !== 'admin') {
      handleOpenLogin('admin', 'Excluir Sugestão');
      return;
    }
    const target = suggestions.find((s) => s.id === suggestionId);
    setSuggestions((prev) => prev.filter((s) => s.id !== suggestionId));

    logAuditEvent(
      'sugestoes',
      'Sugestão de Livro Excluída',
      `A sugestão "${target?.bookTitle || 'Sem título'}" indicada por ${target?.studentName || 'Estudante'} foi removida do painel.`,
      target?.bookTitle
    );
  };

  const handleUpdateSuggestionStatus = (
    suggestionId: string,
    status: 'aprovado' | 'recusado' | 'pendente'
  ) => {
    if (session.role !== 'admin') {
      handleOpenLogin('admin', 'Moderar Sugestão');
      return;
    }
    const target = suggestions.find((s) => s.id === suggestionId);
    setSuggestions((prev) =>
      prev.map((s) => (s.id === suggestionId ? { ...s, status } : s))
    );

    const statusText = status === 'aprovado' ? 'APROVADA para aquisição' : status === 'recusado' ? 'RECUSADA' : 'PENDENTE';
    logAuditEvent(
      'sugestoes',
      `Sugestão de Livro Moderada: ${status.toUpperCase()}`,
      `Sugestão "${target?.bookTitle}" marcada como ${statusText}. Indicado por: ${target?.studentName}.`,
      target?.bookTitle
    );
  };

  const handleToggleFavorite = (bookId: string) => {
    setFavorites((prev) =>
      prev.includes(bookId)
        ? prev.filter((id) => id !== bookId)
        : [...prev, bookId]
    );
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveTab('catalogo');
  };

  const handleSaveBook = (updatedBook: Book) => {
    if (session.role !== 'admin') {
      handleOpenLogin('admin', 'Alterar Livro');
      return;
    }
    setBooks((prev) =>
      prev.map((b) => (b.id === updatedBook.id ? updatedBook : b))
    );
    setLoans((prev) =>
      prev.map((l) =>
        l.bookId === updatedBook.id
          ? {
              ...l,
              bookTitle: updatedBook.title,
              bookAuthor: updatedBook.author,
              bookCover: updatedBook.cover,
            }
          : l
      )
    );
    if (selectedBook?.id === updatedBook.id) {
      setSelectedBook(updatedBook);
    }

    logAuditEvent(
      'livros',
      'Dados de Livro Atualizados',
      `Informações da obra "${updatedBook.title}" (Autor: ${updatedBook.author}, Exemplares: ${updatedBook.totalCopies}) foram editadas no acervo.`,
      updatedBook.title
    );
  };

  const handleCreateBook = (newBook: Book) => {
    if (session.role !== 'admin') {
      handleOpenLogin('admin', 'Cadastrar Novo Livro');
      return;
    }
    setBooks((prev) => [newBook, ...prev]);

    logAuditEvent(
      'livros',
      'Novo Livro Cadastrado no Acervo',
      `Obra "${newBook.title}" cadastrada com sucesso. Categoria: ${newBook.category}, Quantidade: ${newBook.totalCopies} exemplares.`,
      newBook.title
    );
  };

  const handleDeleteBook = (bookId: string) => {
    if (session.role !== 'admin') {
      handleOpenLogin('admin', 'Excluir Livro');
      return;
    }
    const targetBook = books.find((b) => b.id === bookId);
    setBooks((prev) => prev.filter((b) => b.id !== bookId));
    if (selectedBook?.id === bookId) {
      setSelectedBook(null);
    }

    logAuditEvent(
      'livros',
      'Livro Removido do Acervo',
      `A obra "${targetBook?.title || bookId}" foi permanentemente removida do catálogo da biblioteca.`,
      targetBook?.title
    );
  };

  const handleSaveStudent = (updatedStudent: Student) => {
    if (session.role !== 'admin') {
      handleOpenLogin('admin', 'Editar Cadastro de Aluno');
      return;
    }
    setStudents((prev) =>
      prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s))
    );
    setLoans((prev) =>
      prev.map((l) =>
        l.studentCode === updatedStudent.studentCode || l.studentName === updatedStudent.name
          ? {
              ...l,
              studentName: updatedStudent.name,
              studentAvatar: updatedStudent.avatar,
              studentClass: updatedStudent.class,
            }
          : l
      )
    );

    logAuditEvent(
      'alunos',
      'Cadastro de Aluno Atualizado',
      `Ficha cadastral do estudante ${updatedStudent.name} (Turma: ${updatedStudent.class}, Código: ${updatedStudent.studentCode}) foi atualizada.`,
      updatedStudent.name
    );
  };

  const handleCreateStudent = (newStudent: Student) => {
    if (session.role !== 'admin') {
      handleOpenLogin('admin', 'Cadastrar Aluno');
      return;
    }
    setStudents((prev) => [newStudent, ...prev]);

    logAuditEvent(
      'alunos',
      'Novo Aluno Cadastrado',
      `Estudante ${newStudent.name} registrado com sucesso na turma ${newStudent.class} com código ${newStudent.studentCode}.`,
      newStudent.name
    );
  };

  const handleDeleteStudent = (studentId: string) => {
    if (session.role !== 'admin') {
      handleOpenLogin('admin', 'Excluir Aluno');
      return;
    }
    const targetStudent = students.find((s) => s.id === studentId);
    setStudents((prev) => prev.filter((s) => s.id !== studentId));

    logAuditEvent(
      'alunos',
      'Cadastro de Aluno Excluído',
      `Registro do estudante ${targetStudent?.name || studentId} (${targetStudent?.class}) foi removido do sistema.`,
      targetStudent?.name
    );
  };

  // ADMIN USER CRUD HANDLERS
  const handleCreateAdminUser = (newAdmin: AdminUser) => {
    if (session.role !== 'admin') {
      handleOpenLogin('admin', 'Cadastrar Administrador');
      return;
    }
    setAdminUsers((prev) => [newAdmin, ...prev]);

    logAuditEvent(
      'usuarios_adm',
      'Novo Administrador Cadastrado',
      `Novo administrador ${newAdmin.name} (${newAdmin.roleLabel}) foi adicionado à equipe com acesso autorizado.`,
      newAdmin.name
    );
  };

  const handleSaveAdminUser = (updatedAdmin: AdminUser) => {
    if (session.role !== 'admin') {
      handleOpenLogin('admin', 'Editar Administrador');
      return;
    }
    setAdminUsers((prev) =>
      prev.map((a) => (a.id === updatedAdmin.id ? updatedAdmin : a))
    );

    // If current session is this admin, update session
    if (session.admin && session.admin.id === updatedAdmin.id) {
      setSession({
        ...session,
        admin: updatedAdmin,
      });
    }

    logAuditEvent(
      'usuarios_adm',
      'Perfil de Administrador Editado',
      `Privilégios e dados cadastrais de ${updatedAdmin.name} (${updatedAdmin.roleLabel}) foram modificados.`,
      updatedAdmin.name
    );
  };

  const handleDeleteAdminUser = (adminId: string) => {
    if (session.role !== 'admin') {
      handleOpenLogin('admin', 'Excluir Administrador');
      return;
    }
    const targetAdmin = adminUsers.find((a) => a.id === adminId);
    setAdminUsers((prev) => prev.filter((a) => a.id !== adminId));

    logAuditEvent(
      'usuarios_adm',
      'Administrador Excluído',
      `O usuário administrativo ${targetAdmin?.name || adminId} foi removido do sistema com revogação de acessos.`,
      targetAdmin?.name
    );
  };

  const handleToggleAdminStatus = (adminUser: AdminUser) => {
    if (session.role !== 'admin') {
      handleOpenLogin('admin', 'Alterar Status do Administrador');
      return;
    }
    const newStatus = adminUser.status === 'ativo' ? 'inativo' : 'ativo';
    const updated = { ...adminUser, status: newStatus as 'ativo' | 'inativo' };

    setAdminUsers((prev) =>
      prev.map((a) => (a.id === adminUser.id ? updated : a))
    );

    logAuditEvent(
      'usuarios_adm',
      `Status do Administrador Alterado para ${newStatus.toUpperCase()}`,
      `A conta de ${adminUser.name} (${adminUser.roleLabel}) foi ${newStatus === 'ativo' ? 'ativada' : 'desativada'}.`,
      adminUser.name
    );
  };

  const handleClearAuditLogs = () => {
    if (session.role !== 'admin') {
      handleOpenLogin('admin', 'Limpar Auditoria');
      return;
    }
    setAuditLogs([]);
    logAuditEvent(
      'sistema',
      'Histórico de Auditoria Limpo',
      'O registro histórico de auditoria foi reiniciado pelo administrador.',
      'Auditoria'
    );
  };

  const handleRestoreData = (data: {
    books?: Book[];
    loans?: Loan[];
    students?: Student[];
    suggestions?: Suggestion[];
    adminUsers?: AdminUser[];
    auditLogs?: AuditLog[];
  }) => {
    if (session.role !== 'admin') {
      handleOpenLogin('admin', 'Restaurar Dados');
      return;
    }
    if (data.books) setBooks(data.books);
    if (data.loans) setLoans(data.loans);
    if (data.students) setStudents(data.students);
    if (data.suggestions) setSuggestions(data.suggestions);
    if (data.adminUsers) setAdminUsers(data.adminUsers);
    if (data.auditLogs) setAuditLogs(data.auditLogs);

    logAuditEvent(
      'sistema',
      'Restauração de Backup Concluída',
      `Restauração completa de dados realizada com sucesso. Total restaurado: ${data.books?.length || 0} livros, ${data.students?.length || 0} alunos.`,
      'Backup & Restauração'
    );
  };

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
        isDark
          ? 'bg-[#00101c] text-slate-100 selection:bg-emerald-500 selection:text-slate-950'
          : 'bg-[#f8fafc] text-slate-900 selection:bg-emerald-500 selection:text-white'
      }`}
    >
      {/* Global Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={handleNavigateTab}
        onOpenDesignSystem={() => setIsDesignSystemOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        session={session}
        onOpenLogin={handleOpenLogin}
        onLogout={handleLogout}
      />

      {/* Main Tab Content */}
      <main className="flex-1">
        {/* TAB 1: INÍCIO (Hero + Catalog Highlights) */}
        {activeTab === 'inicio' && (
          <div className="space-y-6">
            <HeroBanner
              books={books}
              loans={loans}
              students={students}
              onSelectBook={handleSelectBook}
              onViewCatalog={() => setActiveTab('catalogo')}
              onViewRanking={() => setActiveTab('ranking')}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onSearchSubmit={handleSearchSubmit}
            />
            <BookCatalog
              books={books}
              onSelectBook={handleSelectBook}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          </div>
        )}

        {/* TAB 2: CATÁLOGO */}
        {activeTab === 'catalogo' && (
          <BookCatalog
            books={books}
            onSelectBook={handleSelectBook}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        )}

        {/* TAB: RANKING DE LEITORES E MAIS LIDOS */}
        {activeTab === 'ranking' && (
          <RankingView
            books={books}
            loans={loans}
            students={students}
            onSelectBook={handleSelectBook}
            onBackToHome={() => setActiveTab('inicio')}
          />
        )}

        {/* TAB: MEU HISTÓRICO (Área Exclusiva do Aluno) */}
        {activeTab === 'meu_historico' && session.student && (
          <StudentPortalView
            student={session.student}
            loans={loans}
            books={books}
            onOpenCatalog={() => setActiveTab('catalogo')}
            onLogout={handleLogout}
            onRequestReturn={handleReturnLoan}
          />
        )}

        {/* TAB 3: EMPRÉSTIMOS GERAIS */}
        {activeTab === 'emprestimos' && (
          <LoansView
            loans={loans}
            onOpenNewLoan={() => {
              const firstAvail = books.find((b) => b.availableCopies > 0) || books[0];
              setSelectedBook(firstAvail);
              setIsLoanModalOpen(true);
            }}
            onReturnLoan={handleReturnLoan}
            onRenewLoan={handleRenewLoan}
          />
        )}

        {/* TAB 4: SUGESTÕES */}
        {activeTab === 'sugestoes' && (
          <SuggestionsView
            suggestions={suggestions}
            onAddSuggestion={handleAddSuggestion}
          />
        )}

        {/* TAB 5: SOBRE */}
        {activeTab === 'sobre' && (
          <AboutView onBackToCatalog={() => setActiveTab('catalogo')} />
        )}

        {/* TAB 6: ADMIN DASHBOARD (Painel 4 - Protegido por Senha) */}
        {activeTab === 'admin' && session.role === 'admin' && (
          <AdminDashboard
            books={books}
            loans={loans}
            students={students}
            suggestions={suggestions}
            adminUsers={adminUsers}
            auditLogs={auditLogs}
            currentSessionAdmin={session.admin}
            onOpenBookDetail={handleSelectBook}
            onOpenNewLoan={() => {
              const firstAvail = books.find((b) => b.availableCopies > 0) || books[0];
              setSelectedBook(firstAvail);
              setIsLoanModalOpen(true);
            }}
            onOpenNewBook={() => setIsManageBooksOpen(true)}
            onOpenManageBooks={() => setIsManageBooksOpen(true)}
            onSaveStudent={handleSaveStudent}
            onCreateStudent={handleCreateStudent}
            onDeleteStudent={handleDeleteStudent}
            onCreateAdminUser={handleCreateAdminUser}
            onSaveAdminUser={handleSaveAdminUser}
            onDeleteAdminUser={handleDeleteAdminUser}
            onToggleAdminStatus={handleToggleAdminStatus}
            onClearAuditLogs={handleClearAuditLogs}
            onRestoreData={handleRestoreData}
            onReturnLoan={handleReturnLoan}
            onRenewLoan={handleRenewLoan}
            onDeleteSuggestion={handleDeleteSuggestion}
            onUpdateSuggestionStatus={handleUpdateSuggestionStatus}
            setActiveTab={handleNavigateTab}
          />
        )}

        {/* TAB 7: RELATÓRIOS (Painel 5 - Protegido e 100% Dinâmico) */}
        {activeTab === 'relatorios' && session.role === 'admin' && (
          <ReportsView loans={loans} books={books} students={students} />
        )}

        {/* TAB 8: MOBILE SIMULATOR */}
        {activeTab === 'mobile_view' && (
          <MobileSimulator
            books={books}
            loans={loans}
            onSelectBook={handleSelectBook}
          />
        )}
      </main>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        students={students}
        adminUsers={adminUsers}
        onLoginSuccess={handleLoginSuccess}
        initialMode={authModalMode}
        targetFeatureName={authTargetFeature}
      />

      {/* Gerenciar Livros Modal (Acesso Restrito ao ADM) */}
      <ManageBooksModal
        isOpen={isManageBooksOpen && session.role === 'admin'}
        onClose={() => setIsManageBooksOpen(false)}
        books={books}
        onSaveBook={handleSaveBook}
        onCreateBook={handleCreateBook}
        onDeleteBook={handleDeleteBook}
      />

      {/* Book Detail Modal */}
      <BookDetailModal
        book={selectedBook}
        onClose={() => setSelectedBook(null)}
        onRequestLoan={() => {
          setIsLoanModalOpen(true);
        }}
        isFavorite={selectedBook ? favorites.includes(selectedBook.id) : false}
        onToggleFavorite={handleToggleFavorite}
      />

      {/* Loan Creation Modal */}
      <LoanModal
        book={selectedBook}
        students={students}
        isOpen={isLoanModalOpen}
        onClose={() => setIsLoanModalOpen(false)}
        onConfirmLoan={handleConfirmLoan}
        session={session}
      />

      {/* Design System Reference Modal */}
      <DesignSystemModal
        isOpen={isDesignSystemOpen}
        onClose={() => setIsDesignSystemOpen(false)}
      />

      {/* Footer */}
      {activeTab !== 'admin' && (
        <Footer
          setActiveTab={handleNavigateTab}
          onOpenDesignSystem={() => setIsDesignSystemOpen(true)}
        />
      )}
    </div>
  );
}

