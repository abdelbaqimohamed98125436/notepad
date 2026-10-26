import { CursorPosition } from '../types/index.ts';

/**
 * Calculates 1-indexed Line and Column from a text string and a 0-indexed cursor position.
 */
export function calculateCursorPosition(text: string, cursorIndex: number, selectionLength: number = 0): CursorPosition {
  const boundedIndex = Math.max(0, Math.min(cursorIndex, text.length));
  const textBefore = text.slice(0, boundedIndex);
  const linesBefore = textBefore.split('\n');
  const line = linesBefore.length;
  const currentLineText = linesBefore[linesBefore.length - 1] ?? '';
  const column = currentLineText.length + 1;

  const totalLines = text.split('\n').length;
  // Word count (supports Arabic & English & other unicode scripts)
  const words = text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = text.length;

  return {
    line,
    column,
    selectionLength,
    lineCount: totalLines,
    wordCount: words,
    charCount,
  };
}

/**
 * Detects whether a string is predominantly Right-to-Left (e.g. Arabic, Hebrew)
 */
export function isRTL(text: string): boolean {
  if (!text) return false;
  // Match Arabic, Hebrew, Syriac, Thaana, Samaritan, Mandaic, etc.
  const rtlChars = text.match(/[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]/g);
  const ltrChars = text.match(/[A-Za-z\u00C0-\u024F\u0370-\u052F]/g);

  const rtlCount = rtlChars ? rtlChars.length : 0;
  const ltrCount = ltrChars ? ltrChars.length : 0;

  return rtlCount > ltrCount;
}

/**
 * Escapes special regex characters in a query string
 */
export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export interface SearchMatch {
  index: number;
  length: number;
  line: number;
  column: number;
}

/**
 * Finds all occurrences of a search string in text.
 */
export function findAllMatches(
  text: string,
  query: string,
  options: { matchCase: boolean } = { matchCase: false }
): SearchMatch[] {
  if (!query) return [];

  const flags = options.matchCase ? 'g' : 'gi';
  const escaped = escapeRegExp(query);
  const regex = new RegExp(escaped, flags);
  const matches: SearchMatch[] = [];

  let m;
  while ((m = regex.exec(text)) !== null) {
    const pos = calculateCursorPosition(text, m.index);
    matches.push({
      index: m.index,
      length: query.length,
      line: pos.line,
      column: pos.column,
    });
  }

  return matches;
}

/**
 * Replaces the next match after cursorIndex or wrapped
 */
export function replaceNextMatch(
  text: string,
  query: string,
  replacement: string,
  cursorIndex: number,
  options: { matchCase: boolean; wrapAround?: boolean } = { matchCase: false, wrapAround: true }
): { newText: string; matchIndex: number; replaced: boolean } {
  if (!query) return { newText: text, matchIndex: -1, replaced: false };

  const matches = findAllMatches(text, query, options);
  if (matches.length === 0) return { newText: text, matchIndex: -1, replaced: false };

  // Find the first match at or after cursorIndex
  let targetMatch = matches.find((m) => m.index >= cursorIndex);
  if (!targetMatch && options.wrapAround) {
    targetMatch = matches[0];
  }

  if (!targetMatch) return { newText: text, matchIndex: -1, replaced: false };

  const newText =
    text.slice(0, targetMatch.index) +
    replacement +
    text.slice(targetMatch.index + targetMatch.length);

  return {
    newText,
    matchIndex: targetMatch.index,
    replaced: true,
  };
}

/**
 * Replaces all occurrences of query in text
 */
export function replaceAllMatches(
  text: string,
  query: string,
  replacement: string,
  options: { matchCase: boolean } = { matchCase: false }
): { newText: string; count: number } {
  if (!query) return { newText: text, count: 0 };

  const flags = options.matchCase ? 'g' : 'gi';
  const regex = new RegExp(escapeRegExp(query), flags);
  let count = 0;
  const newText = text.replace(regex, () => {
    count++;
    return replacement;
  });

  return { newText, count };
}

/**
 * Normalizes line endings to CRLF or LF
 */
export function normalizeLineEndings(text: string, ending: 'CRLF' | 'LF'): string {
  const unified = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  if (ending === 'CRLF') {
    return unified.replace(/\n/g, '\r\n');
  }
  return unified;
}

/**
 * Detects current dominant line ending in text
 */
export function detectLineEnding(text: string): 'CRLF' | 'LF' {
  const crlfCount = (text.match(/\r\n/g) || []).length;
  const lfCount = (text.match(/[^\r]\n/g) || []).length;
  return crlfCount >= lfCount && crlfCount > 0 ? 'CRLF' : 'LF';
}
