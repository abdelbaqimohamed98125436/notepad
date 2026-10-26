import React from 'react';
import { isRTL } from '../utils/textUtils.ts';
import { EditorSettings } from '../types/index.ts';

interface EditorAreaProps {
  content: string;
  settings: EditorSettings;
  onChange: (value: string) => void;
  onSelectionChange: (start: number, end: number) => void;
  onOpenAssistant: () => void;
  onSave: () => void;
  onOpen: () => void;
  onNew: () => void;
  onFind: () => void;
  onReplace: () => void;
  onInsertDateTime: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  editorRef: React.RefObject<HTMLTextAreaElement | null>;
}

export const EditorArea: React.FC<EditorAreaProps> = ({
  content,
  settings,
  onChange,
  onSelectionChange,
  onOpenAssistant,
  onSave,
  onOpen,
  onNew,
  onFind,
  onReplace,
  onInsertDateTime,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  editorRef,
}) => {
  const textDirection =
    settings.textDirection === 'auto'
      ? isRTL(content)
        ? 'rtl'
        : 'ltr'
      : settings.textDirection;

  const handleSelectOrCursor = () => {
    if (editorRef.current) {
      onSelectionChange(editorRef.current.selectionStart, editorRef.current.selectionEnd);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // 1. Primary Assistant shortcut: Ctrl+Space (or Alt+Space fallback)
    if ((e.ctrlKey || e.metaKey) && e.code === 'Space') {
      e.preventDefault();
      onOpenAssistant();
      return;
    }

    if (e.altKey && e.code === 'Space') {
      e.preventDefault();
      onOpenAssistant();
      return;
    }

    // Standard Notepad shortcuts
    if (e.ctrlKey || e.metaKey) {
      const key = e.key.toLowerCase();
      if (key === 's') {
        e.preventDefault();
        onSave();
        return;
      }
      if (key === 'o') {
        e.preventDefault();
        onOpen();
        return;
      }
      if (key === 'n') {
        e.preventDefault();
        onNew();
        return;
      }
      if (key === 'f') {
        e.preventDefault();
        onFind();
        return;
      }
      if (key === 'h') {
        e.preventDefault();
        onReplace();
        return;
      }
      if (key === '=' || key === '+') {
        e.preventDefault();
        onZoomIn();
        return;
      }
      if (key === '-') {
        e.preventDefault();
        onZoomOut();
        return;
      }
      if (key === '0') {
        e.preventDefault();
        onZoomReset();
        return;
      }
    }

    // F5: Insert Time/Date
    if (e.key === 'F5') {
      e.preventDefault();
      onInsertDateTime();
      return;
    }

    // Tab key support
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = editorRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newText = content.substring(0, start) + '\t' + content.substring(end);
      onChange(newText);

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 1;
        handleSelectOrCursor();
      }, 0);
    }
  };

  const effectiveFontSize = Math.round(settings.fontSize * (settings.zoom / 100));

  return (
    <div className="flex-1 relative overflow-hidden bg-[#191c2b]">
      <textarea
        ref={editorRef}
        value={content}
        onChange={(e) => {
          onChange(e.target.value);
          handleSelectOrCursor();
        }}
        onKeyUp={handleSelectOrCursor}
        onMouseUp={handleSelectOrCursor}
        onSelect={handleSelectOrCursor}
        onKeyDown={handleKeyDown}
        dir={textDirection}
        spellCheck={false}
        aria-label="Windows Notepad Text Canvas"
        className={`w-full h-full p-4 resize-none border-0 outline-none text-[#e5e8f0] bg-[#191c2b] caret-white selection:bg-[#2b3d63] selection:text-white ${
          settings.wordWrap ? 'whitespace-pre-wrap break-words' : 'whitespace-pre overflow-x-auto'
        }`}
        style={{
          fontFamily:
            "'Cascadia Code', 'Consolas', 'Lucida Console', 'Courier New', monospace",
          fontSize: `${effectiveFontSize}px`,
          fontWeight: settings.fontBold ? 'bold' : 'normal',
          fontStyle: settings.fontItalic ? 'italic' : 'normal',
          lineHeight: '1.5',
          tabSize: 4,
        }}
      />
    </div>
  );
};
