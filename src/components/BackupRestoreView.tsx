import React, { useState, useRef } from 'react';
import {
  Database,
  Download,
  Upload,
  FileJson,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  ShieldCheck,
  HardDrive,
  Clock,
  BookOpen,
  Users,
  BookmarkCheck,
  Lightbulb,
  FileText,
  Shield,
  History,
} from 'lucide-react';
import { Book, Loan, Student, Suggestion, AdminUser, AuditLog } from '../types';
import { parseBackupJson, ParseResult } from '../utils/dataParser';
import { useTheme } from '../context/ThemeContext';

interface BackupRestoreViewProps {
  books: Book[];
  loans: Loan[];
  students: Student[];
  suggestions: Suggestion[];
  adminUsers?: AdminUser[];
  auditLogs?: AuditLog[];
  onRestoreData: (data: {
    books?: Book[];
    loans?: Loan[];
    students?: Student[];
    suggestions?: Suggestion[];
    adminUsers?: AdminUser[];
    auditLogs?: AuditLog[];
  }) => void;
}

export const BackupRestoreView: React.FC<BackupRestoreViewProps> = ({
  books,
  loans,
  students,
  suggestions,
  adminUsers = [],
  auditLogs = [],
  onRestoreData,
}) => {
  const { isDark } = useTheme();
  const [copied, setCopied] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRestoreConfirmOpen, setIsRestoreConfirmOpen] = useState(false);
  const [parsedRestoreData, setParsedRestoreData] = useState<{
    books?: Book[];
    loans?: Loan[];
    students?: Student[];
    suggestions?: Suggestion[];
    adminUsers?: AdminUser[];
    auditLogs?: AuditLog[];
    metadata?: any;
    projectName?: string;
  } | null>(null);
  const [showJsonPreview, setShowJsonPreview] = useState(false);
  const [manualJsonText, setManualJsonText] = useState('');
  const [activeRestoreMethod, setActiveRestoreMethod] = useState<'upload' | 'paste'>('upload');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate backup payload object matching the authentic Maria Quitéria project schema
  const createBackupPayload = () => {
    return {
      versao: 2,
      gerado_em: new Date().toISOString(),
      projeto: 'biblioteca-maria-quiteria',
      sistema: 'Biblioteca Maria Quitéria',
      instituicao: 'Colégio Estadual do Campo Maria Quitéria - TI',
      resumo: {
        totalLivros: books.length,
        totalEmprestimos: loans.length,
        totalAlunos: students.length,
        totalSugestoes: suggestions.length,
        totalAdministradores: adminUsers.length,
        totalAuditoria: auditLogs.length,
      },
      dados: {
        livros: books.map((b) => ({
          id: b.id,
          titulo: b.title,
          autor: b.author,
          descricao: b.synopsis,
          capa_url: b.cover,
          cadastrado_por: null,
          disponivel: b.status === 'disponivel',
          isbn: b.isbn === 'N/A' ? null : b.isbn,
          ano: b.year,
          categoria: b.category,
          quantidade: b.totalCopies,
          quantidade_disponivel: b.availableCopies,
          created_at: new Date().toISOString(),
        })),
        alunos: students.map((s) => ({
          id: s.id,
          nome: s.name,
          turma: s.class,
          matricula: null,
          telefone: s.phone || null,
          codigo_aluno: s.studentCode || `ALU-${s.id.slice(0, 4)}`,
          created_at: s.joinedDate || new Date().toISOString(),
          avatar: s.avatar,
        })),
        emprestimos: loans.map((l) => ({
          id: l.id,
          aluno_id: students.find((s) => s.name === l.studentName)?.id || null,
          livro_id: l.bookId,
          data_emprestimo: l.loanDate,
          data_devolucao_prevista: l.returnDate,
          data_devolucao: l.actualReturnDate || null,
          observacoes: l.notes || null,
          codigo_aluno: l.studentCode || null,
          aluno_nome: l.studentName,
          status: l.status === 'devolvido' ? 'Devolvido' : 'Emprestado',
          created_at: new Date().toISOString(),
        })),
        sugestoes_livros: suggestions.map((s) => ({
          id: s.id,
          aluno_nome: s.studentName,
          turma: s.studentClass || '1º Ano',
          titulo: s.bookTitle,
          autor: s.author,
          motivo: s.reason,
          created_at: s.date || new Date().toISOString(),
        })),
        usuarios_administradores: adminUsers,
        historico_auditoria: auditLogs,
      },
    };
  };

  const backupJsonString = JSON.stringify(createBackupPayload(), null, 2);
  const payloadSizeKb = (new Blob([backupJsonString]).size / 1024).toFixed(2);

  // Download JSON File
  const handleDownloadBackup = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(backupJsonString);
    const downloadAnchor = document.createElement('a');
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const timeStr = `${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}`;
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `backup_biblioteca_maria_quiteria_${dateStr}_${timeStr}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showSuccess('Backup baixado com sucesso no formato oficial .JSON!');
  };

  // Copy JSON to clipboard
  const handleCopyClipboard = () => {
    navigator.clipboard.writeText(backupJsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
    showSuccess('Código JSON do backup copiado para a área de transferência!');
  };

  // Export as CSV (Books)
  const handleExportBooksCsv = () => {
    const headers = ['ID', 'Titulo', 'Autor', 'Categoria', 'Ano', 'Editora', 'ISBN', 'Exemplares_Total', 'Exemplares_Disponiveis', 'Localizacao'];
    const rows = books.map((b) => [
      b.id,
      `"${b.title.replace(/"/g, '""')}"`,
      `"${b.author.replace(/"/g, '""')}"`,
      `"${b.category}"`,
      b.year,
      `"${b.publisher}"`,
      `"${b.isbn}"`,
      b.totalCopies,
      b.availableCopies,
      `"${b.location}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map((e) => e.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `acervo_livros_maria_quiteria_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    showSuccess('Planilha CSV de Livros gerada com sucesso!');
  };

  // Export as CSV (Loans)
  const handleExportLoansCsv = () => {
    const headers = ['ID', 'Aluno', 'Turma', 'Codigo_Aluno', 'Livro', 'Data_Emprestimo', 'Data_Prevista', 'Data_Devolucao', 'Status'];
    const rows = loans.map((l) => [
      l.id,
      `"${l.studentName.replace(/"/g, '""')}"`,
      `"${l.studentClass}"`,
      `"${l.studentCode || ''}"`,
      `"${l.bookTitle.replace(/"/g, '""')}"`,
      l.loanDate,
      l.returnDate,
      l.actualReturnDate || '',
      l.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map((e) => e.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `relatorio_emprestimos_maria_quiteria_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    showSuccess('Planilha CSV de Empréstimos gerada com sucesso!');
  };

  // File Upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      setErrorMessage('Por favor, selecione um arquivo válido com extensão .json');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        processJsonRestore(text);
      } catch (err) {
        setErrorMessage('Erro ao ler o arquivo selecionado.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Process and validate JSON text using our universal normalizer
  const processJsonRestore = (rawJson: string) => {
    setErrorMessage(null);
    const result: ParseResult = parseBackupJson(rawJson);

    if (!result.success) {
      setErrorMessage(result.errorMessage || 'Arquivo inválido ou não reconhecido.');
      return;
    }

    setParsedRestoreData({
      books: result.books,
      loans: result.loans,
      students: result.students,
      suggestions: result.suggestions,
      metadata: result.summary,
      projectName: result.projectName,
    });

    setIsRestoreConfirmOpen(true);
  };

  // Apply parsed restore
  const handleConfirmRestore = () => {
    if (!parsedRestoreData) return;

    onRestoreData({
      books: parsedRestoreData.books,
      loans: parsedRestoreData.loans,
      students: parsedRestoreData.students,
      suggestions: parsedRestoreData.suggestions,
    });

    const totalLivros = parsedRestoreData.books?.length || 0;
    const totalEmprestimos = parsedRestoreData.loans?.length || 0;
    const totalAlunos = parsedRestoreData.students?.length || 0;

    setIsRestoreConfirmOpen(false);
    setParsedRestoreData(null);
    setManualJsonText('');
    showSuccess(
      `Banco de dados restaurado com sucesso! (${totalLivros} livros, ${totalAlunos} alunos e ${totalEmprestimos} empréstimos carregados)`
    );
  };

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setErrorMessage(null);
    setTimeout(() => {
      setSuccessMessage(null);
    }, 4500);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div
        className={`border rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${
          isDark
            ? 'bg-[#092032] border-[#163650]'
            : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div>
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold mb-3 ${
              isDark ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Segurança & Integridade de Dados</span>
          </div>
          <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Central de Backup & Restauração
          </h2>
          <p className={`text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            Faça download de cópias de segurança de todo o acervo de livros, cadastro de alunos, histórico de empréstimos e sugestões, ou restaure a qualquer momento.
          </p>
        </div>

        {/* Database Status Pills */}
        <div
          className={`p-4 rounded-2xl border flex flex-col gap-2 shrink-0 text-xs ${
            isDark ? 'bg-[#001424] border-[#163650]' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between gap-4">
            <span className={`flex items-center gap-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <HardDrive className="w-3.5 h-3.5 text-emerald-500" />
              Tamanho estimado:
            </span>
            <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{payloadSizeKb} KB</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className={`flex items-center gap-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <Clock className="w-3.5 h-3.5 text-emerald-500" />
              Última atualização:
            </span>
            <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Agora</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className={`flex items-center gap-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Status do banco:
            </span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">100% Operacional</span>
          </div>
        </div>
      </div>

      {/* Feedback Messages */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 text-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-700 dark:text-rose-300 text-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
          <span className="font-medium">{errorMessage}</span>
        </div>
      )}

      {/* Main Grid: Backup & Restore cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* CARD 1: EXPORTAR BACKUP */}
        <div className={`border rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6 ${isDark ? 'bg-[#092032] border-[#163650]' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 mb-4">
              <Download className="w-6 h-6" />
            </div>

            <h3 className={`text-xl font-bold tracking-tight mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              1. Gerar Cópia de Segurança (Backup)
            </h3>
            <p className={`text-xs sm:text-sm leading-relaxed mb-6 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Exporte todos os registros da biblioteca em um arquivo JSON completo e compatível para salvar no computador, pendrive ou nuvem.
            </p>

            {/* Current Summary Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className={`p-3 rounded-xl border ${isDark ? 'bg-[#001424] border-[#163650]' : 'bg-slate-50 border-slate-200'}`}>
                <div className={`flex items-center gap-1.5 text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
                  Livros
                </div>
                <span className={`text-lg font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>{books.length}</span>
              </div>
              <div className={`p-3 rounded-xl border ${isDark ? 'bg-[#001424] border-[#163650]' : 'bg-slate-50 border-slate-200'}`}>
                <div className={`flex items-center gap-1.5 text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  <Users className="w-3.5 h-3.5 text-blue-500" />
                  Alunos
                </div>
                <span className={`text-lg font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>{students.length}</span>
              </div>
              <div className={`p-3 rounded-xl border ${isDark ? 'bg-[#001424] border-[#163650]' : 'bg-slate-50 border-slate-200'}`}>
                <div className={`flex items-center gap-1.5 text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  <BookmarkCheck className="w-3.5 h-3.5 text-amber-500" />
                  Empréstimos
                </div>
                <span className={`text-lg font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>{loans.length}</span>
              </div>
              <div className={`p-3 rounded-xl border ${isDark ? 'bg-[#001424] border-[#163650]' : 'bg-slate-50 border-slate-200'}`}>
                <div className={`flex items-center gap-1.5 text-xs mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  <Lightbulb className="w-3.5 h-3.5 text-purple-500" />
                  Sugestões
                </div>
                <span className={`text-lg font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>{suggestions.length}</span>
              </div>
            </div>
          </div>

          <div className={`space-y-3 pt-4 border-t ${isDark ? 'border-[#163650]' : 'border-slate-200'}`}>
            <button
              onClick={handleDownloadBackup}
              className="w-full flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl bg-[#23c65e] hover:bg-[#1fa950] text-white font-bold text-sm transition-all duration-200 shadow-sm cursor-pointer"
            >
              <FileJson className="w-5 h-5" />
              <span>Baixar Backup Completo (.JSON)</span>
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleCopyClipboard}
                className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                  isDark ? 'bg-[#001424] hover:bg-[#0d2a40] text-slate-200 border-[#163650]' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                }`}
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copiado!' : 'Copiar JSON'}</span>
              </button>

              <button
                onClick={() => setShowJsonPreview(!showJsonPreview)}
                className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                  isDark ? 'bg-[#001424] hover:bg-[#0d2a40] text-slate-200 border-[#163650]' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                }`}
              >
                <FileText className="w-4 h-4 text-slate-400" />
                <span>{showJsonPreview ? 'Ocultar Código' : 'Visualizar JSON'}</span>
              </button>
            </div>

            {/* Quick Export in CSV for spreadsheets */}
            <div className={`pt-3 flex items-center justify-between text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <span>Exportar tabelas para Excel / Sheets:</span>
              <div className="flex gap-2">
                <button
                  onClick={handleExportBooksCsv}
                  className="text-emerald-500 hover:underline flex items-center gap-1 cursor-pointer font-medium"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  Livros (CSV)
                </button>
                <span>•</span>
                <button
                  onClick={handleExportLoansCsv}
                  className="text-emerald-500 hover:underline flex items-center gap-1 cursor-pointer font-medium"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  Empréstimos (CSV)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2: RESTAURAR DADOS */}
        <div className={`border rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6 ${isDark ? 'bg-[#092032] border-[#163650]' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div>
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-500 mb-4">
              <Upload className="w-6 h-6" />
            </div>

            <h3 className={`text-xl font-bold tracking-tight mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              2. Restaurar Dados Salvos
            </h3>
            <p className={`text-xs sm:text-sm leading-relaxed mb-6 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Recupere os dados da biblioteca importando um arquivo de backup previamente exportado pelo sistema.
            </p>

            {/* Method Tabs */}
            <div className={`flex rounded-xl p-1 border mb-4 ${isDark ? 'bg-[#001424] border-[#163650]' : 'bg-slate-100 border-slate-200'}`}>
              <button
                onClick={() => setActiveRestoreMethod('upload')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  activeRestoreMethod === 'upload'
                    ? isDark
                      ? 'bg-[#163650] text-white shadow-sm'
                      : 'bg-white text-slate-900 shadow-sm'
                    : isDark
                    ? 'text-slate-400 hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Enviar Arquivo (.json)
              </button>
              <button
                onClick={() => setActiveRestoreMethod('paste')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  activeRestoreMethod === 'paste'
                    ? isDark
                      ? 'bg-[#163650] text-white shadow-sm'
                      : 'bg-white text-slate-900 shadow-sm'
                    : isDark
                    ? 'text-slate-400 hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Colar Texto JSON
              </button>
            </div>

            {activeRestoreMethod === 'upload' ? (
              /* Drag & Drop File Zone */
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-3 ${
                  isDark
                    ? 'border-[#163650] hover:border-emerald-500/60 bg-[#001424]/60 hover:bg-[#001424]'
                    : 'border-slate-300 hover:border-emerald-500 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-emerald-500 border ${
                  isDark ? 'bg-[#092032] border-[#163650]' : 'bg-white border-slate-200'
                }`}>
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <span className={`text-sm font-bold block ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Clique para selecionar o arquivo .JSON
                  </span>
                  <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Arquivos de backup oficiais da Biblioteca Maria Quitéria
                  </span>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            ) : (
              /* Manual Paste Area */
              <div className="space-y-3">
                <textarea
                  value={manualJsonText}
                  onChange={(e) => setManualJsonText(e.target.value)}
                  placeholder="Cole o código JSON do backup aqui..."
                  rows={5}
                  className={`w-full border rounded-xl p-3 text-xs font-mono focus:outline-none ${
                    isDark
                      ? 'bg-[#001424] border-[#163650] focus:border-emerald-500 text-slate-200'
                      : 'bg-slate-50 border-slate-200 focus:border-[#23c65e] text-slate-800'
                  }`}
                />
                <button
                  disabled={!manualJsonText.trim()}
                  onClick={() => processJsonRestore(manualJsonText)}
                  className="w-full py-2.5 bg-[#23c65e] hover:bg-[#1fa950] disabled:opacity-50 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer shadow-sm"
                >
                  Analisar e Validar JSON
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* JSON Preview Modal / Collapsible */}
      {showJsonPreview && (
        <div className={`border rounded-3xl p-6 space-y-3 animate-in fade-in ${isDark ? 'bg-[#092032] border-[#163650]' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="flex items-center justify-between">
            <h4 className={`text-sm font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <FileJson className="w-4 h-4 text-emerald-500" />
              <span>Visualização do Conteúdo do Backup (JSON)</span>
            </h4>
            <button
              onClick={() => setShowJsonPreview(false)}
              className={`text-xs cursor-pointer ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Fechar
            </button>
          </div>
          <pre className={`p-4 rounded-xl border text-[11px] font-mono overflow-x-auto max-h-72 select-all ${
            isDark ? 'bg-[#001424] border-[#163650] text-emerald-300' : 'bg-slate-900 border-slate-800 text-emerald-400'
          }`}>
            {backupJsonString}
          </pre>
        </div>
      )}

      {/* RESTORE CONFIRMATION MODAL */}
      {isRestoreConfirmOpen && parsedRestoreData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className={`border rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 animate-in zoom-in-95 ${
            isDark ? 'bg-[#092032] border-[#163650]' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-500 shrink-0">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Confirmar Restauração de Dados
                </h3>
                <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  Os registros atuais serão substituídos pelos itens do backup.
                </p>
              </div>
            </div>

            {/* Found Items Card */}
            <div className={`p-4 rounded-2xl border space-y-2 text-xs ${isDark ? 'bg-[#001424] border-[#163650]' : 'bg-slate-50 border-slate-200'}`}>
              <span className={`font-semibold block mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Conteúdo identificado no arquivo de backup:
              </span>
              <div className={`flex items-center justify-between ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                <span>• Livros encontrados:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {parsedRestoreData.books?.length ?? 'Não alterado'}
                </span>
              </div>
              <div className={`flex items-center justify-between ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                <span>• Alunos cadastrados:</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  {parsedRestoreData.students?.length ?? 'Não alterado'}
                </span>
              </div>
              <div className={`flex items-center justify-between ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                <span>• Histórico de empréstimos:</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">
                  {parsedRestoreData.loans?.length ?? 'Não alterado'}
                </span>
              </div>
              <div className={`flex items-center justify-between ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                <span>• Sugestões de títulos:</span>
                <span className="font-bold text-purple-600 dark:text-purple-400">
                  {parsedRestoreData.suggestions?.length ?? 'Não alterado'}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsRestoreConfirmOpen(false);
                  setParsedRestoreData(null);
                }}
                className={`flex-1 py-3 rounded-xl font-semibold text-xs border transition-colors cursor-pointer ${
                  isDark ? 'bg-[#001424] hover:bg-[#163650] text-slate-300 border-[#163650]' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                }`}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmRestore}
                className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                Sim, Restaurar Agora
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

