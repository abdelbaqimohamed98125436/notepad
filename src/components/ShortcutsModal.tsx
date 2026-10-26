import React from 'react';
import { X } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose, darkMode }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Ctrl + Space', desc: 'Activate Hidden Writing Assistant' },
    { key: 'Ctrl + S', desc: 'Save document (downloads / updates file)' },
    { key: 'Ctrl + Shift + S', desc: 'Save As (download file)' },
    { key: 'Ctrl + O', desc: 'Open text file' },
    { key: 'Ctrl + N', desc: 'New document' },
    { key: 'Ctrl + Z', desc: 'Undo last edit' },
    { key: 'Ctrl + Y', desc: 'Redo edit' },
    { key: 'Ctrl + F', desc: 'Find in document' },
    { key: 'Ctrl + H', desc: 'Replace in document' },
    { key: 'F5', desc: 'Insert current Date / Time' },
    { key: 'Ctrl + Plus', desc: 'Zoom In' },
    { key: 'Ctrl + Minus', desc: 'Zoom Out' },
    { key: 'Ctrl + 0', desc: 'Restore 100% Zoom' },
    { key: 'Ctrl + P', desc: 'Print document' },
    { key: 'Tab', desc: 'Insert indentation character' },
    { key: 'Esc', desc: 'Close dialogs and assistant' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-2xs"
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard Shortcuts"
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
          <span className="font-semibold">Keyboard Shortcuts</span>
          <button
            onClick={onClose}
            className="hover:bg-red-600 hover:text-white p-0.5 rounded-xs"
            aria-label="Close dialog"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="p-3 max-h-80 overflow-y-auto text-xs space-y-1.5">
          {shortcuts.map((s, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between py-1 border-b border-gray-200 dark:border-gray-800"
            >
              <kbd className="px-1.5 py-0.5 bg-black/5 dark:bg-white/10 rounded font-mono text-[11px] font-semibold">
                {s.key}
              </kbd>
              <span className="opacity-80 text-right">{s.desc}</span>
            </div>
          ))}
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
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
