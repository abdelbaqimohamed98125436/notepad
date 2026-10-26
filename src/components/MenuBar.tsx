import React, { useState, useRef, useEffect } from 'react';
import { Settings, Check } from 'lucide-react';

export interface MenuBarProps {
  wordWrap: boolean;
  showStatusBar: boolean;
  canUndo: boolean;
  canRedo: boolean;
  textDirection: 'auto' | 'ltr' | 'rtl';
  onNew: () => void;
  onOpen: () => void;
  onSave: () => void;
  onSaveAs: () => void;
  onPrint: () => void;
  onShareGoogleChat: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onCut: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onSelectAll: () => void;
  onFind: () => void;
  onReplace: () => void;
  onInsertDateTime: () => void;
  onToggleWordWrap: () => void;
  onOpenFontModal: () => void;
  onChangeDirection: (dir: 'auto' | 'ltr' | 'rtl') => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onToggleStatusBar: () => void;
  onOpenSettings: () => void;
  onOpenAssistant: () => void;
}

export const MenuBar: React.FC<MenuBarProps> = ({
  wordWrap,
  showStatusBar,
  canUndo,
  canRedo,
  textDirection,
  onNew,
  onOpen,
  onSave,
  onSaveAs,
  onPrint,
  onShareGoogleChat,
  onUndo,
  onRedo,
  onCut,
  onCopy,
  onPaste,
  onSelectAll,
  onFind,
  onReplace,
  onInsertDateTime,
  onToggleWordWrap,
  onOpenFontModal,
  onChangeDirection,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onToggleStatusBar,
  onOpenSettings,
  onOpenAssistant,
}) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const menuBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuBarRef.current && !menuBarRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };
    window.addEventListener('mousedown', handleOutsideClick);
    return () => window.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleMenuClick = (menu: string) => {
    setActiveMenu(activeMenu === menu ? null : menu);
  };

  const handleMenuHover = (menu: string) => {
    if (activeMenu !== null && activeMenu !== menu) {
      setActiveMenu(menu);
    }
  };

  const execute = (action: () => void) => {
    setActiveMenu(null);
    action();
  };

  const menuButtonClass = (name: string) =>
    `px-3 py-1.5 text-xs select-none rounded-md transition-colors ${
      activeMenu === name
        ? 'bg-[#282e45] text-white'
        : 'text-[#c2c9d6] hover:bg-[#202538] hover:text-white'
    }`;

  const dropdownClass =
    'absolute top-full left-0 z-50 min-w-[220px] py-1 border shadow-2xl rounded-md bg-[#1c2033] border-[#2c334d] text-[#e2e8f0]';

  const itemClass = (disabled = false) =>
    `flex items-center justify-between px-3 py-1.5 text-xs cursor-default select-none rounded-xs mx-1 transition-colors ${
      disabled
        ? 'opacity-40 cursor-not-allowed'
        : 'hover:bg-[#29304a] hover:text-white'
    }`;

  const separatorClass = 'my-1 border-t border-[#29304a]';

  return (
    <div
      ref={menuBarRef}
      className="h-[36px] bg-[#171a27] border-b border-[#202538] flex items-center justify-between px-3 text-xs select-none font-sans"
      role="menubar"
    >
      {/* Left: File, Edit, View */}
      <div className="flex items-center space-x-1">
        {/* File Menu */}
        <div className="relative">
          <button
            className={menuButtonClass('file')}
            onClick={() => handleMenuClick('file')}
            onMouseEnter={() => handleMenuHover('file')}
            role="menuitem"
            aria-haspopup="true"
            aria-expanded={activeMenu === 'file'}
          >
            File
          </button>
          {activeMenu === 'file' && (
            <div className={dropdownClass} role="menu">
              <button className={itemClass()} onClick={() => execute(onNew)} role="menuitem">
                <span>New tab</span>
                <span className="text-[11px] opacity-60 ml-6">Ctrl+N</span>
              </button>
              <button className={itemClass()} onClick={() => execute(onOpen)} role="menuitem">
                <span>Open...</span>
                <span className="text-[11px] opacity-60 ml-6">Ctrl+O</span>
              </button>
              <button className={itemClass()} onClick={() => execute(onSave)} role="menuitem">
                <span>Save</span>
                <span className="text-[11px] opacity-60 ml-6">Ctrl+S</span>
              </button>
              <button className={itemClass()} onClick={() => execute(onSaveAs)} role="menuitem">
                <span>Save As...</span>
                <span className="text-[11px] opacity-60 ml-6">Ctrl+Shift+S</span>
              </button>
              <div className={separatorClass} />
              <button className={itemClass()} onClick={() => execute(onShareGoogleChat)} role="menuitem">
                <span>Share to Google Chat...</span>
              </button>
              <div className={separatorClass} />
              <button className={itemClass()} onClick={() => execute(onPrint)} role="menuitem">
                <span>Print...</span>
                <span className="text-[11px] opacity-60 ml-6">Ctrl+P</span>
              </button>
            </div>
          )}
        </div>

        {/* Edit Menu */}
        <div className="relative">
          <button
            className={menuButtonClass('edit')}
            onClick={() => handleMenuClick('edit')}
            onMouseEnter={() => handleMenuHover('edit')}
            role="menuitem"
            aria-haspopup="true"
            aria-expanded={activeMenu === 'edit'}
          >
            Edit
          </button>
          {activeMenu === 'edit' && (
            <div className={dropdownClass} role="menu">
              <button
                className={itemClass(!canUndo)}
                disabled={!canUndo}
                onClick={() => execute(onUndo)}
                role="menuitem"
              >
                <span>Undo</span>
                <span className="text-[11px] opacity-60 ml-6">Ctrl+Z</span>
              </button>
              <button
                className={itemClass(!canRedo)}
                disabled={!canRedo}
                onClick={() => execute(onRedo)}
                role="menuitem"
              >
                <span>Redo</span>
                <span className="text-[11px] opacity-60 ml-6">Ctrl+Y</span>
              </button>
              <div className={separatorClass} />
              <button className={itemClass()} onClick={() => execute(onCut)} role="menuitem">
                <span>Cut</span>
                <span className="text-[11px] opacity-60 ml-6">Ctrl+X</span>
              </button>
              <button className={itemClass()} onClick={() => execute(onCopy)} role="menuitem">
                <span>Copy</span>
                <span className="text-[11px] opacity-60 ml-6">Ctrl+C</span>
              </button>
              <button className={itemClass()} onClick={() => execute(onPaste)} role="menuitem">
                <span>Paste</span>
                <span className="text-[11px] opacity-60 ml-6">Ctrl+V</span>
              </button>
              <div className={separatorClass} />
              <button className={itemClass()} onClick={() => execute(onFind)} role="menuitem">
                <span>Find...</span>
                <span className="text-[11px] opacity-60 ml-6">Ctrl+F</span>
              </button>
              <button className={itemClass()} onClick={() => execute(onReplace)} role="menuitem">
                <span>Replace...</span>
                <span className="text-[11px] opacity-60 ml-6">Ctrl+H</span>
              </button>
              <button className={itemClass()} onClick={() => execute(onSelectAll)} role="menuitem">
                <span>Select All</span>
                <span className="text-[11px] opacity-60 ml-6">Ctrl+A</span>
              </button>
              <button className={itemClass()} onClick={() => execute(onInsertDateTime)} role="menuitem">
                <span>Time/Date</span>
                <span className="text-[11px] opacity-60 ml-6">F5</span>
              </button>
              <div className={separatorClass} />
              <button className={itemClass()} onClick={() => execute(onOpenAssistant)} role="menuitem">
                <span>Writing Assistant...</span>
                <span className="text-[11px] opacity-60 ml-6">Ctrl+Space</span>
              </button>
            </div>
          )}
        </div>

        {/* View Menu */}
        <div className="relative">
          <button
            className={menuButtonClass('view')}
            onClick={() => handleMenuClick('view')}
            onMouseEnter={() => handleMenuHover('view')}
            role="menuitem"
            aria-haspopup="true"
            aria-expanded={activeMenu === 'view'}
          >
            View
          </button>
          {activeMenu === 'view' && (
            <div className={dropdownClass} role="menu">
              <button className={itemClass()} onClick={() => execute(onZoomIn)} role="menuitem">
                <span>Zoom In</span>
                <span className="text-[11px] opacity-60 ml-6">Ctrl+Plus</span>
              </button>
              <button className={itemClass()} onClick={() => execute(onZoomOut)} role="menuitem">
                <span>Zoom Out</span>
                <span className="text-[11px] opacity-60 ml-6">Ctrl+Minus</span>
              </button>
              <button className={itemClass()} onClick={() => execute(onZoomReset)} role="menuitem">
                <span>Restore Default Zoom</span>
                <span className="text-[11px] opacity-60 ml-6">Ctrl+0</span>
              </button>
              <div className={separatorClass} />
              <button className={itemClass()} onClick={() => execute(onToggleWordWrap)} role="menuitem">
                <span className="flex items-center">
                  <span className="w-4 mr-1.5">
                    {wordWrap && <Check className="w-3.5 h-3.5 text-sky-400" />}
                  </span>
                  Word Wrap
                </span>
              </button>
              <button className={itemClass()} onClick={() => execute(onToggleStatusBar)} role="menuitem">
                <span className="flex items-center">
                  <span className="w-4 mr-1.5">
                    {showStatusBar && <Check className="w-3.5 h-3.5 text-sky-400" />}
                  </span>
                  Status Bar
                </span>
              </button>
              <div className={separatorClass} />
              <div className="px-3 py-1 text-[11px] font-semibold opacity-60">Text Direction</div>
              <button className={itemClass()} onClick={() => execute(() => onChangeDirection('auto'))} role="menuitem">
                <span className="flex items-center">
                  <span className="w-4 mr-1.5">
                    {textDirection === 'auto' && <Check className="w-3.5 h-3.5 text-sky-400" />}
                  </span>
                  Auto Detect (BiDi)
                </span>
              </button>
              <button className={itemClass()} onClick={() => execute(() => onChangeDirection('ltr'))} role="menuitem">
                <span className="flex items-center">
                  <span className="w-4 mr-1.5">
                    {textDirection === 'ltr' && <Check className="w-3.5 h-3.5 text-sky-400" />}
                  </span>
                  Left-to-Right (English)
                </span>
              </button>
              <button className={itemClass()} onClick={() => execute(() => onChangeDirection('rtl'))} role="menuitem">
                <span className="flex items-center">
                  <span className="w-4 mr-1.5">
                    {textDirection === 'rtl' && <Check className="w-3.5 h-3.5 text-sky-400" />}
                  </span>
                  Right-to-Left (Arabic)
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right: Exact Settings Gear icon from Image 1 */}
      <div>
        <button
          type="button"
          onClick={onOpenSettings}
          className="p-1.5 rounded-md text-[#8e98af] hover:text-white hover:bg-[#202538] transition-colors"
          title="Settings"
          aria-label="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
