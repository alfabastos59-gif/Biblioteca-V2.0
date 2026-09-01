export interface Book {
  id: string;
  title: string;
  author: string;
  cover: string;
  category: string;
  rating: number;
  reviewsCount: number;
  status: 'disponivel' | 'reservado' | 'em_andamento';
  pages: number;
  year: number;
  publisher: string;
  location: string;
  synopsis: string;
  isbn: string;
  totalCopies: number;
  availableCopies: number;
  featured?: boolean;
}

export interface Loan {
  id: string;
  studentName: string;
  studentEmail: string;
  studentAvatar?: string;
  studentClass: string;
  studentCode?: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  bookCover: string;
  loanDate: string;
  returnDate: string;
  actualReturnDate?: string;
  status: 'devolvido' | 'em_andamento' | 'atrasado';
  notes?: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  class: string;
  phone?: string;
  studentCode?: string;
  registration?: string; // Matrícula escolar
  avatar: string;
  activeLoansCount: number;
  totalLoansCount: number;
  joinedDate: string;
}

export interface Suggestion {
  id: string;
  studentName: string;
  studentClass?: string;
  bookTitle: string;
  author: string;
  category: string;
  reason: string;
  date: string;
  status: 'pendente' | 'aprovado' | 'recusado';
}

export type AdminRole = 'superadmin' | 'bibliotecario' | 'assistente';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  roleLabel: string;
  avatar: string;
  pin?: string;
  status: 'ativo' | 'inativo';
  createdAt: string;
  lastLogin?: string;
  phone?: string;
  notes?: string;
}

export type AuditActionType =
  | 'login'
  | 'logout'
  | 'create_book'
  | 'update_book'
  | 'delete_book'
  | 'create_student'
  | 'update_student'
  | 'delete_student'
  | 'create_loan'
  | 'return_loan'
  | 'renew_loan'
  | 'moderate_suggestion'
  | 'delete_suggestion'
  | 'create_admin'
  | 'update_admin'
  | 'delete_admin'
  | 'restore_backup'
  | 'clear_data';

export type AuditActionCategory =
  | 'livros'
  | 'alunos'
  | 'emprestimos'
  | 'sugestoes'
  | 'usuarios_adm'
  | 'sistema'
  | 'acesso';

export interface AuditLog {
  id: string;
  timestamp: string;
  adminId: string;
  adminName: string;
  adminAvatar: string;
  adminRole: string;
  actionType?: AuditActionType | string;
  actionCategory: AuditActionCategory;
  title: string;
  details: string;
  targetId?: string;
  targetName?: string;
}

export type ActiveTab = 'inicio' | 'catalogo' | 'ranking' | 'emprestimos' | 'sugestoes' | 'sobre' | 'admin' | 'relatorios' | 'mobile_view' | 'meu_historico';
export type AdminSection = 'dashboard' | 'emprestimos' | 'livros' | 'alunos' | 'sugestoes' | 'usuarios_adm' | 'auditoria' | 'relatorios' | 'backup' | 'configuracoes';
export type MobileTab = 'inicio' | 'catalogo' | 'emprestimos' | 'perfil';

export type UserRole = 'guest' | 'student' | 'admin';

export interface UserSession {
  role: UserRole;
  student?: Student;
  admin?: AdminUser;
}

