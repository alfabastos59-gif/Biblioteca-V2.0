/**
 * Utilitário Completo de Moderação e Filtro de Conteúdo Impróprio
 * Proteção contra:
 * - Palavrões e termos sexuais/obscenos (ex: pica, bunda, buceta, foda, caralho...)
 * - Homofobia, transfobia e discriminação LGBTQIA+ (ex: viado, sapatão, traveco...)
 * - Racismo, injúria racial, antissemitismo e supremacismo (ex: macaco, crioulo, nazista...)
 * - Xingamentos, assédio, capacitismo e ofensas graves (ex: arrombado, retardado, babaca...)
 * - Expressões compostas, siglas ofensivas (ex: vtnc, vsf, fdp, tnc...)
 * 
 * Especializado para o ambiente escolar da Biblioteca Maria Quitéria
 */

// 1. Termos e variações de palavras únicas ofensivas
const FORBIDDEN_WORDS_LIST = [
  // --- Termos Sexuais / Obscenidades / Órgãos e Gírias Vulgares ---
  'pica', 'picas', 'picao', 'picudo', 'pika', 'pikas', 'pikudo', 'piquinha',
  'bunda', 'bundas', 'bundao', 'bunduda', 'bundudo', 'bundinha',
  'buceta', 'bucetas', 'boceta', 'bocetas', 'bucetinha', 'bucetao', 'bct', 'ppk', 'pepeka', 'xoxota', 'xoxotas', 'xoxotinha', 'xana', 'xaninha', 'tabaca', 'perereca',
  'caralho', 'caralhos', 'caralha', 'caralhao', 'carai', 'krai', 'crl', 'krl', 'krlh', 'garaio', 'garalho',
  'porra', 'porras', 'porrinha', 'prr', 'porradao',
  'foda', 'fodas', 'foder', 'fodeu', 'fode', 'fodendo', 'fodido', 'fodida', 'fudido', 'fudida', 'fuder', 'fudeu', 'fudendo', 'fodedor', 'fodasse', 'fodase', 'foda-se', 'sifuder', 'sifude', 'sfder', 'sfdeu',
  'puta', 'putas', 'puto', 'putos', 'putaria', 'putinha', 'putona', 'putanheiro', 'quenga', 'kenga', 'vadia', 'vadias', 'vadio', 'vadios', 'vagabunda', 'vagabundas', 'vagabundo', 'vagabundos', 'rampeira', 'prostituta',
  'piroca', 'pirocas', 'pirocudo', 'piroquinha', 'cacete', 'cacetes', 'caceta',
  'rola', 'rolas', 'rolao', 'rolona', 'grelo', 'grelos', 'siririca', 'punheta', 'punheteiro', 'punheteira', 'boquete', 'boqueteiro', 'boqueteira', 'mamada', 'chupada', 'chupador',
  'cu', 'cuzao', 'cuzinho', 'cusao', 'cuzaum', 'cuzudos',
  'merda', 'merdas', 'merdinha', 'merdao', 'bosta', 'bostas', 'bostinha', 'bostao', 'cagalhao', 'cagado', 'cagada',

  // --- Homofobia, Transfobia e Discriminação LGBTQIA+ ---
  'viado', 'viados', 'viadinho', 'viadao', 'viadagem', 'viadice', 'viadada',
  'veado', 'veados',
  'baitola', 'baitolas', 'baitolagem',
  'boiola', 'boiolas', 'boiolice',
  'bicha', 'bichas', 'bichinha', 'bichona', 'marica', 'maricas', 'frutinha',
  'sapatao', 'sapatona', 'sapatonas', 'lezica',
  'traveco', 'travecos', 'travecao', 'travecada', 'travequinha', 'shemale', 'tranny',

  // --- Racismo, Injúria Racial, Nazismo e Ódio Étnico/Religioso ---
  'macaco', 'macaca', 'macacos', 'macacas',
  'crioulo', 'crioula', 'crioulos', 'crioulas', 'crioulada',
  'negrinho', 'negrinha', 'tição', 'ticao',
  'nazista', 'nazistas', 'nazismo', 'neonazista', 'neonazistas', 'hitler', 'esvastica',
  'antissemita', 'antissemitismo',

  // --- Xingamentos, Capacitismo e Ofensas Pessoais ---
  'arrombado', 'arrombada', 'arrombados', 'arrombadas',
  'otario', 'otaria', 'otarios', 'otarias',
  'babaca', 'babacas', 'babaquice',
  'escroto', 'escrota', 'escrotos', 'escrotas',
  'retardado', 'retardada', 'retardados', 'retardadas',
  'mongol', 'mongoloide', 'mongoloides', 'debiloide', 'debiloides',
  'imbecil', 'imbecis', 'idiota', 'idiotas',
  'desgraca', 'desgracado', 'desgracada', 'desgracados', 'desgracadas',
  'lazarento', 'lazarenta', 'chifrudo', 'chifruda', 'corno', 'corna', 'cornos',
  'cretino', 'cretina', 'canalha', 'canalhas', 'safado', 'safada', 'safados', 'safadas', 'paspalho',

  // --- Siglas e Abreviações Ofensivas ---
  'fdp', 'vtnc', 'vsf', 'pqp', 'tnc', 'tmnc', 'krl', 'krlh', 'crl', 'prr',

  // --- Termos em Inglês / Internacionais ---
  'fuck', 'fucking', 'fucker', 'motherfucker', 'shit', 'bitch', 'bitches', 'asshole', 'dick', 'pussy', 'cunt', 'cock', 'whore', 'slut', 'bastard', 'nigger', 'nigga', 'faggot', 'fag', 'stfu', 'wtf'
];

// 2. Frases e Expressões Compostas (incluindo ataques racistas, homofóbicos e sexuais)
const FORBIDDEN_PHRASES_LIST = [
  // Expressões sexuais e palavrões compostos
  'filho da puta', 'filha da puta', 'filhos da puta', 'filhas da puta',
  'vai se foder', 'vai se fuder', 'vai tomar no cu', 'vai toma no cu', 'tomar no cu', 'toma no cu', 'tomarnocu',
  'vai pra merda', 'vai pro inferno', 'vai se lascar', 'va se foder', 'va se fuder',
  'chupa meu', 'chupa minha', 'chupar pau', 'chupa pau', 'chupa rola', 'chupar rola', 'chupa meu pau', 'chupa minha pica', 'chupar pinto', 'chupa pinto',
  'casa do caralho', 'puta que pariu', 'puta que te pariu', 'puta que pariu',
  'mama aqui', 'me chupa', 'chupa aqui', 'lambe meu', 'lambe minha', 'enfia no cu', 'enfiar no cu',
  'pau no cu', 'pau no seu cu', 'dar o cu', 'deu o cu',

  // Expressões Homofóbicas e de Discriminação
  'morte aos gays', 'mata gay', 'matar gay', 'gay de merda', 'morte a gay', 'cura gay', 'viado de merda', 'aberracao da natureza', 'aberracao',

  // Expressões Racistas e Supremacistas
  'preto fedido', 'preta fedida', 'negro imundo', 'negra imunda', 'preto imundo', 'preta imunda',
  'cabelo de bombril', 'volta pra senzala', 'volta para a senzala', 'cabelo de piaçava',
  'white power', 'supremacia branca', 'heil hitler', 'morte aos pretos', 'morte aos negros', 'morte aos judeus', 'judeu de merda', 'judeus de merda', 'ku klux klan'
];

// 3. Padrões Regex com limites de palavra ou radicais
const FORBIDDEN_PATTERNS: RegExp[] = [
  // Buceta e derivados
  /\bb[u|o]c[e|3]t\w*/i,
  /\bbct\b/i,
  /\bppk\b/i,
  /\bxoxot\w*/i,
  /\bxan[a|i]nh[a|o]\b/i,

  // Pica e derivados
  /\bp[i|1]k[a|i]\w*/i,
  /\bp[i|1]c[a|i]\w*/i,

  // Bunda e derivados
  /\bbund[a|o|i]\w*/i,

  // Caralho e variações
  /\bc[a|@]r[a|@]lh\w*/i,
  /\bk[a|@]r[a|@]lh\w*/i,
  /\bg[a|@]r[a|@]lh\w*/i,
  /\bcrl\b/i,
  /\bkrl\b/i,
  /\bkrlh\b/i,

  // Foda e derivados
  /\bf[o|u]d[e|a|i|o]\w*/i,
  /\bfdp\b/i,

  // Puta e derivados
  /\bp[u|0]t[a|o]\w*/i,

  // Porra
  /\bp[o|0]rr\w*/i,

  // Viado / Boiola / Traveco
  /\bv[i|e][a|@]d\w*/i,
  /\bb[o|0][i|1][o|0]l\w*/i,
  /\bb[a|@]it[o|0]l\w*/i,
  /\btr[a|@]v[e|3]c\w*/i,

  // Cu e compostos
  /\bc[u|z][z|s][a|o]\w*/i,
  /\bcu\b/i,

  // Arrombado
  /\b[a|@]rr[o|0]mb\w*/i,

  // Retardado / Capacitismo
  /\br[e|3]t[a|@]rd\w*/i,
  /\bm[o|0]ng[o|0]l\w*/i,

  // Racismo
  /\bm[a|@]c[a|@]c[a|o]s?\b/i,
  /\bcr[i|1][o|0]ul\w*/i,

  // Nazismo
  /\bn[a|@]z[i|1]st\w*/i,
  /\bh[i|1]tl[e|3]r\b/i
];

/**
 * Normaliza um texto para detecção de termos ocultos (leetspeak, acentos, repetições)
 */
function normalizeText(text: string): string {
  if (!text) return '';

  let normalized = text.toLowerCase();

  // 1. Remove acentuações e caracteres diacríticos
  normalized = normalized.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // 2. Substituições de leetspeak comuns
  normalized = normalized
    .replace(/[@4]/g, 'a')
    .replace(/[3]/g, 'e')
    .replace(/[1!|]/g, 'i')
    .replace(/[0]/g, 'o')
    .replace(/[$5]/g, 's')
    .replace(/[7+]/g, 't')
    .replace(/[8]/g, 'b');

  // 3. Reduz caracteres repetidos consecutivos (ex: "poooorra" -> "porra", "fuuuuck" -> "fuck", "piiiica" -> "pica")
  normalized = normalized.replace(/(.)\1{2,}/g, '$1$1');

  return normalized;
}

/**
 * Normalização compactada (remove espaços e pontuações para pegar palavras soletradas como "p.i.c.a" ou "b u n d a")
 */
function compactText(text: string): string {
  const norm = normalizeText(text);
  return norm.replace(/[^a-z0-9]/g, '');
}

/**
 * Exceções de palavras legítimas que contêm radicais mas NÃO são ofensivas
 */
const SAFE_EXCEPTIONS = [
  'computador', 'computadores', 'computacao', 'computação',
  'disputa', 'disputar', 'disputado', 'disputas',
  'deputado', 'deputada', 'deputados', 'deputadas',
  'reputacao', 'reputação', 'reputado',
  'imputacao', 'imputação',
  'capitulo', 'capítulo', 'capitulos',
  'picasso', 'pablo picasso', 'picardia', 'pica-pau', 'picapau',
  'segunda', 'segunda-feira', 'abundancia', 'abundância', 'abundante', 'fundacao', 'fundação',
  'educacao', 'educação', 'curriculo', 'currículo', 'cultura', 'documento'
];

/**
 * Verifica se um texto contém palavras ou expressões obscenas, homofóbicas, racistas ou ofensivas
 */
export function containsProfanity(text: string): boolean {
  if (!text || typeof text !== 'string') return false;

  const normalized = normalizeText(text);
  const compacted = compactText(text);

  // 1. Verifica frases e expressões compostas no texto normalizado
  for (const phrase of FORBIDDEN_PHRASES_LIST) {
    const normPhrase = normalizeText(phrase);
    if (normalized.includes(normPhrase)) {
      return true;
    }
  }

  // 2. Extrai palavras individuais isoladas
  const cleanTokens = normalized.replace(/[^\w\s-]/g, ' ').split(/\s+/).filter(Boolean);

  for (const token of cleanTokens) {
    // Se o token for uma palavra segura legítima, pula
    if (SAFE_EXCEPTIONS.includes(token)) {
      continue;
    }

    // Normalização sem repetições duplas (ex: "buunda" -> "bunda", "piica" -> "pica")
    const collapsedToken = token.replace(/(.)\1+/g, '$1');

    for (const badWord of FORBIDDEN_WORDS_LIST) {
      const normBad = normalizeText(badWord);
      const collapsedBad = normBad.replace(/(.)\1+/g, '$1');

      if (token === normBad || collapsedToken === collapsedBad) {
        return true;
      }
    }
  }

  // 3. Verifica padrões Regex para radicais e flexões
  for (const pattern of FORBIDDEN_PATTERNS) {
    // Testa contra tokens para evitar falsos positivos
    for (const token of cleanTokens) {
      if (SAFE_EXCEPTIONS.includes(token)) continue;
      if (pattern.test(token)) {
        return true;
      }
    }
    // Testa também contra a frase inteira
    if (pattern.test(normalized)) {
      // Garante que não é apenas uma exceção segura isolada
      const matches = normalized.match(pattern);
      if (matches && matches.length > 0) {
        const match = matches[0].toLowerCase();
        if (!SAFE_EXCEPTIONS.some(ex => ex.includes(match))) {
          return true;
        }
      }
    }
  }

  // 4. Teste em texto compactado (para pegar "p.i.c.a", "b-u-n-d-a", "b u c e t a", "v_i_a_d_o")
  for (const badWord of ['pica', 'bunda', 'buceta', 'caralho', 'porra', 'viado', 'puta', 'foda', 'boiola', 'traveco', 'arrombado', 'macaco']) {
    const normBad = normalizeText(badWord);
    if (compacted.includes(normBad)) {
      // Se não for parte de uma palavra segura
      const isSafe = SAFE_EXCEPTIONS.some(ex => compactText(ex).includes(normBad));
      if (!isSafe) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Encontra quais termos ofensivos foram identificados no texto (para auditoria)
 */
export function findProfanities(text: string): string[] {
  if (!text) return [];

  const found: string[] = [];
  const normalized = normalizeText(text);

  for (const phrase of FORBIDDEN_PHRASES_LIST) {
    if (normalized.includes(normalizeText(phrase))) {
      found.push(phrase);
    }
  }

  const cleanTokens = normalized.replace(/[^\w\s-]/g, ' ').split(/\s+/).filter(Boolean);

  for (const token of cleanTokens) {
    if (SAFE_EXCEPTIONS.includes(token)) continue;
    const collapsedToken = token.replace(/(.)\1+/g, '$1');

    for (const badWord of FORBIDDEN_WORDS_LIST) {
      const normBad = normalizeText(badWord);
      const collapsedBad = normBad.replace(/(.)\1+/g, '$1');

      if (token === normBad || collapsedToken === collapsedBad) {
        if (!found.includes(badWord)) {
          found.push(badWord);
        }
      }
    }
  }

  return found;
}

export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
  flaggedFields: string[];
}

/**
 * Valida todos os campos de uma sugestão de livro contra linguagem imprópria,
 * racismo, homofobia, palavrões ou termos obscenos.
 */
export function validateBookSuggestion(data: {
  studentName: string;
  bookTitle: string;
  author: string;
  reason?: string;
}): ValidationResult {
  const flaggedFields: string[] = [];

  if (containsProfanity(data.studentName)) {
    flaggedFields.push('studentName');
  }

  if (containsProfanity(data.bookTitle)) {
    flaggedFields.push('bookTitle');
  }

  if (containsProfanity(data.author)) {
    flaggedFields.push('author');
  }

  if (data.reason && containsProfanity(data.reason)) {
    flaggedFields.push('reason');
  }

  if (flaggedFields.length > 0) {
    return {
      isValid: false,
      flaggedFields,
      errorMessage:
        'Aviso de Moderação Escolar: O texto contém termos inadequados, obscenos, preconceituosos (racismo, homofobia) ou ofensivos. Por favor, mantenha uma linguagem respeitosa adequada ao ambiente escolar da Biblioteca Maria Quitéria.',
    };
  }

  return {
    isValid: true,
    flaggedFields: [],
  };
}
