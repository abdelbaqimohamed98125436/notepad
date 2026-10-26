export type TargetScope = 'selection' | 'document';

export type ModelMode = 'fast' | 'standard' | 'reasoning';

export type WritingTask =
  | 'proofread'
  | 'academic_rewrite'
  | 'concise'
  | 'clarity'
  | 'expand'
  | 'simplify'
  | 'translate_ar'
  | 'translate_en'
  | 'critique'
  | 'draft'
  | 'custom';

export interface SourceFile {
  id: string;
  name: string;
  type: string;
  size: number;
  content: string;
  pageCount?: number;
}

export interface AssistantRequest {
  task: WritingTask;
  instruction?: string;
  targetScope: TargetScope;
  selectedText: string;
  documentText: string;
  selectionStart: number;
  selectionEnd: number;
  precedingContext?: string;
  followingContext?: string;
  sourceFiles?: SourceFile[];
  modelMode: ModelMode;
  strictPreservation?: boolean;
  citationStyle?: 'APA' | 'MLA' | 'IEEE' | 'Chicago' | 'None';
  targetLanguage?: 'auto' | 'en' | 'ar';
}

export interface AssistantResponse {
  success: boolean;
  replacement: string;
  critique?: string;
  changesSummary?: string[];
  wordCountDelta?: number;
  warnings?: string[];
  modelUsed: string;
  error?: string;
}

export interface DiffPart {
  type: 'unchanged' | 'added' | 'removed';
  value: string;
}

export interface DiffResult {
  parts: DiffPart[];
  additionsCount: number;
  deletionsCount: number;
  hasChanges: boolean;
}

export interface DocumentState {
  id: string;
  title: string;
  content: string;
  isDirty: boolean;
  filePath?: string;
  lineEnding: 'CRLF' | 'LF';
  encoding: 'UTF-8';
}

export interface EditorSettings {
  wordWrap: boolean;
  fontFamily: string;
  fontSize: number;
  fontBold: boolean;
  fontItalic: boolean;
  textDirection: 'auto' | 'ltr' | 'rtl';
  zoom: number; // 100 = 100%
  showStatusBar: boolean;
  darkMode: boolean;
  shortcut: string; // e.g. "Ctrl+Space"
}

export interface CursorPosition {
  line: number;
  column: number;
  selectionLength: number;
  lineCount: number;
  wordCount: number;
  charCount: number;
}
