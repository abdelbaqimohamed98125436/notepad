import React from 'react';
import { X } from 'lucide-react';

interface UnsavedModalProps {
  isOpen: boolean;
  fileName: string;
  onSave: () => void;
  onDontSave: () => void;
  onCancel: () => void;
  darkMode: boolean;
}

export const UnsavedModal: React.FC<UnsavedModalProps> = ({
  isOpen,
  fileName,
  onSave,
  onDontSave,
  onCancel,
  darkMode,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-2xs"
      role="dialog"
      aria-modal="true"
      aria-label="Save changes confirmation"
    >
      <div
        className={`w-full max-w-sm rounded-sm border shadow-xl flex flex-col ${
          darkMode ? 'bg-[#252526] border-[#3e3e42] text-white' : 'bg-[#f0f0f0] border-[#999999] text-black'
        }`}
      >
        <div
          className={`flex items-center justify-between px-3 py-1.5 border-b select-none text-xs ${
            darkMode ? 'bg-[#1f1f1f] border-[#333333]' : 'bg-[#e5e5e5] border-[#cccccc]'
          }`}
        >
          <span className="font-semibold">Quiet Notepad</span>
          <button
            onClick={onCancel}
            className="hover:bg-red-600 hover:text-white p-0.5 rounded-xs"
            aria-label="Close dialog"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="p-4 text-xs">
          Do you want to save changes to {fileName || 'Untitled'}?
        </div>

        <div
          className={`flex items-center justify-end px-3 py-2 border-t space-x-2 text-xs ${
            darkMode ? 'bg-[#1f1f1f] border-[#333333]' : 'bg-[#e5e5e5] border-[#cccccc]'
          }`}
        >
          <button
            onClick={onSave}
            className={`px-3 py-1 rounded-xs border font-medium ${
              darkMode ? 'bg-[#333333] border-[#444444] hover:bg-[#444444]' : 'bg-white border-[#999999] hover:bg-gray-100'
            }`}
          >
            Save
          </button>
          <button
            onClick={onDontSave}
            className={`px-3 py-1 rounded-xs border font-medium ${
              darkMode ? 'bg-[#333333] border-[#444444] hover:bg-[#444444]' : 'bg-white border-[#999999] hover:bg-gray-100'
            }`}
          >
            Don't Save
          </button>
          <button
            onClick={onCancel}
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
