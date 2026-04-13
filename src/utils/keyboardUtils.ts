const HANGUL_BASE = 0xac00;
const HANGUL_END = 0xd7a3;

// prettier-ignore
const INITIAL_CONSONANTS: string[] = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
// prettier-ignore
const MEDIAL_VOWELS: string[] = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'];
// prettier-ignore
const FINAL_CONSONANTS: string[] = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];

// 겹받침 결합
const COMPLEX_FINAL_FROM_PAIR: Record<string, string> = {
  ㄱㅅ: 'ㄳ',
  ㄴㅈ: 'ㄵ',
  ㄴㅎ: 'ㄶ',
  ㄹㄱ: 'ㄺ',
  ㄹㅁ: 'ㄻ',
  ㄹㅂ: 'ㄼ',
  ㄹㅅ: 'ㄽ',
  ㄹㅌ: 'ㄾ',
  ㄹㅍ: 'ㄿ',
  ㄹㅎ: 'ㅀ',
  ㅂㅅ: 'ㅄ'
};

// 겹받침 분해
const COMPLEX_FINAL_SPLIT: Record<string, [string, string]> = {
  ㄳ: ['ㄱ', 'ㅅ'],
  ㄵ: ['ㄴ', 'ㅈ'],
  ㄶ: ['ㄴ', 'ㅎ'],
  ㄺ: ['ㄹ', 'ㄱ'],
  ㄻ: ['ㄹ', 'ㅁ'],
  ㄼ: ['ㄹ', 'ㅂ'],
  ㄽ: ['ㄹ', 'ㅅ'],
  ㄾ: ['ㄹ', 'ㅌ'],
  ㄿ: ['ㄹ', 'ㅍ'],
  ㅀ: ['ㄹ', 'ㅎ'],
  ㅄ: ['ㅂ', 'ㅅ']
};

// 복합모음 결합
const COMPLEX_MEDIAL_FROM_PAIR: Record<string, string> = {
  ㅗㅏ: 'ㅘ',
  ㅗㅐ: 'ㅙ',
  ㅗㅣ: 'ㅚ',
  ㅜㅓ: 'ㅝ',
  ㅜㅔ: 'ㅞ',
  ㅜㅣ: 'ㅟ',
  ㅡㅣ: 'ㅢ'
};

const INITIAL_INDEX = new Map(INITIAL_CONSONANTS.map((char, index) => [char, index]));
const VOWEL_INDEX = new Map(MEDIAL_VOWELS.map((char, index) => [char, index]));
const FINAL_INDEX = new Map(FINAL_CONSONANTS.map((char, index) => [char, index]));

type SyllableParts = {
  initialIndex: number;
  medialIndex: number;
  finalIndex: number;
};

const createComposeResult = (nextLeft: string, right: string) => {
  return {
    nextValue: nextLeft + right,
    nextCursorIndex: nextLeft.length
  };
};

const isHangulSyllable = (char: string) => {
  if (!char) return false;
  const code = char.charCodeAt(0);
  return code >= HANGUL_BASE && code <= HANGUL_END;
};

const decomposeSyllable = (char: string) => {
  if (!isHangulSyllable(char)) return null;

  const syllableIndex = char.charCodeAt(0) - HANGUL_BASE;
  const initialIndex = Math.floor(syllableIndex / (MEDIAL_VOWELS.length * FINAL_CONSONANTS.length));
  const medialIndex = Math.floor((syllableIndex % (MEDIAL_VOWELS.length * FINAL_CONSONANTS.length)) / FINAL_CONSONANTS.length);
  const finalIndex = syllableIndex % FINAL_CONSONANTS.length;

  return { initialIndex, medialIndex, finalIndex };
};

const composeSyllable = (initialIndex: number, medialIndex: number, finalIndex = 0) => {
  const code = HANGUL_BASE + (initialIndex * MEDIAL_VOWELS.length + medialIndex) * FINAL_CONSONANTS.length + finalIndex;
  return String.fromCharCode(code);
};

// 자음(초성) + 모음(중성)
const composeOnConsonantVowel = (left: string, right: string, prevChar: string, vowelIndex: number | undefined) => {
  if (vowelIndex == null) return null;

  const initialIndex = INITIAL_INDEX.get(prevChar);
  if (initialIndex == null) return null;

  const composed = composeSyllable(initialIndex, vowelIndex);
  return createComposeResult(left.slice(0, -1) + composed, right);
};

// 복합중성
const composeOnVowelMerge = (left: string, right: string, parts: SyllableParts | null, vowelKey: string) => {
  if (!parts || parts.finalIndex !== 0) return null;

  const currentMedial = MEDIAL_VOWELS[parts.medialIndex];
  const combinedMedial = COMPLEX_MEDIAL_FROM_PAIR[`${currentMedial}${vowelKey}`];
  if (!combinedMedial) return null;

  const combinedMedialIndex = VOWEL_INDEX.get(combinedMedial);
  if (combinedMedialIndex == null) return null;

  const composed = composeSyllable(parts.initialIndex, combinedMedialIndex);
  return createComposeResult(left.slice(0, -1) + composed, right);
};

// 받침 이동
const composeOnFinalShift = (left: string, right: string, parts: SyllableParts | null, vowelIndex: number | undefined) => {
  if (!parts || parts.finalIndex === 0 || vowelIndex == null) return null;

  const finalChar = FINAL_CONSONANTS[parts.finalIndex];
  const splitFinal = COMPLEX_FINAL_SPLIT[finalChar];

  const remainFinalChar = splitFinal ? splitFinal[0] : '';
  const moveInitialChar = splitFinal ? splitFinal[1] : finalChar;
  const movedInitialIndex = INITIAL_INDEX.get(moveInitialChar);
  if (movedInitialIndex == null) return null;

  const remainFinalIndex = FINAL_INDEX.get(remainFinalChar) ?? 0;
  const prevSyllable = composeSyllable(parts.initialIndex, parts.medialIndex, remainFinalIndex);
  const nextSyllable = composeSyllable(movedInitialIndex, vowelIndex);

  return createComposeResult(left.slice(0, -1) + prevSyllable + nextSyllable, right);
};

// 종성 적용
const composeOnFinalAttach = (
  left: string,
  right: string,
  parts: SyllableParts | null,
  finalConsonant: string,
  finalIndexFromKey: number
) => {
  if (!parts || finalIndexFromKey <= 0) return null;

  if (parts.finalIndex === 0) {
    const composed = composeSyllable(parts.initialIndex, parts.medialIndex, finalIndexFromKey);
    return createComposeResult(left.slice(0, -1) + composed, right);
  }

  const currentFinal = FINAL_CONSONANTS[parts.finalIndex];
  const combinedFinal = COMPLEX_FINAL_FROM_PAIR[`${currentFinal}${finalConsonant}`];
  if (!combinedFinal) return null;

  const combinedIndex = FINAL_INDEX.get(combinedFinal);
  if (combinedIndex == null) return null;

  const composed = composeSyllable(parts.initialIndex, parts.medialIndex, combinedIndex);
  return createComposeResult(left.slice(0, -1) + composed, right);
};

// 한글 결합
export const composeKoreanInput = (inputValue: string, selectionStart: number, selectionEnd: number, pressedKey: string) => {
  const left = inputValue.slice(0, selectionStart);
  const right = inputValue.slice(selectionEnd);
  const prevChar = left.slice(-1);
  if (!prevChar) return createComposeResult(left + pressedKey, right);

  const vowelIndex = VOWEL_INDEX.get(pressedKey);
  const finalIndexFromKey = FINAL_INDEX.get(pressedKey) ?? 0;
  const prevParts = decomposeSyllable(prevChar);

  if (vowelIndex != null) {
    const composedOnConsonantVowel = composeOnConsonantVowel(left, right, prevChar, vowelIndex);
    if (composedOnConsonantVowel) return composedOnConsonantVowel;

    const composedOnVowelMerge = composeOnVowelMerge(left, right, prevParts, pressedKey);
    if (composedOnVowelMerge) return composedOnVowelMerge;

    const composedOnFinalShift = composeOnFinalShift(left, right, prevParts, vowelIndex);
    if (composedOnFinalShift) return composedOnFinalShift;
  }

  if (vowelIndex == null && finalIndexFromKey > 0) {
    const composedOnFinalAttach = composeOnFinalAttach(left, right, prevParts, pressedKey, finalIndexFromKey);
    if (composedOnFinalAttach) return composedOnFinalAttach;
  }

  return createComposeResult(left + pressedKey, right);
};

export const checkKoreanInput = (value: string) => INITIAL_INDEX.has(value) || VOWEL_INDEX.has(value);
