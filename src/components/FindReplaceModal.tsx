import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { findAllMatches, replaceNextMatch, replaceAllMatches } from '../utils/textUtils.ts';

interface FindReplaceModalProps {
  isOpen: boolean;
  mode: 'find' | 'replace';
  onClose: () => void;
  content: string;
  cursorIndex: number;
  onUpdateContent: (newContent: string, newCursorIndex?: number) => void;
  onSelectRange: (start: number, end: number) => void;
  darkMode: boolean;
}

export const FindReplaceModal: React.FC<FindReplaceModalProps> = ({
  isOpen,
  mode: initialMode,
  onClose,
  content,
  cursorIndex,
  onUpdateContent,
  onSelectRange,
  darkMode,
}) => {
  const [mode, setMode] = useState<'find' | 'replace'>(initialMode);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [matchCase, setMatchCase] = useState(false);
  const [wrapAround, setWrapAround] = useState(true);
  const [direction, setDirection] = useState<'up' | 'down'>('down');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const findInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMode(initialMode);
    setStatusMessage(null);
    if (isOpen) {
      setTimeout(() => findInputRef.current?.focus(), 50);
    }
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleFindNext = () => {
    if (!findText) return;
    const matches = findAllMatches(content, findText, { matchCase });
    if (matches.length === 0) {
      setStatusMessage(`Cannot find "${findText}"`);
      return;
    }

    let targetMatch;
    if (direction === 'down') {
      targetMatch = matches.find((m) => m.index > cursorIndex);
      if (!targetMatch && wrapAround) {
        targetMatch = matches[0];
      }
    } else {
      const prevMatches = matches.filter((m) => m.index < cursorIndex);
      targetMatch = prevMatches[prevMatches.length - 1];
      if (!targetMatch && wrapAround) {
        targetMatch = matches[matches.length - 1];
      }
    }

    if (!targetMatch) {
      setStatusMessage(`Cannot find "${findText}"`);
      return;
    }

    setStatusMessage(null);
    onSelectRange(targetMatch.index, targetMatch.index + targetMatch.length);
  };

  const handleReplace = () => {
    if (!findText) return;
    const result = replaceNextMatch(content, findText, replaceText, cursorIndex, {
      matchCase,
      wrapAround,
    });

    if (result.replaced) {
      onUpdateContent(result.newText, result.matchIndex + replaceText.length);
      onSelectRange(result.matchIndex, result.matchIndex + replaceText.length);
      setStatusMessage(null);
    } else {
      setStatusMessage(`Cannot find "${findText}"`);
    }
  };

  const handleReplaceAll = () => {
    if (!findText) return;
    const result = replaceAllMatches(content, findText, replaceText, { matchCase });
    if (result.count > 0) {
      onUpdateContent(result.newText);
      setStatusMessage(`Replaced ${result.count} occurrences.`);
    } else {
      setStatusMessage(`Cannot find "${findText}"`);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-2xs"
      role="dialog"
      aria-modal="true"
      aria-label={mode === 'find' ? 'Find' : 'Replace'}
    >
      <div
        className={`w-full max-w-md rounded-sm border shadow-xl flex flex-col ${
          darkMode ? 'bg-[#252526] border-[#3e3e42] text-white' : 'bg-[#f0f0f0] border-[#999999] text-black'
        }`}
      >
        {/* Title Bar */}
        <div
          className={`flex items-center justify-between px-3 py-1.5 border-b select-none text-xs ${
            darkMode ? 'bg-[#1f1f1f] border-[#333333]' : 'bg-[#e5e5e5] border-[#cccccc]'
          }`}
        >
          <span className="font-semibold">{mode === 'find' ? 'Find' : 'Replace'}</span>
          <button
            onClick={onClose}
            className="hover:bg-red-600 hover:text-white p-0.5 rounded-xs"
            aria-label="Close dialog"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-3 text-xs space-y-3">
          <div className="flex items-center space-x-2">
            <label className="w-24 font-medium" htmlFor="find-what-input">
              Find what:
            </label>
            <input
              id="find-what-input"
              ref={findInputRef}
              type="text"
              value={findText}
              onChange={(e) => setFindText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleFindNext()}
              className={`flex-1 px-2 py-1 border rounded-xs text-xs outline-none focus:border-sky-500 ${
                darkMode ? 'bg-[#1e1e1e] border-[#3e3e42]' : 'bg-white border-[#aaaaaa]'
              }`}
            />
          </div>

          {mode === 'replace' && (
            <div className="flex items-center space-x-2">
              <label className="w-24 font-medium" htmlFor="replace-with-input">
                Replace with:
              </label>
              <input
                id="replace-with-input"
                type="text"
                value={replaceText}
                onChange={(e) => setReplaceText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleReplace()}
                className={`flex-1 px-2 py-1 border rounded-xs text-xs outline-none focus:border-sky-500 ${
                  darkMode ? 'bg-[#1e1e1e] border-[#3e3e42]' : 'bg-white border-[#aaaaaa]'
                }`}
              />
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <div className="space-y-1.5">
              <label className="flex items-center space-x-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={matchCase}
                  onChange={(e) => setMatchCase(e.target.checked)}
                />
                <span>Match case</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={wrapAround}
                  onChange={(e) => setWrapAround(e.target.checked)}
                />
                <span>Wrap around</span>
              </label>
            </div>

            {mode === 'find' && (
              <fieldset className="border border-gray-300 dark:border-gray-700 px-3 py-1 rounded-xs">
                <legend className="text-[10px] px-1 opacity-75">Direction</legend>
                <div className="flex items-center space-x-3">
                  <label className="flex items-center space-x-1 cursor-pointer">
                    <input
                      type="radio"
                      name="dir"
                      checked={direction === 'up'}
                      onChange={() => setDirection('up')}
                    />
                    <span>Up</span>
                  </label>
                  <label className="flex items-center space-x-1 cursor-pointer">
                    <input
                      type="radio"
                      name="dir"
                      checked={direction === 'down'}
                      onChange={() => setDirection('down')}
                    />
                    <span>Down</span>
                  </label>
                </div>
              </fieldset>
            )}
          </div>

          {statusMessage && (
            <div className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
              {statusMessage}
            </div>
          )}
        </div>

        {/* Buttons */}
        <div
          className={`flex items-center justify-end px-3 py-2 border-t space-x-2 text-xs ${
            darkMode ? 'bg-[#1f1f1f] border-[#333333]' : 'bg-[#e5e5e5] border-[#cccccc]'
          }`}
        >
          <button
            onClick={handleFindNext}
            className={`px-3 py-1 rounded-xs border font-medium ${
              darkMode ? 'bg-[#333333] border-[#444444] hover:bg-[#444444]' : 'bg-white border-[#999999] hover:bg-gray-100'
            }`}
          >
            Find Next
          </button>
          {mode === 'replace' && (
            <>
              <button
                onClick={handleReplace}
                className={`px-3 py-1 rounded-xs border font-medium ${
                  darkMode ? 'bg-[#333333] border-[#444444] hover:bg-[#444444]' : 'bg-white border-[#999999] hover:bg-gray-100'
                }`}
              >
                Replace
              </button>
              <button
                onClick={handleReplaceAll}
                className={`px-3 py-1 rounded-xs border font-medium ${
                  darkMode ? 'bg-[#333333] border-[#444444] hover:bg-[#444444]' : 'bg-white border-[#999999] hover:bg-gray-100'
                }`}
              >
                Replace All
              </button>
            </>
          )}
          <button
            onClick={onClose}
            className={`px-3 py-1 rounded-xs border font-medium ${
              darkMode ? 'bg-[#333333] border-[#444444] hover:bg-[#444444]' : 'bg-white border-[#999999] hover:bg-gray-100'
            }`}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
