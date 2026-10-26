import React, { useState, useRef, useEffect } from 'react';
import { TitleBar, TabItem } from './components/TitleBar.tsx';
import { MenuBar } from './components/MenuBar.tsx';
import { StatusBar } from './components/StatusBar.tsx';
import { EditorArea } from './components/EditorArea.tsx';
import { AssistantModal } from './components/AssistantModal.tsx';
import { FindReplaceModal } from './components/FindReplaceModal.tsx';
import { FontModal } from './components/FontModal.tsx';
import { UnsavedModal } from './components/UnsavedModal.tsx';
import { GoogleChatModal } from './components/GoogleChatModal.tsx';
import { SettingsModal } from './components/SettingsModal.tsx';
import { EditorHistory, HistorySnapshot } from './utils/history.ts';
import {
  calculateCursorPosition,
  detectLineEnding,
  normalizeLineEndings,
} from './utils/textUtils.ts';
import { EditorSettings, SourceFile } from './types/index.ts';

interface DocumentTab {
  id: string;
  fileName: string;
  content: string;
  isDirty: boolean;
  lineEnding: 'CRLF' | 'LF';
  selectionStart: number;
  selectionEnd: number;
  history: EditorHistory;
}

export default function App() {
  // Fresh, clean start with a single empty Untitled document (no sample or fake data)
  const [tabs, setTabs] = useState<DocumentTab[]>([
    {
      id: 'tab-1',
      fileName: 'Untitled.txt',
      content: '',
      isDirty: false,
      lineEnding: 'CRLF',
      selectionStart: 0,
      selectionEnd: 0,
      history: new EditorHistory(100),
    },
  ]);

  const [activeTabId, setActiveTabId] = useState<string>('tab-1');

  // Exact Windows 11 dark theme settings
  const [settings, setSettings] = useState<EditorSettings>({
    wordWrap: true,
    fontFamily: "'Cascadia Code', 'Consolas', 'Courier New', monospace",
    fontSize: 13,
    fontBold: false,
    fontItalic: false,
    textDirection: 'auto',
    zoom: 100,
    showStatusBar: true,
    darkMode: true,
    shortcut: 'Ctrl+Space',
  });

  const editorRef = useRef<HTMLTextAreaElement | null>(null);
  const [sourceFiles, setSourceFiles] = useState<SourceFile[]>([]);

  // Modals state
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [findReplaceMode, setFindReplaceMode] = useState<'find' | 'replace' | null>(null);
  const [isFontModalOpen, setIsFontModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isUnsavedModalOpen, setIsUnsavedModalOpen] = useState(false);
  const [pendingUnsavedAction, setPendingUnsavedAction] = useState<(() => void) | null>(null);
  const [isGoogleChatModalOpen, setIsGoogleChatModalOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  useEffect(() => {
    if (activeTab) {
      const star = activeTab.isDirty ? '*' : '';
      document.title = `${star}${activeTab.fileName} - Notepad`;
    }
  }, [activeTab?.fileName, activeTab?.isDirty]);

  // Update tab content
  const handleContentChange = (newContent: string) => {
    if (!activeTab) return;

    if (editorRef.current) {
      activeTab.history.push({
        content: activeTab.content,
        selectionStart: editorRef.current.selectionStart,
        selectionEnd: editorRef.current.selectionEnd,
        timestamp: Date.now(),
      });
    }

    setTabs((prev) =>
      prev.map((t) =>
        t.id === activeTabId
          ? {
              ...t,
              content: newContent,
              isDirty: true,
              lineEnding: detectLineEnding(newContent),
            }
          : t
      )
    );
  };

  const handleSelectionChange = (start: number, end: number) => {
    setTabs((prev) =>
      prev.map((t) => (t.id === activeTabId ? { ...t, selectionStart: start, selectionEnd: end } : t))
    );
  };

  const cursorPos = calculateCursorPosition(
    activeTab ? activeTab.content : '',
    activeTab ? activeTab.selectionStart : 0,
    activeTab ? activeTab.selectionEnd - activeTab.selectionStart : 0
  );

  const selectedText = activeTab
    ? activeTab.content.substring(activeTab.selectionStart, activeTab.selectionEnd)
    : '';

  // Tab switching
  const handleSelectTab = (id: string) => {
    setActiveTabId(id);
    setTimeout(() => editorRef.current?.focus(), 20);
  };

  // New Tab
  const handleNewTab = () => {
    const newId = 'tab-' + Math.random().toString(36).substring(2, 9);
    const newTab: DocumentTab = {
      id: newId,
      fileName: 'Untitled.txt',
      content: '',
      isDirty: false,
      lineEnding: 'CRLF',
      selectionStart: 0,
      selectionEnd: 0,
      history: new EditorHistory(100),
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newId);
    setTimeout(() => editorRef.current?.focus(), 20);
  };

  // Close Tab
  const handleCloseTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const targetTab = tabs.find((t) => t.id === id);
    if (!targetTab) return;

    const performClose = () => {
      if (tabs.length === 1) {
        setTabs([
          {
            id: 'tab-' + Math.random().toString(36).substring(2, 9),
            fileName: 'Untitled.txt',
            content: '',
            isDirty: false,
            lineEnding: 'CRLF',
            selectionStart: 0,
            selectionEnd: 0,
            history: new EditorHistory(100),
          },
        ]);
        setActiveTabId(tabs[0].id);
        return;
      }

      const filtered = tabs.filter((t) => t.id !== id);
      setTabs(filtered);
      if (activeTabId === id) {
        setActiveTabId(filtered[filtered.length - 1].id);
      }
    };

    if (targetTab.isDirty) {
      setPendingUnsavedAction(() => performClose);
      setIsUnsavedModalOpen(true);
    } else {
      performClose();
    }
  };

  // Open file
  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const newId = 'tab-' + Math.random().toString(36).substring(2, 9);
      const newTab: DocumentTab = {
        id: newId,
        fileName: file.name,
        content: text,
        isDirty: false,
        lineEnding: detectLineEnding(text),
        selectionStart: 0,
        selectionEnd: 0,
        history: new EditorHistory(100),
      };
      setTabs((prev) => [...prev, newTab]);
      setActiveTabId(newId);
    } catch (err: any) {
      alert('Failed to read file: ' + err.message);
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Save current tab
  const handleSave = () => {
    if (!activeTab) return;
    const blob = new Blob([normalizeLineEndings(activeTab.content, activeTab.lineEnding)], {
      type: 'text/plain;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeTab.fileName;
    a.click();
    URL.revokeObjectURL(url);

    setTabs((prev) => prev.map((t) => (t.id === activeTabId ? { ...t, isDirty: false } : t)));
  };

  const handleSaveAs = () => {
    if (!activeTab) return;
    const newName = prompt('Save As:', activeTab.fileName);
    if (newName && newName.trim()) {
      const cleanName = newName.trim();
      const blob = new Blob([normalizeLineEndings(activeTab.content, activeTab.lineEnding)], {
        type: 'text/plain;charset=utf-8',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = cleanName;
      a.click();
      URL.revokeObjectURL(url);

      setTabs((prev) =>
        prev.map((t) => (t.id === activeTabId ? { ...t, fileName: cleanName, isDirty: false } : t))
      );
    }
  };

  // Undo / Redo
  const handleUndo = () => {
    if (!activeTab || !editorRef.current) return;
    const currentSnapshot: HistorySnapshot = {
      content: activeTab.content,
      selectionStart: editorRef.current.selectionStart,
      selectionEnd: editorRef.current.selectionEnd,
      timestamp: Date.now(),
    };
    const previous = activeTab.history.undo(currentSnapshot);
    if (previous) {
      setTabs((prev) =>
        prev.map((t) => (t.id === activeTabId ? { ...t, content: previous.content, isDirty: true } : t))
      );
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.selectionStart = previous.selectionStart;
          editorRef.current.selectionEnd = previous.selectionEnd;
          editorRef.current.focus();
        }
      }, 0);
    }
  };

  const handleRedo = () => {
    if (!activeTab || !editorRef.current) return;
    const currentSnapshot: HistorySnapshot = {
      content: activeTab.content,
      selectionStart: editorRef.current.selectionStart,
      selectionEnd: editorRef.current.selectionEnd,
      timestamp: Date.now(),
    };
    const next = activeTab.history.redo(currentSnapshot);
    if (next) {
      setTabs((prev) =>
        prev.map((t) => (t.id === activeTabId ? { ...t, content: next.content, isDirty: true } : t))
      );
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.selectionStart = next.selectionStart;
          editorRef.current.selectionEnd = next.selectionEnd;
          editorRef.current.focus();
        }
      }, 0);
    }
  };

  const handleCut = () => {
    if (!editorRef.current || !activeTab) return;
    const textarea = editorRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    if (start === end) return;

    navigator.clipboard.writeText(activeTab.content.substring(start, end));
    const newContent = activeTab.content.substring(0, start) + activeTab.content.substring(end);
    handleContentChange(newContent);
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start;
      textarea.focus();
    }, 0);
  };

  const handleCopy = () => {
    if (!editorRef.current || !activeTab) return;
    const textarea = editorRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    if (start === end) return;
    navigator.clipboard.writeText(activeTab.content.substring(start, end));
  };

  const handlePaste = async () => {
    if (!editorRef.current || !activeTab) return;
    try {
      const text = await navigator.clipboard.readText();
      const textarea = editorRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      const newContent = activeTab.content.substring(0, start) + text + activeTab.content.substring(end);
      handleContentChange(newContent);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + text.length;
        textarea.focus();
      }, 0);
    } catch {
      // blocked
    }
  };

  const handleSelectAll = () => {
    if (editorRef.current && activeTab) {
      editorRef.current.select();
      handleSelectionChange(0, activeTab.content.length);
    }
  };

  const handleInsertDateTime = () => {
    const now = new Date();
    const formatted = `${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ${now.toLocaleDateString()}`;
    const textarea = editorRef.current;
    if (!textarea || !activeTab) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newContent = activeTab.content.substring(0, start) + formatted + activeTab.content.substring(end);
    handleContentChange(newContent);
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + formatted.length;
      textarea.focus();
    }, 0);
  };

  const handleZoomIn = () => setSettings((s) => ({ ...s, zoom: Math.min(500, s.zoom + 10) }));
  const handleZoomOut = () => setSettings((s) => ({ ...s, zoom: Math.max(20, s.zoom - 10) }));
  const handleZoomReset = () => setSettings((s) => ({ ...s, zoom: 100 }));

  // Apply replacement from Assistant
  const handleApplyReplacement = (
    replacement: string,
    targetScope: 'selection' | 'document',
    rangeStart: number,
    rangeEnd: number
  ) => {
    if (!activeTab) return;

    activeTab.history.push({
      content: activeTab.content,
      selectionStart: rangeStart,
      selectionEnd: rangeEnd,
      timestamp: Date.now(),
    });

    let newContent = '';
    let newCursorPos = 0;

    if (targetScope === 'selection') {
      newContent = activeTab.content.substring(0, rangeStart) + replacement + activeTab.content.substring(rangeEnd);
      newCursorPos = rangeStart + replacement.length;
    } else {
      newContent = replacement;
      newCursorPos = replacement.length;
    }

    setTabs((prev) =>
      prev.map((t) =>
        t.id === activeTabId
          ? {
              ...t,
              content: newContent,
              isDirty: true,
              selectionStart: rangeStart,
              selectionEnd: newCursorPos,
            }
          : t
      )
    );

    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.selectionStart = rangeStart;
        editorRef.current.selectionEnd = newCursorPos;
        editorRef.current.focus();
      }
    }, 0);
  };

  const tabItems: TabItem[] = tabs.map((t) => ({
    id: t.id,
    title: t.fileName,
    isDirty: t.isDirty,
  }));

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden select-none font-sans bg-[#111420] text-[#e2e8f0]">
      {/* 1. Windows 11 Notepad Title & Tab Bar with Exact Logo */}
      <TitleBar
        tabs={tabItems}
        activeTabId={activeTabId}
        onSelectTab={handleSelectTab}
        onCloseTab={handleCloseTab}
        onNewTab={handleNewTab}
        onClose={() => window.close()}
      />

      {/* 2. Menu Bar with File, Edit, View, and Settings Gear icon */}
      <MenuBar
        wordWrap={settings.wordWrap}
        showStatusBar={settings.showStatusBar}
        canUndo={activeTab ? activeTab.history.canUndo() : false}
        canRedo={activeTab ? activeTab.history.canRedo() : false}
        textDirection={settings.textDirection}
        onNew={handleNewTab}
        onOpen={() => fileInputRef.current?.click()}
        onSave={handleSave}
        onSaveAs={handleSaveAs}
        onPrint={() => window.print()}
        onShareGoogleChat={() => setIsGoogleChatModalOpen(true)}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onCut={handleCut}
        onCopy={handleCopy}
        onPaste={handlePaste}
        onSelectAll={handleSelectAll}
        onFind={() => setFindReplaceMode('find')}
        onReplace={() => setFindReplaceMode('replace')}
        onInsertDateTime={handleInsertDateTime}
        onToggleWordWrap={() => setSettings((s) => ({ ...s, wordWrap: !s.wordWrap }))}
        onOpenFontModal={() => setIsFontModalOpen(true)}
        onChangeDirection={(dir) => setSettings((s) => ({ ...s, textDirection: dir }))}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomReset={handleZoomReset}
        onToggleStatusBar={() => setSettings((s) => ({ ...s, showStatusBar: !s.showStatusBar }))}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAssistant={() => setIsAssistantOpen(true)}
      />

      {/* 3. Deep Navy Slate Text Writing Canvas */}
      <EditorArea
        content={activeTab ? activeTab.content : ''}
        settings={settings}
        onChange={handleContentChange}
        onSelectionChange={handleSelectionChange}
        onOpenAssistant={() => setIsAssistantOpen(true)}
        onSave={handleSave}
        onOpen={() => fileInputRef.current?.click()}
        onNew={handleNewTab}
        onFind={() => setFindReplaceMode('find')}
        onReplace={() => setFindReplaceMode('replace')}
        onInsertDateTime={handleInsertDateTime}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomReset={handleZoomReset}
        editorRef={editorRef}
      />

      {/* 4. Windows 11 Notepad Status Bar */}
      {settings.showStatusBar && (
        <StatusBar
          cursorPos={cursorPos}
          zoom={settings.zoom}
          lineEnding={activeTab ? activeTab.lineEnding : 'CRLF'}
          encoding="UTF-8"
        />
      )}

      {/* Hidden File Picker */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelected}
        accept=".txt,.md,.markdown,.json,.csv,.html,.xml,.js,.ts"
        className="hidden"
      />

      {/* MODALS */}
      {/* 1. Hidden Writing Assistant (Activated via Ctrl+Space or Menu) */}
      <AssistantModal
        isOpen={isAssistantOpen}
        onClose={() => {
          setIsAssistantOpen(false);
          editorRef.current?.focus();
        }}
        selectedText={selectedText}
        documentText={activeTab ? activeTab.content : ''}
        selectionStart={activeTab ? activeTab.selectionStart : 0}
        selectionEnd={activeTab ? activeTab.selectionEnd : 0}
        sourceFiles={sourceFiles}
        onAddSourceFile={(file) => setSourceFiles((prev) => [...prev, file])}
        onRemoveSourceFile={(id) => setSourceFiles((prev) => prev.filter((f) => f.id !== id))}
        onApplyReplacement={handleApplyReplacement}
      />

      {/* 2. Find & Replace Modal */}
      <FindReplaceModal
        isOpen={findReplaceMode !== null}
        mode={findReplaceMode || 'find'}
        onClose={() => setFindReplaceMode(null)}
        content={activeTab ? activeTab.content : ''}
        cursorIndex={activeTab ? activeTab.selectionStart : 0}
        onUpdateContent={(newContent, newCursor) => {
          handleContentChange(newContent);
          if (newCursor !== undefined) {
            handleSelectionChange(newCursor, newCursor);
          }
        }}
        onSelectRange={(start, end) => {
          handleSelectionChange(start, end);
          if (editorRef.current) {
            editorRef.current.selectionStart = start;
            editorRef.current.selectionEnd = end;
            editorRef.current.focus();
          }
        }}
        darkMode={true}
      />

      {/* 3. Font Modal */}
      <FontModal
        isOpen={isFontModalOpen}
        onClose={() => setIsFontModalOpen(false)}
        settings={settings}
        onSaveFont={(fontFamily, fontSize, fontBold, fontItalic) => {
          setSettings((s) => ({ ...s, fontFamily, fontSize, fontBold, fontItalic }));
        }}
        darkMode={true}
      />

      {/* 4. Settings Modal (Gear Icon) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={(newSettings) => setSettings((s) => ({ ...s, ...newSettings }))}
        onOpenAssistant={() => setIsAssistantOpen(true)}
      />

      {/* 5. Unsaved Changes Confirmation Modal */}
      <UnsavedModal
        isOpen={isUnsavedModalOpen}
        fileName={activeTab ? activeTab.fileName : 'Untitled.txt'}
        onSave={() => {
          handleSave();
          setIsUnsavedModalOpen(false);
          if (pendingUnsavedAction) {
            pendingUnsavedAction();
            setPendingUnsavedAction(null);
          }
        }}
        onDontSave={() => {
          if (activeTab) activeTab.isDirty = false;
          setIsUnsavedModalOpen(false);
          if (pendingUnsavedAction) {
            pendingUnsavedAction();
            setPendingUnsavedAction(null);
          }
        }}
        onCancel={() => {
          setIsUnsavedModalOpen(false);
          setPendingUnsavedAction(null);
        }}
        darkMode={true}
      />

      {/* 6. Google Chat Modal */}
      <GoogleChatModal
        isOpen={isGoogleChatModalOpen}
        onClose={() => setIsGoogleChatModalOpen(false)}
        documentText={activeTab ? activeTab.content : ''}
        selectedText={selectedText}
        darkMode={true}
      />
    </div>
  );
}
