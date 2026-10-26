import React from 'react';
import { NotepadLogo } from './NotepadLogo.tsx';
import { Plus, X, Minus, Square } from 'lucide-react';

export interface TabItem {
  id: string;
  title: string;
  isDirty?: boolean;
}

interface TitleBarProps {
  tabs: TabItem[];
  activeTabId: string;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string, e: React.MouseEvent) => void;
  onNewTab: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onClose?: () => void;
}

export const TitleBar: React.FC<TitleBarProps> = ({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onNewTab,
  onMinimize,
  onMaximize,
  onClose,
}) => {
  return (
    <div
      className="h-[42px] bg-[#111420] text-[#939bb0] select-none flex items-end justify-between px-2 pt-1 border-b border-[#1b1f30] font-sans"
      role="banner"
    >
      {/* Left: Exact Notepad Logo + Tabs */}
      <div className="flex items-end space-x-1.5 flex-1 min-w-0 pr-4">
        {/* Exact Notepad Logo */}
        <div className="mb-2 mr-1 shrink-0 flex items-center justify-center">
          <NotepadLogo size={20} />
        </div>

        {/* Tab list */}
        <div className="flex items-end space-x-1 overflow-x-auto no-scrollbar max-w-[calc(100%-160px)]">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTabId;
            return (
              <div
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`group flex items-center space-x-2 px-3 py-1.5 text-xs rounded-t-md transition-all cursor-pointer select-none max-w-[210px] min-w-[110px] border-t border-x ${
                  isActive
                    ? 'bg-[#1e2235] text-[#f1f5f9] border-[#292f47] font-medium shadow-xs'
                    : 'bg-transparent text-[#8e98af] border-transparent hover:bg-[#161a29] hover:text-[#cbd5e1]'
                }`}
                title={tab.title}
                role="tab"
                aria-selected={isActive}
              >
                <span className="truncate flex-1 text-[12px]">
                  {tab.isDirty ? `*${tab.title}` : tab.title}
                </span>

                <button
                  type="button"
                  onClick={(e) => onCloseTab(tab.id, e)}
                  className={`w-4 h-4 rounded-xs flex items-center justify-center transition-colors ${
                    isActive
                      ? 'hover:bg-[#2b334d] text-[#a0abbd] hover:text-white'
                      : 'opacity-0 group-hover:opacity-100 hover:bg-[#202538] text-[#8e98af] hover:text-white'
                  }`}
                  aria-label={`Close ${tab.title}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>

        {/* New Tab Button */}
        <button
          type="button"
          onClick={onNewTab}
          className="mb-1.5 p-1 rounded-md text-[#8e98af] hover:text-white hover:bg-[#1e2235] transition-colors shrink-0"
          title="New tab (Ctrl+N)"
          aria-label="New tab"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Right: Window Controls */}
      <div className="flex items-center mb-1 shrink-0 -mr-2">
        <button
          type="button"
          onClick={onMinimize}
          className="h-8 px-3.5 flex items-center justify-center text-[#8e98af] hover:text-white hover:bg-[#1e2235] transition-colors"
          title="Minimize"
          aria-label="Minimize"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={onMaximize}
          className="h-8 px-3.5 flex items-center justify-center text-[#8e98af] hover:text-white hover:bg-[#1e2235] transition-colors"
          title="Maximize"
          aria-label="Maximize"
        >
          <Square className="w-3 h-3" />
        </button>
        <button
          type="button"
          onClick={onClose}
          className="h-8 px-4 flex items-center justify-center text-[#8e98af] hover:text-white hover:bg-[#c42b1c] transition-colors"
          title="Close"
          aria-label="Close"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
