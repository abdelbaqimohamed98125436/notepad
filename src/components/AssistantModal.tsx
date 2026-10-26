import React, { useState, useEffect, useRef } from 'react';
import {
  WritingTask,
  AssistantRequest,
  AssistantResponse,
  SourceFile,
  DiffResult,
} from '../types/index.ts';
import { computeWordDiff } from '../utils/diff.ts';
import {
  Check,
  Copy,
  RotateCcw,
  Send,
  Sparkles,
  Paperclip,
  MessageSquare,
  FileText,
  AlertTriangle,
  X,
  Upload,
  ArrowRight,
  PlusCircle,
  PenTool,
} from 'lucide-react';

interface AssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedText: string;
  documentText: string;
  selectionStart: number;
  selectionEnd: number;
  sourceFiles: SourceFile[];
  onAddSourceFile: (file: SourceFile) => void;
  onRemoveSourceFile: (id: string) => void;
  onApplyReplacement: (
    replacement: string,
    targetScope: 'selection' | 'document',
    rangeStart: number,
    rangeEnd: number
  ) => void;
  darkMode?: boolean;
}

export const AssistantModal: React.FC<AssistantModalProps> = ({
  isOpen,
  onClose,
  selectedText,
  documentText,
  selectionStart,
  selectionEnd,
  sourceFiles,
  onAddSourceFile,
  onRemoveSourceFile,
  onApplyReplacement,
}) => {
  const [activeTab, setActiveTab] = useState<'writer' | 'chat' | 'sources'>('writer');
  const [selectedTask, setSelectedTask] = useState<WritingTask>('academic_rewrite');
  const [targetScope, setTargetScope] = useState<'selection' | 'document'>(
    selectedText.trim().length > 0 ? 'selection' : 'document'
  );
  const [customPrompt, setCustomPrompt] = useState('');
  const [citationStyle, setCitationStyle] = useState<'None' | 'APA' | 'MLA' | 'IEEE' | 'Chicago'>('None');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [generatedText, setGeneratedText] = useState<string>('');
  const [diff, setDiff] = useState<DiffResult | null>(null);
  const [showDiff, setShowDiff] = useState(false);
  const [changesSummary, setChangesSummary] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  // Chat tab
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const promptInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      const hasSelection = selectedText.trim().length > 0;
      setTargetScope(hasSelection ? 'selection' : 'document');
      setErrorMessage(null);
      setCopied(false);
      setTimeout(() => promptInputRef.current?.focus(), 50);
    }
  }, [isOpen, selectedText, selectionStart, selectionEnd]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentTargetText = targetScope === 'selection' ? selectedText : documentText;

  // Run the Writer
  const handleRunWriter = async (overrideTask?: WritingTask) => {
    const task = overrideTask || selectedTask;
    if (isLoading) return;
    setIsLoading(true);
    setErrorMessage(null);
    setCopied(false);

    try {
      const payload: AssistantRequest = {
        task,
        instruction: customPrompt.trim() || undefined,
        targetScope,
        selectedText,
        documentText,
        selectionStart,
        selectionEnd,
        sourceFiles,
        modelMode: 'fast', // Fast gemini-3.1-flash-lite
        citationStyle,
      };

      const res = await fetch('/api/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data: AssistantResponse = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Writing engine returned an error.');
      }

      const output = data.replacement || data.critique || '';
      setGeneratedText(output);
      setChangesSummary(data.changesSummary || []);

      // Compute word diff against target
      const diffResult = computeWordDiff(currentTargetText, output);
      setDiff(diffResult);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to generate writing.');
    } finally {
      setIsLoading(false);
    }
  };

  // Replace text in document
  const handleApply = () => {
    if (!generatedText) return;
    onApplyReplacement(generatedText, targetScope, selectionStart, selectionEnd);
    onClose();
  };

  // Insert text at cursor position without replacing existing text
  const handleInsertAtCursor = () => {
    if (!generatedText) return;
    onApplyReplacement(generatedText, 'selection', selectionStart, selectionStart);
    onClose();
  };

  // Copy to clipboard
  const handleCopy = () => {
    if (!generatedText) return;
    navigator.clipboard.writeText(generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Chat message submit
  const handleChatSubmit = async () => {
    if (!chatInput.trim() || isChatLoading) return;
    const msg = chatInput.trim();
    setChatInput('');
    const newHistory = [...chatMessages, { role: 'user' as const, content: msg }];
    setChatMessages(newHistory);
    setIsChatLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory,
          documentText,
          sourceFiles,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Chat request failed.');
      }
      setChatMessages([...newHistory, { role: 'assistant', content: data.reply }]);
    } catch (err: any) {
      setChatMessages([
        ...newHistory,
        { role: 'assistant', content: `[Error: ${err.message}]` },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // File upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = async () => {
          const base64 = reader.result as string;
          try {
            const res = await fetch('/api/ocr', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                imageBase64: base64,
                mimeType: file.type,
              }),
            });
            const data = await res.json();
            if (data.success && data.text) {
              onAddSourceFile({
                id: Math.random().toString(36).substring(2, 9),
                name: `${file.name} (OCR)`,
                type: file.type,
                size: file.size,
                content: data.text,
              });
            }
          } catch (err) {
            console.error('OCR failed', err);
          }
        };
        reader.readAsDataURL(file);
      } else {
        const text = await file.text();
        onAddSourceFile({
          id: Math.random().toString(36).substring(2, 9),
          name: file.name,
          type: file.type || 'text/plain',
          size: file.size,
          content: text,
        });
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const writerTasks: Array<{ id: WritingTask; label: string; desc: string }> = [
    { id: 'academic_rewrite', label: 'Academic Polish', desc: 'Elevate tone & logical flow' },
    { id: 'proofread', label: 'Grammar & Errors', desc: 'Fix spelling & punctuation' },
    { id: 'expand', label: 'Continue Writing', desc: 'Develop next section / ideas' },
    { id: 'concise', label: 'Make Concise', desc: 'Remove wordiness & fluff' },
    { id: 'clarity', label: 'Improve Clarity', desc: 'Smooth awkward phrasing' },
    { id: 'translate_ar', label: 'Translate to Arabic', desc: 'Modern Standard Arabic (فصحى)' },
    { id: 'translate_en', label: 'Translate to English', desc: 'Formal academic English' },
    { id: 'draft', label: 'Draft from Prompt', desc: 'Generate complete draft' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs font-sans"
      role="dialog"
      aria-modal="true"
      aria-label="Writing Assistant"
    >
      <div className="w-full max-w-3xl rounded-lg border border-[#2b314d] bg-[#1a1e2e] text-[#e2e8f0] shadow-2xl flex flex-col max-h-[88vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#141724] border-b border-[#242b42] select-none">
          <div className="flex items-center space-x-2">
            <PenTool className="w-4 h-4 text-sky-400" />
            <span className="font-semibold text-xs tracking-tight">Writing Intelligence</span>
            <span className="text-[11px] text-[#8e98af]">
              • {targetScope === 'selection' ? `Selection (${selectedText.length} chars)` : 'Whole Document'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#8e98af] hover:text-white hover:bg-[#202538] transition-colors"
            title="Close (Esc)"
            aria-label="Close Assistant"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-3 border-b border-[#242b42] bg-[#161927] text-xs select-none">
          <button
            onClick={() => setActiveTab('writer')}
            className={`px-3 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'writer'
                ? 'border-sky-500 text-sky-400 font-semibold'
                : 'border-transparent text-[#8e98af] hover:text-white'
            }`}
          >
            Writer & Refiner
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'chat'
                ? 'border-sky-500 text-sky-400 font-semibold'
                : 'border-transparent text-[#8e98af] hover:text-white'
            }`}
          >
            Chat & Inquire
          </button>
          <button
            onClick={() => setActiveTab('sources')}
            className={`px-3 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'sources'
                ? 'border-sky-500 text-sky-400 font-semibold'
                : 'border-transparent text-[#8e98af] hover:text-white'
            }`}
          >
            Reference Sources ({sourceFiles.length})
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {/* TAB: WRITER */}
          {activeTab === 'writer' && (
            <div className="space-y-3.5">
              {/* Target Scope Switcher */}
              <div className="flex items-center justify-between p-2 rounded-md bg-[#161927] border border-[#23283d]">
                <span className="font-medium text-[#94a3b8]">Target Scope:</span>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setTargetScope('selection')}
                    disabled={!selectedText.trim()}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                      targetScope === 'selection'
                        ? 'bg-sky-600 text-white'
                        : 'text-[#8e98af] hover:bg-[#202538] disabled:opacity-30'
                    }`}
                  >
                    Selection ({selectedText.length} chars)
                  </button>
                  <button
                    onClick={() => setTargetScope('document')}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                      targetScope === 'document'
                        ? 'bg-sky-600 text-white'
                        : 'text-[#8e98af] hover:bg-[#202538]'
                    }`}
                  >
                    Whole Document ({documentText.length} chars)
                  </button>
                </div>
              </div>

              {/* One-click Writing Presets */}
              <div>
                <label className="block font-semibold text-[#f1f5f9] mb-1.5 text-xs">
                  Choose a Writing Action:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {writerTasks.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setSelectedTask(t.id);
                        handleRunWriter(t.id);
                      }}
                      className={`p-2 rounded-md text-left border transition-all text-xs ${
                        selectedTask === t.id
                          ? 'bg-[#21273d] border-sky-500 text-white shadow-xs'
                          : 'bg-[#161927] border-[#252b40] text-[#cbd5e1] hover:border-gray-500'
                      }`}
                    >
                      <div className="font-semibold truncate text-[11px]">{t.label}</div>
                      <div className="text-[10px] text-[#8e98af] truncate">{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Prompt Textarea */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="custom-prompt" className="font-semibold text-[#f1f5f9] text-xs">
                    Custom Prompt / Guidance (Optional):
                  </label>
                  <span className="text-[10px] text-[#8e98af]">Press Enter to generate</span>
                </div>
                <div className="flex items-start space-x-2">
                  <textarea
                    id="custom-prompt"
                    ref={promptInputRef}
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleRunWriter();
                      }
                    }}
                    rows={2}
                    placeholder="e.g. 'Write a strong conclusion paragraph emphasizing economic viability', 'Make this sound formal'..."
                    className="flex-1 p-2 rounded-md bg-[#131624] border border-[#272e45] text-white font-mono text-xs outline-none focus:border-sky-500 resize-none"
                  />
                  <button
                    onClick={() => handleRunWriter()}
                    disabled={isLoading}
                    className="h-14 px-4 bg-sky-600 hover:bg-sky-500 text-white rounded-md font-medium text-xs flex items-center justify-center space-x-1.5 transition-colors disabled:opacity-50 shrink-0"
                  >
                    {isLoading ? (
                      <RotateCcw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Write</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="p-2.5 rounded-md bg-red-950/40 border border-red-800 text-red-300 flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                  <div className="text-xs">{errorMessage}</div>
                </div>
              )}

              {/* Generated Result Output */}
              {generatedText && (
                <div className="p-3 rounded-md bg-[#151826] border border-[#262c42] space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-[#f1f5f9]">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                      <span>Generated Writer Output:</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowDiff(!showDiff)}
                      className="text-[11px] text-sky-400 hover:underline"
                    >
                      {showDiff ? 'Show Clean Text' : 'View Diff Changes'}
                    </button>
                  </div>

                  {showDiff && diff ? (
                    <div className="p-3 rounded bg-[#11131f] border border-[#202538] font-mono text-xs whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
                      {diff.parts.map((part, i) => {
                        if (part.type === 'added') {
                          return (
                            <span key={i} className="bg-emerald-950 text-emerald-300 font-semibold underline">
                              {part.value}
                            </span>
                          );
                        }
                        if (part.type === 'removed') {
                          return (
                            <span key={i} className="bg-rose-950 text-rose-300 line-through opacity-75">
                              {part.value}
                            </span>
                          );
                        }
                        return <span key={i}>{part.value}</span>;
                      })}
                    </div>
                  ) : (
                    <div className="p-3 rounded bg-[#11131f] border border-[#202538] font-mono text-xs whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto text-[#f1f5f9]">
                      {generatedText}
                    </div>
                  )}

                  {changesSummary.length > 0 && (
                    <ul className="list-disc list-inside space-y-0.5 text-[11px] text-[#94a3b8] pt-1">
                      {changesSummary.map((b, idx) => (
                        <li key={idx}>{b}</li>
                      ))}
                    </ul>
                  )}

                  {/* Actions for output */}
                  <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-[#202538]">
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="px-3 py-1.5 rounded bg-[#202538] hover:bg-[#282f47] text-white flex items-center space-x-1 text-xs transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copied ? 'Copied!' : 'Copy'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleInsertAtCursor}
                      className="px-3 py-1.5 rounded bg-[#202538] hover:bg-[#282f47] text-sky-400 flex items-center space-x-1 text-xs transition-colors font-medium"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Insert at Cursor</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleApply}
                      className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white flex items-center space-x-1 text-xs transition-colors font-semibold"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>
                        {targetScope === 'selection' ? 'Replace Selected Text' : 'Replace Document'}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: CHAT */}
          {activeTab === 'chat' && (
            <div className="flex flex-col h-[380px]">
              <div className="flex-1 overflow-y-auto space-y-2 p-2 border border-[#252b40] rounded bg-[#131624] mb-2">
                {chatMessages.length === 0 ? (
                  <div className="text-center py-12 text-[#8e98af] text-xs">
                    Discuss concepts, test hypotheses, or ask questions about your document.
                  </div>
                ) : (
                  chatMessages.map((m, i) => (
                    <div
                      key={i}
                      className={`p-2 rounded text-xs whitespace-pre-wrap ${
                        m.role === 'user'
                          ? 'bg-sky-950/70 border border-sky-800 ml-8 text-sky-100'
                          : 'bg-[#1c2133] border border-[#2a314d] mr-8 text-[#e2e8f0]'
                      }`}
                    >
                      <div className="font-semibold text-[10px] text-[#8e98af] mb-0.5">
                        {m.role === 'user' ? 'You' : 'Writing Assistant'}
                      </div>
                      <div>{m.content}</div>
                    </div>
                  ))
                )}
                {isChatLoading && (
                  <div className="text-xs italic text-[#8e98af] animate-pulse">Thinking...</div>
                )}
              </div>

              <div className="flex items-center space-x-1.5">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleChatSubmit()}
                  placeholder="Ask a question about your document or sources..."
                  className="flex-1 p-2 rounded bg-[#131624] border border-[#272e45] text-white text-xs outline-none focus:border-sky-500"
                />
                <button
                  type="button"
                  onClick={handleChatSubmit}
                  disabled={isChatLoading || !chatInput.trim()}
                  className="px-3 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded text-xs font-medium transition-colors disabled:opacity-40"
                >
                  Send
                </button>
              </div>
            </div>
          )}

          {/* TAB: SOURCES */}
          {activeTab === 'sources' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-xs text-[#f1f5f9]">Attached References & OCR</h4>
                  <p className="text-[11px] text-[#8e98af]">
                    Attach files (TXT, MD, CSV, JSON, HTML) or photos for instant OCR transcription.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded text-xs font-medium flex items-center space-x-1 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Attach File</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  multiple
                  accept=".txt,.md,.markdown,.csv,.json,.html,.png,.jpg,.jpeg,.webp"
                  className="hidden"
                />
              </div>

              {sourceFiles.length === 0 ? (
                <div className="p-8 border border-dashed border-[#2b314d] rounded text-center text-[#8e98af] text-xs">
                  No reference sources attached.
                </div>
              ) : (
                <div className="space-y-1.5">
                  {sourceFiles.map((sf) => (
                    <div
                      key={sf.id}
                      className="p-2 rounded bg-[#161927] border border-[#252b40] flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center space-x-2 truncate">
                        <FileText className="w-4 h-4 text-sky-400 shrink-0" />
                        <span className="font-semibold text-[#f1f5f9] truncate">{sf.name}</span>
                        <span className="text-[10px] text-[#8e98af]">({Math.round(sf.size / 1024)} KB)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRemoveSourceFile(sf.id)}
                        className="text-red-400 hover:text-red-300 text-xs px-2 py-0.5"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-[#242b42] bg-[#141724] select-none text-xs">
          <span className="text-[11px] text-[#8e98af]">Shortcut: Ctrl+Space • Esc to close</span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-[#202538] hover:bg-[#282f47] text-white text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
