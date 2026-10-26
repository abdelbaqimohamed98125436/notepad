import { DiffPart, DiffResult } from '../types/index.ts';

/**
 * Tokenizes text into words, punctuation, and whitespace tokens
 * preserving all formatting and exact character sequences.
 */
export function tokenizeWords(text: string): string[] {
  if (!text) return [];
  const regex = /([^\s\w]+|\w+|\s+)/gu;
  const tokens: string[] = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    tokens.push(match[0]);
  }
  return tokens.length > 0 ? tokens : [text];
}

/**
 * Computes the Longest Common Subsequence (LCS) matrix
 * for two arrays of tokens.
 */
function computeLCS(tokensA: string[], tokensB: string[]): number[][] {
  const m = tokensA.length;
  const n = tokensB.length;
  // Initialize matrix with 0s
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (tokensA[i] === tokensB[j]) {
        dp[i + 1][j + 1] = dp[i][j] + 1;
      } else {
        dp[i + 1][j + 1] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
  }

  return dp;
}

/**
 * Computes word-level diff between original and replacement text.
 * Returns structured parts (unchanged, added, removed).
 */
export function computeWordDiff(original: string, replacement: string): DiffResult {
  if (original === replacement) {
    return {
      parts: original ? [{ type: 'unchanged', value: original }] : [],
      additionsCount: 0,
      deletionsCount: 0,
      hasChanges: false,
    };
  }

  const tokensA = tokenizeWords(original);
  const tokensB = tokenizeWords(replacement);
  const dp = computeLCS(tokensA, tokensB);

  const rawParts: DiffPart[] = [];
  let i = tokensA.length;
  let j = tokensB.length;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && tokensA[i - 1] === tokensB[j - 1]) {
      rawParts.push({ type: 'unchanged', value: tokensA[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      rawParts.push({ type: 'added', value: tokensB[j - 1] });
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      rawParts.push({ type: 'removed', value: tokensA[i - 1] });
      i--;
    }
  }

  rawParts.reverse();

  // Merge consecutive parts of the same type for clean rendering
  const mergedParts: DiffPart[] = [];
  let additionsCount = 0;
  let deletionsCount = 0;

  for (const part of rawParts) {
    if (part.type === 'added') additionsCount += part.value.length;
    if (part.type === 'removed') deletionsCount += part.value.length;

    const last = mergedParts[mergedParts.length - 1];
    if (last && last.type === part.type) {
      last.value += part.value;
    } else {
      mergedParts.push({ ...part });
    }
  }

  return {
    parts: mergedParts,
    additionsCount,
    deletionsCount,
    hasChanges: additionsCount > 0 || deletionsCount > 0,
  };
}

/**
 * Computes line-level diff useful for whole-document reviews.
 */
export function computeLineDiff(original: string, replacement: string): DiffResult {
  const linesA = original.split(/\r?\n/);
  const linesB = replacement.split(/\r?\n/);
  const dp = computeLCS(linesA, linesB);

  const rawParts: DiffPart[] = [];
  let i = linesA.length;
  let j = linesB.length;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && linesA[i - 1] === linesB[j - 1]) {
      rawParts.push({ type: 'unchanged', value: linesA[i - 1] + '\n' });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      rawParts.push({ type: 'added', value: linesB[j - 1] + '\n' });
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      rawParts.push({ type: 'removed', value: linesA[i - 1] + '\n' });
      i--;
    }
  }

  rawParts.reverse();

  let additions = 0;
  let deletions = 0;
  const merged: DiffPart[] = [];

  for (const part of rawParts) {
    if (part.type === 'added') additions++;
    if (part.type === 'removed') deletions++;

    const last = merged[merged.length - 1];
    if (last && last.type === part.type) {
      last.value += part.value;
    } else {
      merged.push({ ...part });
    }
  }

  return {
    parts: merged,
    additionsCount: additions,
    deletionsCount: deletions,
    hasChanges: additions > 0 || deletions > 0,
  };
}
