import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Upload,
  Camera,
  Link2,
  BookOpen,
  CheckCircle2,
  RefreshCw,
  Image as ImageIcon,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { Book } from '../types';
import { CATEGORIES } from '../data/mockData';
import { useTheme } from '../context/ThemeContext';

interface RegisterBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterBook: (book: Book) => void;
}

export const RegisterBookModal: React.FC<RegisterBookModalProps> = ({
  isOpen,
  onClose,
  onRegisterBook,
}) => {
  const { isDark } = useTheme();

  // Form Fields
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('Literatura Brasileira');
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [totalCopies, setTotalCopies] = useState<number>(1);
  const [location, setLocation] = useState('Estante 01 - Prateleira A');
  const [synopsis, setSynopsis] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [previewImage, setPreviewImage] = useState<string>('');

  // Camera & Upload States
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Stop camera stream helper
  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
    setCameraError(null);
  };

  // Close and cleanup
  const handleClose = () => {
    stopCameraStream();
    onClose();
  };

  // Cleanup on unmount or modal close
  useEffect(() => {
    if (!isOpen) {
      stopCameraStream();
    }
    return () => {
      stopCameraStream();
    };
  }, [isOpen]);

  // Handle Live Camera Stream
  const startLiveCamera = async (mode: 'user' | 'environment') => {
    stopCameraStream();
    setCameraError(null);

    // Check if mediaDevices is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      // Fallback directly to native smartphone camera input
      cameraInputRef.current?.click();
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      setIsCameraActive(true);
      setFacingMode(mode);

      // Attach to video element
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch((err) => {
            console.error('Error playing video stream:', err);
          });
        }
      }, 100);
    } catch (err: any) {
      console.warn('Could not access live camera, triggering native camera input fallback:', err);
      // Fallback directly to native smartphone camera
      cameraInputRef.current?.click();
    }
  };

  // Trigger camera action
  const handleTriggerCamera = () => {
    // Detect mobile user agent or touch device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

    if (isMobile) {
      // On mobile, trigger native camera capture input directly for maximum compatibility
      cameraInputRef.current?.click();
    } else {
      // On desktop/laptop, try opening live webcam
      startLiveCamera('environment');
    }
  };

  // Capture frame from live video
  const handleCapturePhoto = () => {
    if (!videoRef.current) return;

    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setPreviewImage(dataUrl);
        setCoverUrl('');
      }
      stopCameraStream();
    } catch (err) {
      console.error('Error capturing photo:', err);
      setCameraError('Não foi possível capturar a foto. Tente novamente.');
    }
  };

  // Switch camera between front and back
  const handleToggleCameraFacing = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    startLiveCamera(nextMode);
  };

  // Helper to downscale and compress image
  const compressImageFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 600;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.82));
          } else {
            resolve(e.target?.result as string);
          }
        };
        img.onerror = () => resolve(e.target?.result as string);
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Handle file input change (Upload or Camera fallback)
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Por favor, selecione um arquivo de imagem válido (PNG, JPG).');
      return;
    }

    try {
      const compressedDataUrl = await compressImageFile(file);
      setPreviewImage(compressedDataUrl);
      setCoverUrl('');
      setErrorMessage(null);
    } catch (err) {
      console.error('Error processing image:', err);
      setErrorMessage('Erro ao processar imagem. Tente novamente.');
    }
  };

  // Handle Drag & Drop
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      try {
        const compressedDataUrl = await compressImageFile(file);
        setPreviewImage(compressedDataUrl);
        setCoverUrl('');
        setErrorMessage(null);
      } catch (err) {
        setErrorMessage('Erro ao carregar imagem arrastada.');
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!title.trim()) {
      setErrorMessage('O título do livro é obrigatório.');
      return;
    }

    if (!author.trim()) {
      setErrorMessage('O autor do livro é obrigatório.');
      return;
    }

    setIsSubmitting(true);

    const defaultCover =
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80';

    const finalCover = previewImage || coverUrl.trim() || defaultCover;

    const newBook: Book = {
      id: `livro-${Date.now()}`,
      title: title.trim(),
      author: author.trim(),
      category: category || 'Literatura Brasileira',
      year: year || new Date().getFullYear(),
      totalCopies: Math.max(1, totalCopies),
      availableCopies: Math.max(1, totalCopies),
      location: location.trim() || 'Estante 01 - Prateleira A',
      isbn: `978-85-${Math.floor(100000 + Math.random() * 900000)}`,
      synopsis: synopsis.trim() || `Livro ${title} de ${author} disponível no acervo da biblioteca escolar.`,
      pages: 180,
      publisher: 'Acervo Biblioteca',
      rating: 5.0,
      reviewsCount: 1,
      status: 'disponivel',
      cover: finalCover,
    };

    onRegisterBook(newBook);
    setIsSubmitting(false);
    setSuccessToast(true);

    setTimeout(() => {
      setSuccessToast(false);
      handleClose();
      // Reset form
      setTitle('');
      setAuthor('');
      setCategory('Literatura Brasileira');
      setYear(new Date().getFullYear());
      setTotalCopies(1);
      setSynopsis('');
      setCoverUrl('');
      setPreviewImage('');
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      {/* Hidden Native Camera Input (Optimized for Smartphones with capture="environment") */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleImageFileChange}
      />

      {/* Hidden Regular File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/jpg"
        className="hidden"
        onChange={handleImageFileChange}
      />

      <div
        className={`relative w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto border transition-colors ${
          isDark
            ? 'bg-[#001726] border-[#163650] text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Success Toast Overlay */}
        {successToast && (
          <div className="absolute inset-0 z-50 bg-[#001726]/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-white mb-1">
              Livro Cadastrado com Sucesso!
            </h3>
            <p className="text-sm text-slate-300 max-w-sm">
              A obra <strong className="text-white">"{title}"</strong> foi adicionada ao acervo e já está visível no catálogo.
            </p>
          </div>
        )}

        {/* Modal Header */}
        <div className="p-5 sm:p-6 pb-4 flex items-start justify-between border-b border-[#163650]/40">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif tracking-tight text-white flex items-center gap-2">
              <span>Cadastrar novo livro</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Compartilhe um livro com a biblioteca da escola.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Fechar janela"
            className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center border border-slate-700 transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Body (Scrollable) */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[72vh] overflow-y-auto custom-scrollbar">
          {/* 1. Capa do livro */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Capa do livro
            </label>

            {/* LIVE CAMERA VIEWFINDER */}
            {isCameraActive ? (
              <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500 bg-black aspect-[4/3] flex flex-col items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />

                {/* Framing Overlay for Book Cover */}
                <div className="absolute inset-4 border-2 border-dashed border-white/60 rounded-xl pointer-events-none flex items-center justify-center">
                  <span className="bg-black/60 text-white text-[10px] px-2.5 py-1 rounded-full backdrop-blur-xs">
                    Posicione a capa do livro aqui
                  </span>
                </div>

                {/* Camera Controls Bar */}
                <div className="absolute bottom-3 inset-x-3 flex items-center justify-between gap-2 p-2 rounded-xl bg-black/70 backdrop-blur-md">
                  <button
                    type="button"
                    onClick={stopCameraStream}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer"
                  >
                    Cancelar
                  </button>

                  <button
                    type="button"
                    onClick={handleCapturePhoto}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg active:scale-95 cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Capturar Foto</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleToggleCameraFacing}
                    title="Alternar Câmera"
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : previewImage ? (
              /* Image Preview Box */
              <div className="relative rounded-2xl overflow-hidden border border-[#163650] bg-[#031522] p-3 flex items-center gap-4">
                <img
                  src={previewImage}
                  alt="Capa do livro"
                  className="w-16 h-22 object-cover rounded-lg border border-[#1b3d56] shadow-sm shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Foto da capa carregada
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                    Pronta para salvar no acervo
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[11px] font-semibold text-slate-300 hover:text-white underline cursor-pointer"
                    >
                      Trocar arquivo
                    </button>
                    <span className="text-slate-600">·</span>
                    <button
                      type="button"
                      onClick={handleTriggerCamera}
                      className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
                    >
                      Tirar outra foto
                    </button>
                    <span className="text-slate-600">·</span>
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewImage('');
                        setCoverUrl('');
                      }}
                      className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 underline cursor-pointer"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Standard Dashed Upload Box */
              <div
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="border-2 border-dashed border-[#163650] hover:border-emerald-500/80 rounded-2xl p-4 sm:p-5 flex items-center gap-4 bg-[#031522]/70 hover:bg-[#031522] transition-colors cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-xl bg-[#092233] border border-[#163650] flex items-center justify-center text-slate-300 group-hover:text-emerald-400 transition-colors shrink-0">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors">
                    Clique para enviar a imagem
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    PNG ou JPG, até 5MB
                  </p>
                </div>
              </div>
            )}

            {/* "Tirar foto da capa" Button (as shown in User Image 1) */}
            {!isCameraActive && (
              <button
                type="button"
                onClick={handleTriggerCamera}
                className="w-full mt-2.5 py-2.5 px-4 rounded-xl bg-[#082032] hover:bg-[#0d2a42] text-slate-200 hover:text-white border border-[#163650] flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-sm active:scale-[0.99]"
              >
                <Camera className="w-4 h-4 text-emerald-400" />
                <span>Tirar foto da capa</span>
              </button>
            )}

            {/* "Ou cole o endereço (URL) da imagem" */}
            <div className="mt-3.5">
              <label className="block text-xs text-slate-400 mb-1.5 font-medium">
                Ou cole o endereço (URL) da imagem
              </label>
              <div className="relative">
                <Link2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  value={coverUrl}
                  onChange={(e) => {
                    setCoverUrl(e.target.value);
                    if (e.target.value.trim()) {
                      setPreviewImage(e.target.value.trim());
                    }
                  }}
                  placeholder="https://exemplo.com/capa.jpg"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#031522] border border-[#163650] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono transition-colors"
                />
              </div>
            </div>
          </div>

          {/* 2. Título * */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Título *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: O Pequeno Príncipe"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#031522] border border-[#163650] text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* 3. Autor * */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Autor *
            </label>
            <input
              type="text"
              required
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Ex: Antoine de Saint-Exupéry"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#031522] border border-[#163650] text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* 4. Categoria & Ano */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Categoria *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#031522] border border-[#163650] text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors cursor-pointer"
              >
                {CATEGORIES.filter((c) => c !== 'Todos').map((cat) => (
                  <option key={cat} value={cat} className="bg-[#031522] text-white">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Ano de Publicação
              </label>
              <input
                type="number"
                min="1800"
                max={new Date().getFullYear() + 1}
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#031522] border border-[#163650] text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          {/* 5. Exemplares & Localização */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Exemplares Disponíveis
              </label>
              <input
                type="number"
                min="1"
                max="999"
                value={totalCopies}
                onChange={(e) => setTotalCopies(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#031522] border border-[#163650] text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Localização na Estante
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ex: Estante 02 - Prateleira B"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#031522] border border-[#163650] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          {/* 6. Sinopse / Descrição */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Sinopse / Sobre o livro (Opcional)
            </label>
            <textarea
              rows={2}
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
              placeholder="Breve resumo da história ou tema do livro..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#031522] border border-[#163650] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
            />
          </div>

          {/* Modal Footer Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#163650]/50">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2.5 rounded-xl border border-[#163650] hover:bg-[#0e2738] text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <BookOpen className="w-4 h-4" />
              <span>{isSubmitting ? 'Cadastrando...' : 'Cadastrar Livro'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
