import React from 'react';
import { X, Check } from 'lucide-react';
import { EditorSettings } from '../types/index.ts';
import { NotepadLogo } from './NotepadLogo.tsx';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: EditorSettings;
  onUpdateSettings: (newSettings: Partial<EditorSettings>) => void;
  onOpenAssistant: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onOpenAssistant,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs"
      role="dialog"
      aria-modal="true"
      aria-label="Notepad Settings"
    >
      <div className="w-full max-w-lg rounded-lg border border-[#2b314d] bg-[#1a1e2e] text-[#e2e8f0] shadow-2xl overflow-hidden flex flex-col font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#242b42] select-none bg-[#141724]">
          <div className="flex items-center space-x-2">
            <NotepadLogo size={20} />
            <span className="font-semibold text-sm">Settings</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#8e98af] hover:text-white hover:bg-[#202538] transition-colors"
            aria-label="Close settings"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          {/* Section: Font */}
          <div className="p-3 rounded-md bg-[#161927] border border-[#23283d] space-y-3">
            <div className="font-semibold text-sm text-[#f1f5f9]">Font</div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[#94a3b8] mb-1">Font family</label>
                <select
                  value={settings.fontFamily}
                  onChange={(e) => onUpdateSettings({ fontFamily: e.target.value })}
                  className="w-full p-1.5 rounded-md bg-[#1f2438] border border-[#2b314d] text-white outline-none"
                >
                  <option value="'Cascadia Code', 'Consolas', monospace">Cascadia Code</option>
                  <option value="'Consolas', 'Courier New', monospace">Consolas</option>
                  <option value="'Lucida Console', monospace">Lucida Console</option>
                  <option value="'Courier New', monospace">Courier New</option>
                  <option value="'Segoe UI', sans-serif">Segoe UI</option>
                  <option value="Amiri, serif">Amiri (Arabic)</option>
                </select>
              </div>

              <div>
                <label className="block text-[#94a3b8] mb-1">Font size</label>
                <select
                  value={settings.fontSize}
                  onChange={(e) => onUpdateSettings({ fontSize: parseInt(e.target.value, 10) })}
                  className="w-full p-1.5 rounded-md bg-[#1f2438] border border-[#2b314d] text-white outline-none"
                >
                  {[10, 11, 12, 13, 14, 15, 16, 18, 20, 24, 28].map((size) => (
                    <option key={size} value={size}>
                      {size} pt
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section: Editing & Layout */}
          <div className="p-3 rounded-md bg-[#161927] border border-[#23283d] space-y-3">
            <div className="font-semibold text-sm text-[#f1f5f9]">Display & Editing</div>

            <label className="flex items-center justify-between cursor-pointer select-none py-1">
              <span className="text-[#cbd5e1]">Word wrap</span>
              <input
                type="checkbox"
                checked={settings.wordWrap}
                onChange={(e) => onUpdateSettings({ wordWrap: e.target.checked })}
                className="w-4 h-4 accent-sky-500 rounded"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer select-none py-1 border-t border-[#23283d]">
              <span className="text-[#cbd5e1]">Status bar</span>
              <input
                type="checkbox"
                checked={settings.showStatusBar}
                onChange={(e) => onUpdateSettings({ showStatusBar: e.target.checked })}
                className="w-4 h-4 accent-sky-500 rounded"
              />
            </label>
          </div>

          {/* Section: Hidden Writing Assistant */}
          <div className="p-3 rounded-md bg-[#161927] border border-[#23283d] space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-sm text-[#f1f5f9]">Writing Intelligence</div>
                <div className="text-[11px] text-[#94a3b8]">
                  Accessible anytime using keyboard shortcut <kbd className="px-1.5 py-0.5 rounded bg-[#202538] font-mono text-[10px]">Ctrl+Space</kbd>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAssistant();
                }}
                className="px-2.5 py-1.5 rounded-md bg-sky-600 text-white font-medium hover:bg-sky-500 transition-colors"
              >
                Open Assistant
              </button>
            </div>
          </div>

          {/* Section: About */}
          <div className="p-3 rounded-md bg-[#161927] border border-[#23283d] flex items-center space-x-3">
            <NotepadLogo size={36} />
            <div>
              <div className="font-semibold text-[#f1f5f9]">Quiet Notepad</div>
              <div className="text-[11px] text-[#8e98af]">
                Windows 11 Faithful Edition • With Hidden Gemini Intelligence
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-4 py-2.5 border-t border-[#242b42] bg-[#141724]">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-md bg-[#23293f] text-white hover:bg-[#2d3552] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
