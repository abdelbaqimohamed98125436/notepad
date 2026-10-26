import test from 'node:test';
import assert from 'node:assert/strict';
import { computeWordDiff, computeLineDiff } from './diff.ts';
import {
  calculateCursorPosition,
  isRTL,
  findAllMatches,
  replaceNextMatch,
  replaceAllMatches,
  normalizeLineEndings,
  detectLineEnding,
} from './textUtils.ts';
import { EditorHistory } from './history.ts';
import { buildSystemInstruction, buildUserPrompt } from './promptBuilder.ts';

test('diff: computes word additions, deletions, and unchanged parts', () => {
  const original = 'The quick brown fox jumps.';
  const replacement = 'The fast brown fox leaps.';
  const diff = computeWordDiff(original, replacement);

  assert.equal(diff.hasChanges, true);
  assert.ok(diff.additionsCount > 0);
  assert.ok(diff.deletionsCount > 0);

  const partsText = diff.parts.map((p) => p.value).join('');
  // All original and added pieces should be represented
  assert.ok(diff.parts.some((p) => p.type === 'removed' && p.value.includes('quick')));
  assert.ok(diff.parts.some((p) => p.type === 'added' && p.value.includes('fast')));
});

test('diff: handles identical text without spurious changes', () => {
  const text = 'Identical document content.';
  const diff = computeWordDiff(text, text);
  assert.equal(diff.hasChanges, false);
  assert.equal(diff.additionsCount, 0);
  assert.equal(diff.deletionsCount, 0);
  assert.equal(diff.parts[0]?.value, text);
});

test('diff: handles Arabic bidirectional text diffing', () => {
  const original = 'المفكرة الهادئة سريعة وجميلة';
  const replacement = 'المفكرة الهادئة فائقة السرعة وجميلة';
  const diff = computeWordDiff(original, replacement);
  assert.equal(diff.hasChanges, true);
  assert.ok(diff.parts.some((p) => p.type === 'added' && p.value.includes('فائقة')));
});

test('textUtils: calculateCursorPosition calculates Line and Column accurately', () => {
  const text = 'Line 1\nLine 2 text\nLine 3';
  // Position right before 'text' on line 2 (index 7 + 7 = 14)
  const pos = calculateCursorPosition(text, 14);
  assert.equal(pos.line, 2);
  assert.equal(pos.column, 8);
  assert.equal(pos.lineCount, 3);
  assert.equal(pos.wordCount, 7);
});

test('textUtils: isRTL detects Arabic vs English text', () => {
  assert.equal(isRTL('Hello world, this is English.'), false);
  assert.equal(isRTL('مرحبا بكم في المفكرة الهادئة'), true);
  // Mixed text with predominantly Arabic
  assert.equal(isRTL('هذا النص العربي يحتوي كلمة algorithm في وسطه'), true);
});

test('textUtils: findAllMatches and replaceNextMatch and replaceAllMatches', () => {
  const text = 'Hello world, hello universe, hello everyone.';
  const matchesCaseInsensitive = findAllMatches(text, 'hello', { matchCase: false });
  assert.equal(matchesCaseInsensitive.length, 3);

  const matchesCaseSensitive = findAllMatches(text, 'hello', { matchCase: true });
  assert.equal(matchesCaseSensitive.length, 2);

  const replacedNext = replaceNextMatch(text, 'hello', 'greetings', 0, { matchCase: false });
  assert.equal(replacedNext.replaced, true);
  assert.equal(replacedNext.newText.startsWith('greetings world'), true);

  const replacedAll = replaceAllMatches(text, 'hello', 'hi', { matchCase: false });
  assert.equal(replacedAll.count, 3);
  assert.equal(replacedAll.newText, 'hi world, hi universe, hi everyone.');
});

test('textUtils: line endings normalization and detection', () => {
  const lfText = 'Line 1\nLine 2\nLine 3';
  const crlfText = normalizeLineEndings(lfText, 'CRLF');
  assert.equal(detectLineEnding(crlfText), 'CRLF');
  assert.equal(crlfText, 'Line 1\r\nLine 2\r\nLine 3');

  const reverted = normalizeLineEndings(crlfText, 'LF');
  assert.equal(detectLineEnding(reverted), 'LF');
  assert.equal(reverted, lfText);
});

test('history: undo and redo work with snapshot preservation', () => {
  const history = new EditorHistory();
  const snap1 = { content: 'Version 1', selectionStart: 0, selectionEnd: 0, timestamp: 100 };
  const snap2 = { content: 'Version 2', selectionStart: 9, selectionEnd: 9, timestamp: 200 };
  const snap3 = { content: 'Version 3', selectionStart: 9, selectionEnd: 9, timestamp: 300 };

  history.push(snap1);
  history.push(snap2);

  assert.equal(history.canUndo(), true);
  assert.equal(history.canRedo(), false);

  const undone = history.undo(snap3);
  assert.equal(undone?.content, 'Version 2');
  assert.equal(history.canRedo(), true);

  const redone = history.redo(undone!);
  assert.equal(redone?.content, 'Version 3');
});

test('promptBuilder: constructs strict system instruction and user prompt', () => {
  const sysInst = buildSystemInstruction('academic_rewrite');
  assert.ok(sysInst.includes('ABSOLUTE SCIENTIFIC & FACTUAL INTEGRITY'));
  assert.ok(sysInst.includes('BILINGUAL EXCELLENCE'));

  const prompt = buildUserPrompt({
    task: 'proofread',
    targetScope: 'selection',
    selectedText: 'Some draft text',
    documentText: 'Document text',
    selectionStart: 0,
    selectionEnd: 15,
    modelMode: 'standard',
  });

  assert.ok(prompt.includes('SELECTED TEXT TO PROCESS:'));
  assert.ok(prompt.includes('Some draft text'));
});
