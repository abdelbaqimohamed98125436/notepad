import React from 'react';
import { CursorPosition } from '../types/index.ts';

interface StatusBarProps {
  cursorPos: CursorPosition;
  zoom: number;
  lineEnding: 'CRLF' | 'LF';
  encoding: string;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  cursorPos,
  zoom,
  lineEnding,
  encoding,
}) => {
  return (
    <div
      className="h-[28px] bg-[#11131e] text-[#8b94a8] text-[11px] select-none flex items-center justify-between px-3 border-t border-[#1b1f30] font-sans overflow-hidden shrink-0"
      role="status"
      aria-label="Editor Status"
    >
      {/* Left side: line and column */}
      <div className="flex items-center space-x-3">
        <span>
          Ln {cursorPos.line}, Col {cursorPos.column}
        </span>
        {cursorPos.selectionLength > 0 && (
          <span className="opacity-75">
            ({cursorPos.selectionLength} selected)
          </span>
        )}
      </div>

      {/* Right side: zoom, line endings, encoding */}
      <div className="flex items-center divide-x divide-[#202538]">
        <span className="px-3">{zoom}%</span>
        <span className="px-3">{lineEnding === 'CRLF' ? 'Windows (CRLF)' : 'Unix (LF)'}</span>
        <span className="px-3">{encoding}</span>
      </div>
    </div>
  );
};
