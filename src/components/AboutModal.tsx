import React from 'react';
import { X } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose, darkMode }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-2xs"
      role="dialog"
      aria-modal="true"
      aria-label="About Quiet Notepad"
    >
      <div
        className={`w-full max-w-md rounded-sm border shadow-xl flex flex-col ${
          darkMode ? 'bg-[#252526] border-[#3e3e42] text-white' : 'bg-[#f0f0f0] border-[#999999] text-black'
        }`}
      >
        <div
          className={`flex items-center justify-between px-3 py-1.5 border-b select-none text-xs ${
            darkMode ? 'bg-[#1f1f1f] border-[#333333]' : 'bg-[#e5e5e5] border-[#cccccc]'
          }`}
        >
          <span className="font-semibold">About Quiet Notepad</span>
          <button
            onClick={onClose}
            className="hover:bg-red-600 hover:text-white p-0.5 rounded-xs"
            aria-label="Close dialog"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="p-4 space-y-3 text-xs leading-relaxed">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-sm bg-sky-600 text-white font-bold text-xl flex items-center justify-center shadow-xs">
              N
            </div>
            <div>
              <div className="font-bold text-sm">Quiet Notepad</div>
              <div className="text-[11px] opacity-75">Version 1.0.0 (Release Candidate)</div>
            </div>
          </div>

          <div className="border-t pt-2 opacity-90 space-y-1">
            <p>
              A faithful browser-based text editor crafted with the restrained minimalism of classic Windows Notepad, equipped with an unobtrusive writing intelligence engine.
            </p>
            <p className="font-medium text-sky-600 dark:text-sky-400">
              Shortcut: Press <kbd className="px-1 py-0.5 border rounded bg-black/5 dark:bg-white/10 font-mono text-[10px]">Ctrl+Space</kbd> anywhere to summon the Writing Assistant.
            </p>
            <p className="text-[11px] opacity-75">
              Supports bilingual Arabic & English composition, academic research review, file OCR, and reversible undo/redo.
            </p>
          </div>
        </div>

        <div
          className={`flex items-center justify-end px-3 py-2 border-t text-xs ${
            darkMode ? 'bg-[#1f1f1f] border-[#333333]' : 'bg-[#e5e5e5] border-[#cccccc]'
          }`}
        >
          <button
            onClick={onClose}
            className={`px-4 py-1 rounded-xs border font-medium ${
              darkMode ? 'bg-[#333333] border-[#444444] hover:bg-[#444444]' : 'bg-white border-[#999999] hover:bg-gray-100'
            }`}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};
