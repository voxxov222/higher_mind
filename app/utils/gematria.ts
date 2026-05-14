
/**
 * Gematria Utility Service
 * Implements various ciphers and reduction methods as seen on Gematrinator.com
 */

export type GematriaCipher = 
  | 'Ordinal' 
  | 'Reduction' 
  | 'Reverse' 
  | 'Reverse Reduction' 
  | 'Standard' 
  | 'Latin' 
  | 'Sumerian' 
  | 'Reverse Sumerian' 
  | 'Jewish'
  | 'Francis Bacon'
  | 'Satanic' 
  | 'Reverse Satanic' 
  | 'Chaldean' 
  | 'Septenary' 
  | 'Keypad' 
  | 'Primes' 
  | 'Trigonal' 
  | 'Squares' 
  | 'Fibonacci'
  | 'Pythagorean'
  | 'Hebrew'
  | 'ASCII';

export interface GematriaResult {
  cipher: GematriaCipher;
  value: number;
  breakdown: string;
}

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz';

// Cipher Mappings
const PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101];

const getTrigonal = (n: number) => (n * (n + 1)) / 2;

const getFibonacci = (n: number) => {
  let a = 1, b = 1;
  for (let i = 3; i <= n; i++) {
    const temp = a + b;
    a = b;
    b = temp;
  }
  return b;
};

const getChaldeanValue = (char: string) => {
  const mapping: Record<string, number> = {
    'a': 1, 'b': 2, 'c': 3, 'd': 4, 'e': 5, 'f': 8, 'g': 3, 'h': 5, 'i': 1, 'j': 1, 
    'k': 2, 'l': 3, 'm': 4, 'n': 5, 'o': 7, 'p': 8, 'q': 1, 'r': 2, 's': 3, 't': 4, 
    'u': 6, 'v': 6, 'w': 6, 'x': 5, 'y': 1, 'z': 7
  };
  return mapping[char] || 0;
};

const getJewishMapping = (char: string): number => {
  const mapping: Record<string, number> = {
    'a': 1, 'b': 2, 'c': 3, 'd': 4, 'e': 5, 'f': 6, 'g': 7, 'h': 8, 'i': 9,
    'j': 600, 'k': 10, 'l': 20, 'm': 30, 'n': 40, 'o': 50, 'p': 60, 'q': 70, 'r': 80, 's': 90,
    't': 100, 'u': 200, 'v': 700, 'w': 900, 'x': 300, 'y': 400, 'z': 500
  };
  return mapping[char] || 0;
};

const getSeptenaryValue = (idx: number) => {
  // A=1...G=7, H=6...M=1, N=1...T=7, U=6...Z=1
  const cycle = [1, 2, 3, 4, 5, 6, 7, 6, 5, 4, 3, 2, 1];
  return cycle[idx % 13];
};

const getKeypadValue = (char: string) => {
  if ('abc'.includes(char)) return 2;
  if ('def'.includes(char)) return 3;
  if ('ghi'.includes(char)) return 4;
  if ('jkl'.includes(char)) return 5;
  if ('mno'.includes(char)) return 6;
  if ('pqrs'.includes(char)) return 7;
  if ('tuv'.includes(char)) return 8;
  if ('wxyz'.includes(char)) return 9;
  return 0;
};

export const reduceNumber = (num: number, masterNumbers: number[] = [11, 22, 33]): number => {
  if (num <= 9 || masterNumbers.includes(num)) return num;
  const reduced = String(num).split('').reduce((acc, digit) => acc + parseInt(digit), 0);
  return reduceNumber(reduced, masterNumbers);
};

export const calculateGematriaValue = (text: string, cipher: GematriaCipher): number => {
  const cleanText = text;

  if (cipher === 'ASCII') {
    return cleanText.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  }

  if (cipher === 'Hebrew') {
    const hebrewMap: Record<string, number> = {
      'א': 1, 'ב': 2, 'ג': 3, 'ד': 4, 'ה': 5, 'ו': 6, 'ז': 7, 'ח': 8, 'ט': 9,
      'י': 10, 'כ': 20, 'ל': 30, 'מ': 40, 'נ': 50, 'ס': 60, 'ע': 70, 'פ': 80, 'צ': 90,
      'ק': 100, 'ר': 200, 'ש': 300, 'ת': 400,
      'ך': 500, 'ם': 600, 'ן': 700, 'ף': 800, 'ץ': 900
    };
    return cleanText.split('').reduce((acc, char) => acc + (hebrewMap[char] || 0), 0);
  }
  
  return cleanText.split('').reduce((acc, char) => {
    const lowerChar = char.toLowerCase();
    const idx = ALPHABET.indexOf(lowerChar);
    const revIdx = 25 - idx;
    
    if (idx === -1) return acc;

    switch (cipher) {
      case 'Ordinal':
        return acc + (idx + 1);
      case 'Reduction':
      case 'Pythagorean':
        return acc + (((idx + 0) % 9) + 1);
      case 'Reverse':
        return acc + (revIdx + 1);
      case 'Reverse Reduction':
        return acc + (((revIdx + 0) % 9) + 1);
      case 'Sumerian':
        return acc + (idx + 1) * 6;
      case 'Reverse Sumerian':
        return acc + (revIdx + 1) * 6;
      case 'Jewish':
        return acc + getJewishMapping(lowerChar);
      case 'Francis Bacon': {
        const isUpper = char === char.toUpperCase() && char !== char.toLowerCase();
        return acc + (idx + 1) + (isUpper ? 26 : 0);
      }
      case 'Satanic':
        return acc + (idx + 36);
      case 'Reverse Satanic':
        return acc + (revIdx + 36);
      case 'Chaldean':
        return acc + getChaldeanValue(lowerChar);
      case 'Septenary':
        return acc + getSeptenaryValue(idx);
      case 'Keypad':
        return acc + getKeypadValue(lowerChar);
      case 'Primes':
        return acc + PRIMES[idx];
      case 'Trigonal':
        return acc + getTrigonal(idx + 1);
      case 'Squares':
        return acc + Math.pow(idx + 1, 2);
      case 'Fibonacci':
        return acc + getFibonacci(idx + 1);
      case 'Standard': {
        const values = [1,2,3,4,5,6,7,8,9,600,10,20,30,40,50,60,70,80,90,100,200,700,900,300,400,500];
        return acc + values[idx];
      }
      case 'Latin': {
        const values = [1,2,3,4,5,6,7,8,9,9,10,20,30,40,50,60,70,80,90,100,200,200,500,300,400,500];
        return acc + values[idx];
      }
      default:
        return acc;
    }
  }, 0);
};

export const calculateAllCiphers = (text: string): GematriaResult[] => {
  const ciphers: GematriaCipher[] = [
    'Ordinal', 'Reduction', 'Reverse', 'Reverse Reduction', 
    'Jewish', 'Francis Bacon',
    'Standard', 'Latin', 'Sumerian', 'Reverse Sumerian', 
    'Satanic', 'Reverse Satanic', 'Chaldean', 'Septenary', 
    'Keypad', 'Primes', 'Trigonal', 'Squares', 'Fibonacci',
    'Pythagorean', 'Hebrew', 'ASCII'
  ];

  return ciphers.map(cipher => ({
    cipher,
    value: calculateGematriaValue(text, cipher),
    breakdown: ''
  }));
};
