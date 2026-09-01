import React, { useState } from 'react';
import { X, Star, Heart, BookmarkCheck, MapPin, BookOpen, Check, Layers } from 'lucide-react';
import { Book } from '../types';
import { useTheme } from '../context/ThemeContext';

interface BookDetailModalProps {
  book: Book | null;
  onClose: () => void;
  onRequestLoan: (book: Book) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (bookId: string) => void;
}

export const BookDetailModal: React.FC<BookDetailModalProps> = ({
  book,
  onClose,
  onRequestLoan,
  isFavorite = false,
  onToggleFavorite,
}) => {
  const { isDark } = useTheme();
  const [copied, setCopied] = useState(false);

  if (!book) return null;

  const handleCopyLocation = () => {
    navigator.clipboard?.writeText(book.location);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Click outside to close */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Container */}
      <div className={`relative z-10 w-full max-w-3xl border rounded-3xl p-5 sm:p-8 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 ${
        isDark ? 'bg-[#092032] border-[#163650] text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Close Button */}
        <button
          id="btn-close-book-modal"
          onClick={onClose}
          className={`absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-full border transition-colors cursor-pointer ${
            isDark ? 'bg-[#031320] text-slate-400 hover:text-white border-[#163650]' : 'bg-slate-100 text-slate-500 hover:text-slate-900 border-slate-200'
          }`}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* Left Column: Book Cover */}
          <div className="md:col-span-5 flex flex-col items-center">
            <div className={`relative aspect-[3/4] w-full max-w-[260px] rounded-2xl overflow-hidden border-2 shadow-xl ${
              isDark ? 'bg-[#031320] border-[#1e3a5f]/60' : 'bg-slate-100 border-slate-200'
            }`}>
              <img
                src={book.cover}
                alt={book.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3">
                <span className="bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md backdrop-blur-sm">
                  {book.status === 'disponivel'
                    ? 'Disponível'
                    : book.status === 'reservado'
                    ? 'Reservado'
                    : 'Em andamento'}
                </span>
              </div>
            </div>

            {/* Copies info */}
            <div className={`mt-3 flex items-center gap-2 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <Layers className="w-3.5 h-3.5 text-emerald-500" />
              <span>
                {book.availableCopies} de {book.totalCopies} exemplares disponíveis
              </span>
            </div>
          </div>

          {/* Right Column: Metadata and Actions */}
          <div className="md:col-span-7 flex flex-col justify-between">
            <div>
              {/* Title & Author */}
              <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {book.title}
              </h2>
              <p className={`text-base sm:text-lg font-medium mb-3 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                {book.author}
              </p>

              {/* Star Rating */}
              <div className="flex items-center gap-2 mb-6">
                <div className="flex items-center text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(book.rating)
                          ? 'fill-amber-400 text-amber-400'
                          : isDark ? 'text-slate-700' : 'text-slate-300'
                      }`}
                    />
                  ))}
                </div>
                <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{book.rating}</span>
                <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  ({book.reviewsCount} avaliações)
                </span>
              </div>

              {/* Metadata List */}
              <div className={`space-y-2.5 p-4 rounded-2xl border mb-6 text-xs sm:text-sm ${
                isDark ? 'bg-[#031320]/60 border-[#163650]/80' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className={`flex justify-between items-center py-0.5 border-b pb-1.5 ${isDark ? 'border-[#163650]/40' : 'border-slate-200'}`}>
                  <span className={isDark ? 'text-slate-400 font-medium' : 'text-slate-500 font-medium'}>Categoria:</span>
                  <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{book.category}</span>
                </div>
                <div className={`flex justify-between items-center py-0.5 border-b pb-1.5 ${isDark ? 'border-[#163650]/40' : 'border-slate-200'}`}>
                  <span className={isDark ? 'text-slate-400 font-medium' : 'text-slate-500 font-medium'}>Páginas:</span>
                  <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{book.pages}</span>
                </div>
                <div className={`flex justify-between items-center py-0.5 border-b pb-1.5 ${isDark ? 'border-[#163650]/40' : 'border-slate-200'}`}>
                  <span className={isDark ? 'text-slate-400 font-medium' : 'text-slate-500 font-medium'}>Ano:</span>
                  <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{book.year}</span>
                </div>
                <div className={`flex justify-between items-center py-0.5 border-b pb-1.5 ${isDark ? 'border-[#163650]/40' : 'border-slate-200'}`}>
                  <span className={isDark ? 'text-slate-400 font-medium' : 'text-slate-500 font-medium'}>Editora:</span>
                  <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{book.publisher}</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className={`font-medium flex items-center gap-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                    Localização:
                  </span>
                  <button
                    onClick={handleCopyLocation}
                    title="Clique para copiar"
                    className="text-emerald-500 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>{book.location}</span>
                    {copied && <Check className="w-3 h-3 text-emerald-500" />}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 mb-6">
                <button
                  id="btn-solicitar-emprestimo-modal"
                  onClick={() => onRequestLoan(book)}
                  disabled={book.availableCopies === 0}
                  className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer ${
                    book.availableCopies > 0
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : isDark ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <BookmarkCheck className="w-5 h-5" />
                  <span>
                    {book.availableCopies > 0
                      ? 'Solicitar Empréstimo'
                      : 'Indisponível no Momento'}
                  </span>
                </button>

                <button
                  id="btn-favoritos-modal"
                  onClick={() => onToggleFavorite?.(book.id)}
                  className={`w-full py-3 px-6 rounded-xl font-semibold text-sm border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isFavorite
                      ? 'bg-rose-500/10 text-rose-500 border-rose-500/40'
                      : isDark
                      ? 'bg-[#031320] text-slate-300 border-[#163650] hover:text-white'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Heart
                    className={`w-4 h-4 ${
                      isFavorite ? 'fill-rose-500 text-rose-500' : ''
                    }`}
                  />
                  <span>
                    {isFavorite ? 'Remover dos Favoritos' : 'Adicionar aos Favoritos'}
                  </span>
                </button>
              </div>

              {/* Sobre o livro */}
              <div>
                <h4 className={`text-sm font-bold mb-1.5 flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  <BookOpen className="w-4 h-4 text-emerald-500" />
                  <span>Sobre o livro</span>
                </h4>
                <p className={`text-xs sm:text-sm leading-relaxed font-normal ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  {book.synopsis}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

