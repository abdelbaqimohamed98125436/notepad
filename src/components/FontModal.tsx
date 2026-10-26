import React, { useState } from 'react';
import { X } from 'lucide-react';
import { EditorSettings } from '../types/index.ts';

interface FontModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: EditorSettings;
  onSaveFont: (fontFamily: string, fontSize: number, fontBold: boolean, fontItalic: boolean) => void;
  darkMode: boolean;
}

const FONT_FAMILIES = [
  'Consolas, monospace',
  'Lucida Console, monospace',
  'Courier New, monospace',
  'Segoe UI, sans-serif',
  'Arial, sans-serif',
  'Tahoma, sans-serif',
  'Georgia, serif',
  'Times New Roman, serif',
  'Amiri, serif', // Arabic typography
];

const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 28, 36, 48];

export const FontModal: React.FC<FontModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveFont,
  darkMode,
}) => {
  const [selectedFont, setSelectedFont] = useState(settings.fontFamily);
  const [selectedSize, setSelectedSize] = useState(settings.fontSize);
  const [isBold, setIsBold] = useState(settings.fontBold);
  const [isItalic, setIsItalic] = useState(settings.fontItalic);

  if (!isOpen) return null;

  const handleApply = () => {
    onSaveFont(selectedFont, selectedSize, isBold, isItalic);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-2xs"
      role="dialog"
      aria-modal="true"
      aria-label="Font Settings"
    >
      <div
        className={`w-full max-w-lg rounded-sm border shadow-xl flex flex-col ${
          darkMode ? 'bg-[#252526] border-[#3e3e42] text-white' : 'bg-[#f0f0f0] border-[#999999] text-black'
        }`}
      >
        {/* Title Bar */}
        <div
          className={`flex items-center justify-between px-3 py-1.5 border-b select-none text-xs ${
            darkMode ? 'bg-[#1f1f1f] border-[#333333]' : 'bg-[#e5e5e5] border-[#cccccc]'
          }`}
        >
          <span className="font-semibold">Font</span>
          <button
            onClick={onClose}
            className="hover:bg-red-600 hover:text-white p-0.5 rounded-xs"
            aria-label="Close dialog"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Chooser columns */}
        <div className="p-4 grid grid-cols-3 gap-3 text-xs">
          {/* Font Family */}
          <div>
            <label className="font-medium block mb-1">Font:</label>
            <div
              className={`border rounded-xs h-36 overflow-y-auto ${
                darkMode ? 'bg-[#1e1e1e] border-[#383838]' : 'bg-white border-[#cccccc]'
              }`}
            >
              {FONT_FAMILIES.map((font) => {
                const label = font.split(',')[0].trim();
                return (
                  <div
                    key={font}
                    onClick={() => setSelectedFont(font)}
                    className={`px-2 py-1 cursor-pointer truncate ${
                      selectedFont === font
                        ? 'bg-sky-600 text-white'
                        : darkMode
                        ? 'hover:bg-gray-700'
                        : 'hover:bg-gray-200'
                    }`}
                  >
                    {label}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Font Style */}
          <div>
            <label className="font-medium block mb-1">Font style:</label>
            <div
              className={`border rounded-xs h-36 overflow-y-auto space-y-0.5 p-1 ${
                darkMode ? 'bg-[#1e1e1e] border-[#383838]' : 'bg-white border-[#cccccc]'
              }`}
            >
              <label className="flex items-center space-x-2 p-1 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isBold}
                  onChange={(e) => setIsBold(e.target.checked)}
                />
                <span className="font-bold">Bold</span>
              </label>
              <label className="flex items-center space-x-2 p-1 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isItalic}
                  onChange={(e) => setIsItalic(e.target.checked)}
                />
                <span className="italic">Italic</span>
              </label>
            </div>
          </div>

          {/* Font Size */}
          <div>
            <label className="font-medium block mb-1">Size:</label>
            <div
              className={`border rounded-xs h-36 overflow-y-auto ${
                darkMode ? 'bg-[#1e1e1e] border-[#383838]' : 'bg-white border-[#cccccc]'
              }`}
            >
              {FONT_SIZES.map((size) => (
                <div
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-2 py-1 cursor-pointer ${
                    selectedSize === size
                      ? 'bg-sky-600 text-white'
                      : darkMode
                      ? 'hover:bg-gray-700'
                      : 'hover:bg-gray-200'
                  }`}
                >
                  {size}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sample Preview */}
        <div className="px-4 pb-4">
          <fieldset className="border border-gray-300 dark:border-gray-700 p-3 rounded-xs">
            <legend className="text-[11px] px-1 opacity-75">Sample</legend>
            <div
              className="h-16 flex items-center justify-center text-center overflow-hidden"
              style={{
                fontFamily: selectedFont,
                fontSize: `${Math.min(selectedSize, 28)}px`,
                fontWeight: isBold ? 'bold' : 'normal',
                fontStyle: isItalic ? 'italic' : 'normal',
              }}
            >
              AaBbYyZz - المفكرة الهادئة 123
            </div>
          </fieldset>
        </div>

        {/* Buttons */}
        <div
          className={`flex items-center justify-end px-3 py-2 border-t space-x-2 text-xs ${
            darkMode ? 'bg-[#1f1f1f] border-[#333333]' : 'bg-[#e5e5e5] border-[#cccccc]'
          }`}
        >
          <button
            onClick={handleApply}
            className={`px-4 py-1 rounded-xs border font-medium ${
              darkMode ? 'bg-[#333333] border-[#444444] hover:bg-[#444444]' : 'bg-white border-[#999999] hover:bg-gray-100'
            }`}
          >
            OK
          </button>
          <button
            onClick={onClose}
            className={`px-4 py-1 rounded-xs border font-medium ${
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
