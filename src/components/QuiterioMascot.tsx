import React from 'react';
import { motion } from 'motion/react';

export type MascotMood = 'talking' | 'celebrating' | 'thinking' | 'encouraging';

interface QuiterioMascotProps {
  mood?: MascotMood;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showSpeechBubble?: boolean;
  speechText?: string;
  isMeowing?: boolean;
  onPetCat?: () => void;
}

export const QuiterioMascot: React.FC<QuiterioMascotProps> = ({
  mood = 'talking',
  size = 'lg',
  className = '',
  showSpeechBubble = false,
  speechText = 'Vamos testar seu conhecimento sobre o livro que você leu? 🐾',
  isMeowing = false,
  onPetCat,
}) => {
  const sizeDimensions = {
    sm: 'w-24 h-24',
    md: 'w-32 h-32 sm:w-36 sm:h-36',
    lg: 'w-40 h-40 sm:w-56 sm:h-56 md:w-60 md:h-60',
    xl: 'w-56 h-56 sm:w-72 sm:h-72',
  };

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      {/* Speech Bubble (3D Tactile Design themed after Quitério) */}
      {showSpeechBubble && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="relative mb-2 z-20 max-w-[250px] sm:max-w-[280px]"
        >
          <div className="relative bg-white text-slate-800 border-2 border-amber-300 border-b-4 border-amber-500 px-4 py-3 rounded-2xl shadow-[0_4px_0_#d97706] font-bold text-xs sm:text-sm text-center leading-snug">
            {speechText}
            {/* Speech Bubble Arrow pointing down to the cat */}
            <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-amber-500 drop-shadow-sm" />
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-x-7 border-x-transparent border-t-7 border-t-white" />
          </div>
        </motion.div>
      )}

      {/* Mascot Animated Character */}
      <motion.div
        onClick={onPetCat}
        title={onPetCat ? 'Clique no Quitério para ouvir um Miau! 🐾' : undefined}
        animate={
          mood === 'celebrating' || isMeowing
            ? { y: [0, -18, 0, -12, 0], rotate: [0, -4, 4, -2, 0] }
            : mood === 'thinking'
            ? { rotate: [-2.5, 2.5, -2.5], y: [0, -3, 0] }
            : { y: [0, -6, 0] }
        }
        transition={{
          repeat: Infinity,
          duration: mood === 'celebrating' || isMeowing ? 1.4 : 3.0,
          ease: 'easeInOut',
        }}
        className={`relative ${sizeDimensions[size]} ${onPetCat ? 'cursor-pointer' : ''}`}
      >
        {/* Floating Comic "Miau!!" Balloon when celebrating / meowing */}
        {(mood === 'celebrating' || isMeowing) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.4, y: 12, rotate: -12 }}
            animate={{
              opacity: [0.95, 1, 0.95],
              scale: [1, 1.15, 1],
              y: [0, -8, 0],
              rotate: [-6, 6, -6],
            }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
              ease: 'easeInOut',
            }}
            className="absolute -top-3 -right-2 sm:-right-6 z-30 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 text-amber-950 font-black text-xs sm:text-sm px-3.5 py-1.5 rounded-full shadow-xl border-2 border-amber-500 flex items-center gap-1.5"
          >
            <span className="text-base leading-none">😻</span>
            <span className="tracking-tight uppercase">Miau!!</span>
            <span className="text-xs">🐾</span>
          </motion.div>
        )}

        <svg
          viewBox="0 0 260 260"
          className="w-full h-full drop-shadow-2xl overflow-visible"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Ambient Back Glow */}
            <radialGradient id="catAura" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </radialGradient>

            {/* Cat Fur Gradient (Ginger / Orange Tabby) */}
            <linearGradient id="catFurGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="50%" stopColor="#ea580c" />
              <stop offset="100%" stopColor="#c2410c" />
            </linearGradient>

            {/* Lighter Face Fur Gradient */}
            <linearGradient id="catFaceGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fb923c" />
              <stop offset="100%" stopColor="#f97316" />
            </linearGradient>

            {/* Purple Book Hardcover Gradient (Exact from video) */}
            <linearGradient id="purpleBookCover" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#581c87" />
              <stop offset="50%" stopColor="#4c1d95" />
              <stop offset="100%" stopColor="#311068" />
            </linearGradient>

            {/* Graduation Cap Dark Navy Gradient */}
            <linearGradient id="gradCapGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2e1065" />
              <stop offset="50%" stopColor="#1e1b4b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>

            {/* Gold Accents Gradient */}
            <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
          </defs>

          {/* Ambient Warm Back Glow */}
          <circle cx="130" cy="135" r="100" fill="url(#catAura)" />

          {/* ========================================================================= */}
          {/* CAT TAIL (Curled striped tail on the left side, playfully swaying) */}
          {/* ========================================================================= */}
          <motion.g
            animate={{
              rotate: [-8, 14, -8],
            }}
            transition={{
              repeat: Infinity,
              duration: 2.6,
              ease: 'easeInOut',
            }}
            style={{ originX: '100px', originY: '200px' }}
          >
            <path
              d="M 98 198 C 65 232 38 194 48 164 C 54 145 68 140 75 147 C 68 168 74 200 102 192 Z"
              fill="url(#catFurGrad)"
              stroke="#9a3412"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            {/* Tail Stripes */}
            <path d="M 50 174 Q 58 178 64 170" stroke="#9a3412" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 58 190 Q 67 195 73 188" stroke="#9a3412" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 74 208 Q 84 212 90 202" stroke="#9a3412" strokeWidth="2.5" strokeLinecap="round" />
            {/* White Tail Tip */}
            <path
              d="M 48 164 C 50 155 60 142 68 143 C 73 145 75 151 73 157 C 67 159 58 162 48 164 Z"
              fill="#fff7ed"
            />
          </motion.g>

          {/* ========================================================================= */}
          {/* CAT BODY */}
          {/* ========================================================================= */}
          <path
            d="M 85 130 C 72 170 78 214 130 216 C 182 214 188 170 175 130 C 168 114 92 114 85 130 Z"
            fill="url(#catFurGrad)"
            stroke="#9a3412"
            strokeWidth="3.5"
          />

          {/* Cream Fluffy Chest */}
          <path
            d="M 104 132 C 104 122 156 122 156 132 C 158 164 150 196 130 198 C 110 196 102 164 104 132 Z"
            fill="#fff7ed"
          />

          {/* ========================================================================= */}
          {/* CAT HEAD & EARS */}
          {/* ========================================================================= */}
          {/* Left Ear */}
          <motion.g
            animate={{ rotate: [-2, 3, -2] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            style={{ originX: '88px', originY: '60px' }}
          >
            <path
              d="M 76 68 L 56 22 C 68 20 96 38 102 60 Z"
              fill="url(#catFurGrad)"
              stroke="#9a3412"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            {/* Inner Ear Pink */}
            <path
              d="M 74 60 L 63 32 C 70 30 88 44 94 56 Z"
              fill="#fed7aa"
              opacity="0.9"
            />
            <path
              d="M 76 56 L 68 38 C 72 36 84 46 88 54 Z"
              fill="#fb7185"
              opacity="0.5"
            />
          </motion.g>

          {/* Right Ear */}
          <motion.g
            animate={{ rotate: [2, -3, 2] }}
            transition={{ repeat: Infinity, duration: 3, delay: 0.2, ease: 'easeInOut' }}
            style={{ originX: '172px', originY: '60px' }}
          >
            <path
              d="M 184 68 L 204 22 C 192 20 164 38 158 60 Z"
              fill="url(#catFurGrad)"
              stroke="#9a3412"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            {/* Inner Ear Pink */}
            <path
              d="M 186 60 L 197 32 C 190 30 172 44 166 56 Z"
              fill="#fed7aa"
              opacity="0.9"
            />
            <path
              d="M 184 56 L 192 38 C 188 36 176 46 172 54 Z"
              fill="#fb7185"
              opacity="0.5"
            />
          </motion.g>

          {/* Chubby Round Cat Head */}
          <ellipse
            cx="130"
            cy="90"
            rx="52"
            ry="45"
            fill="url(#catFaceGrad)"
            stroke="#9a3412"
            strokeWidth="3.5"
          />

          {/* Tabby Forehead Stripes */}
          <path d="M 130 52 L 130 64" stroke="#9a3412" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M 120 56 L 123 67" stroke="#9a3412" strokeWidth="3" strokeLinecap="round" />
          <path d="M 140 56 L 137 67" stroke="#9a3412" strokeWidth="3" strokeLinecap="round" />

          {/* Cute Rosy Cheeks */}
          <ellipse cx="94" cy="102" rx="10" ry="6" fill="#fb7185" opacity="0.7" />
          <ellipse cx="166" cy="102" rx="10" ry="6" fill="#fb7185" opacity="0.7" />

          {/* White Snout / Muzzle */}
          <ellipse cx="130" cy="103" rx="22" ry="14" fill="#fff7ed" />

          {/* Pink Nose */}
          <polygon points="126,97 134,97 130,102" fill="#f43f5e" />

          {/* Whiskers */}
          <line x1="72" y1="101" x2="102" y2="103" stroke="#7c2d12" strokeWidth="2" strokeLinecap="round" />
          <line x1="70" y1="110" x2="102" y2="107" stroke="#7c2d12" strokeWidth="2" strokeLinecap="round" />
          <line x1="188" y1="101" x2="158" y2="103" stroke="#7c2d12" strokeWidth="2" strokeLinecap="round" />
          <line x1="190" y1="110" x2="158" y2="107" stroke="#7c2d12" strokeWidth="2" strokeLinecap="round" />

          {/* Smiling / Meowing Mouth */}
          {mood === 'celebrating' || isMeowing ? (
            <g>
              <path
                d="M 121 102 Q 130 118 139 102 Q 130 106 121 102 Z"
                fill="#be123c"
                stroke="#7c2d12"
                strokeWidth="2"
              />
              <ellipse cx="130" cy="111" rx="4.5" ry="3" fill="#fb7185" />
            </g>
          ) : (
            <path
              d="M 123 102 Q 130 108 130 105 Q 130 108 137 102"
              stroke="#7c2d12"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
            />
          )}

          {/* ========================================================================= */}
          {/* BIG EXPRESSIVE EYES (Joyful blinking anime eyes from video) */}
          {/* ========================================================================= */}
          {mood === 'celebrating' ? (
            /* Joyful Closed Crescent Eyes (^_^) when celebrating */
            <g>
              <path
                d="M 96 86 Q 106 74 116 86"
                stroke="#451a03"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M 144 86 Q 154 74 164 86"
                stroke="#451a03"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />
            </g>
          ) : (
            /* Open Big Blinking Anime Eyes */
            <motion.g
              animate={{
                scaleY: [1, 1, 0.1, 1, 1, 1, 1],
              }}
              transition={{
                repeat: Infinity,
                duration: 4.0,
                times: [0, 0.88, 0.92, 0.96, 0.98, 1, 1],
              }}
              style={{ originX: '130px', originY: '86px' }}
            >
              {/* Left Eye */}
              <circle cx="106" cy="86" r="12" fill="#ffffff" stroke="#7c2d12" strokeWidth="1.5" />
              <circle cx="107" cy="86" r="9" fill="#92400e" />
              <circle cx="107" cy="86.5" r="5.8" fill="#1c1917" />
              <circle cx="104" cy="83" r="3.2" fill="#ffffff" />
              <circle cx="110" cy="89" r="1.5" fill="#ffffff" />

              {/* Right Eye */}
              <circle cx="154" cy="86" r="12" fill="#ffffff" stroke="#7c2d12" strokeWidth="1.5" />
              <circle cx="153" cy="86" r="9" fill="#92400e" />
              <circle cx="153" cy="86.5" r="5.8" fill="#1c1917" />
              <circle cx="150" cy="83" r="3.2" fill="#ffffff" />
              <circle cx="156" cy="89" r="1.5" fill="#ffffff" />
            </motion.g>
          )}

          {/* ========================================================================= */}
          {/* ROUND SPECTACLES / GLASSES (From the video) */}
          {/* ========================================================================= */}
          <g>
            {/* Left Glass Rim */}
            <circle cx="106" cy="86" r="17" fill="rgba(255,255,255,0.1)" stroke="#451a03" strokeWidth="3.5" />
            <path d="M 97 76 Q 106 72 115 76" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.8" />

            {/* Right Glass Rim */}
            <circle cx="154" cy="86" r="17" fill="rgba(255,255,255,0.1)" stroke="#451a03" strokeWidth="3.5" />
            <path d="M 145 76 Q 154 72 163 76" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.8" />

            {/* Bridge */}
            <path d="M 123 83 Q 130 78 137 83" fill="none" stroke="#451a03" strokeWidth="3.5" strokeLinecap="round" />
          </g>

          {/* ========================================================================= */}
          {/* GRADUATION CAP (CAPELO ESCOLAR) - Key feature from video! */}
          {/* ========================================================================= */}
          <motion.g
            animate={{
              rotate: [-2, 2, -2],
              y: [0, -2, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: 3,
              ease: 'easeInOut',
            }}
            style={{ originX: '130px', originY: '48px' }}
          >
            {/* Skullcap base fitting on head */}
            <ellipse cx="130" cy="52" rx="26" ry="10" fill="#1e1b4b" stroke="#0f172a" strokeWidth="2" />

            {/* 3D Mortarboard Diamond Top */}
            <polygon
              points="130,22 178,38 130,54 82,38"
              fill="url(#gradCapGrad)"
              stroke="#0f172a"
              strokeWidth="2.5"
            />
            {/* Mortarboard Highlight Edge */}
            <polyline
              points="82,38 130,54 178,38"
              fill="none"
              stroke="#4338ca"
              strokeWidth="1.5"
            />

            {/* Center Gold Button */}
            <circle cx="130" cy="38" r="4" fill="url(#goldGrad)" stroke="#b45309" strokeWidth="1" />

            {/* Golden Cord & Tassel Hanging on the Left Side (like in video) */}
            <motion.g
              animate={{
                rotate: [-6, 12, -6],
              }}
              transition={{
                repeat: Infinity,
                duration: 2.2,
                ease: 'easeInOut',
              }}
              style={{ originX: '130px', originY: '38px' }}
            >
              {/* Cord */}
              <path
                d="M 130 38 Q 112 36 94 48"
                fill="none"
                stroke="#fbbf24"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              {/* Tassel Head */}
              <circle cx="94" cy="48" r="3" fill="#f59e0b" />
              {/* Tassel Fringe */}
              <path
                d="M 94 50 L 90 68 L 98 68 Z"
                fill="url(#goldGrad)"
                stroke="#d97706"
                strokeWidth="1"
              />
            </motion.g>
          </motion.g>

          {/* ========================================================================= */}
          {/* OPEN PURPLE BOOK HELD IN FRONT PAWS (Exact from video) */}
          {/* ========================================================================= */}
          <motion.g
            animate={{
              y: [0, -3, 0],
              rotate: [-1, 1, -1],
            }}
            transition={{
              repeat: Infinity,
              duration: 2.8,
              ease: 'easeInOut',
            }}
            style={{ originX: '130px', originY: '160px' }}
          >
            {/* Soft shadow under book */}
            <ellipse cx="130" cy="190" rx="46" ry="6" fill="#000000" opacity="0.3" />

            {/* Purple Book Hardcover */}
            <path
              d="M 72 138 Q 130 124 130 180 Q 130 124 188 138 L 184 187 Q 130 172 130 190 Q 130 172 76 187 Z"
              fill="url(#purpleBookCover)"
              stroke="#2e1065"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />

            {/* Gold Spine Center */}
            <rect x="127" y="134" width="6" height="56" rx="2" fill="#2e1065" />
            <line x1="126" y1="144" x2="134" y2="144" stroke="#fbbf24" strokeWidth="2" />
            <line x1="126" y1="154" x2="134" y2="154" stroke="#fbbf24" strokeWidth="2" />
            <line x1="126" y1="164" x2="134" y2="164" stroke="#fbbf24" strokeWidth="2" />
            <line x1="126" y1="174" x2="134" y2="174" stroke="#fbbf24" strokeWidth="2" />

            {/* Open Book Left Pages */}
            <path
              d="M 76 141 Q 128 128 128 177 Q 102 172 79 182 Z"
              fill="#ffffff"
              stroke="#cbd5e1"
              strokeWidth="1.5"
            />
            {/* Left Page Text Lines */}
            <line x1="86" y1="150" x2="120" y2="147" stroke="#6366f1" strokeWidth="1.8" opacity="0.5" strokeLinecap="round" />
            <line x1="86" y1="158" x2="122" y2="155" stroke="#6366f1" strokeWidth="1.8" opacity="0.5" strokeLinecap="round" />
            <line x1="86" y1="166" x2="118" y2="163" stroke="#6366f1" strokeWidth="1.8" opacity="0.5" strokeLinecap="round" />
            <line x1="86" y1="174" x2="112" y2="171" stroke="#6366f1" strokeWidth="1.8" opacity="0.5" strokeLinecap="round" />

            {/* Open Book Right Pages */}
            <path
              d="M 184 141 Q 132 128 132 177 Q 158 172 181 182 Z"
              fill="#ffffff"
              stroke="#cbd5e1"
              strokeWidth="1.5"
            />
            {/* Right Page Text Lines */}
            <line x1="140" y1="147" x2="174" y2="150" stroke="#6366f1" strokeWidth="1.8" opacity="0.5" strokeLinecap="round" />
            <line x1="138" y1="155" x2="174" y2="158" stroke="#6366f1" strokeWidth="1.8" opacity="0.5" strokeLinecap="round" />
            <line x1="142" y1="163" x2="174" y2="166" stroke="#6366f1" strokeWidth="1.8" opacity="0.5" strokeLinecap="round" />
            <line x1="148" y1="171" x2="174" y2="174" stroke="#6366f1" strokeWidth="1.8" opacity="0.5" strokeLinecap="round" />

            {/* Gold Bookmark Ribbon hanging down */}
            <path
              d="M 130 184 C 127 196 133 204 126 214 L 132 212 L 135 215 C 134 204 131 196 130 184 Z"
              fill="url(#goldGrad)"
            />

            {/* Left Front Paw Clutching Book */}
            <ellipse
              cx="79"
              cy="164"
              rx="9"
              ry="7.5"
              fill="#fff7ed"
              stroke="#9a3412"
              strokeWidth="2.5"
            />
            <circle cx="75" cy="164" r="1.5" fill="#fed7aa" />
            <circle cx="79" cy="161" r="1.5" fill="#fed7aa" />
            <circle cx="83" cy="164" r="1.5" fill="#fed7aa" />

            {/* Right Front Paw Clutching Book */}
            <ellipse
              cx="181"
              cy="164"
              rx="9"
              ry="7.5"
              fill="#fff7ed"
              stroke="#9a3412"
              strokeWidth="2.5"
            />
            <circle cx="177" cy="164" r="1.5" fill="#fed7aa" />
            <circle cx="181" cy="161" r="1.5" fill="#fed7aa" />
            <circle cx="185" cy="164" r="1.5" fill="#fed7aa" />
          </motion.g>

          {/* ========================================================================= */}
          {/* CELEBRATION SPARKLES & STARS */}
          {/* ========================================================================= */}
          {mood === 'celebrating' && (
            <g>
              <motion.circle
                cx="50"
                cy="60"
                r="4.5"
                fill="#fbbf24"
                animate={{ scale: [0, 1.4, 0] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
              />
              <motion.circle
                cx="210"
                cy="70"
                r="4"
                fill="#fbbf24"
                animate={{ scale: [0, 1.4, 0] }}
                transition={{ repeat: Infinity, duration: 1.2, delay: 0.3 }}
              />
              <motion.circle
                cx="130"
                cy="15"
                r="5"
                fill="#f59e0b"
                animate={{ scale: [0, 1.5, 0] }}
                transition={{ repeat: Infinity, duration: 1.2, delay: 0.6 }}
              />
            </g>
          )}
        </svg>
      </motion.div>
    </div>
  );
};
