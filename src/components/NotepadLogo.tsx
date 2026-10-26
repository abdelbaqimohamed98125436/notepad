import React from 'react';

interface NotepadLogoProps {
  className?: string;
  size?: number;
}

export const NotepadLogo: React.FC<NotepadLogoProps> = ({ className = '', size = 18 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-label="Windows Notepad Icon"
    >
      {/* 1. Bottom cardboard backing layer (Brown) */}
      <rect x="18" y="72" width="64" height="18" rx="7" fill="#8d5119" />
      <path d="M18 76H82V83C82 86.866 78.866 90 75 90H25C21.134 90 18 86.866 18 83V76Z" fill="#804712" />

      {/* 2. Middle paper sheets layer (White/Off-white) */}
      <rect x="18" y="66" width="64" height="15" rx="5" fill="#e8edf2" />
      <path d="M18 70H82V76C82 78.7614 79.7614 81 77 81H23C20.2386 81 18 78.7614 18 76V70Z" fill="#d9e0e8" />

      {/* 3. Main notebook cover (Vibrant Light Blue) */}
      <rect x="18" y="16" width="64" height="58" rx="8" fill="#4eafe2" />
      {/* Subtle depth gradient highlight */}
      <rect x="18" y="16" width="64" height="58" rx="8" fill="url(#cover-grad)" />

      {/* 4. Three horizontal rounded lines on the cover (Dark Teal) */}
      <rect x="29" y="31" width="42" height="5.5" rx="2.75" fill="#0d6583" />
      <rect x="29" y="44" width="42" height="5.5" rx="2.75" fill="#0d6583" />
      <rect x="29" y="57" width="42" height="5.5" rx="2.75" fill="#0d6583" />

      {/* 5. Four top binder loops / rings (Dark Teal) */}
      {/* Loop 1 */}
      <rect x="25" y="9" width="7.5" height="13" rx="3.75" fill="#0d6583" />
      {/* Loop 2 */}
      <rect x="39" y="9" width="7.5" height="13" rx="3.75" fill="#0d6583" />
      {/* Loop 3 */}
      <rect x="53" y="9" width="7.5" height="13" rx="3.75" fill="#0d6583" />
      {/* Loop 4 */}
      <rect x="67" y="9" width="7.5" height="13" rx="3.75" fill="#0d6583" />

      <defs>
        <linearGradient id="cover-grad" x1="18" y1="16" x2="82" y2="74" gradientUnits="userSpaceOnUse">
          <stop stopColor="#67bdec" stopOpacity="0.4" />
          <stop offset="1" stopColor="#3b9ed4" stopOpacity="0.2" />
        </linearGradient>
      </defs>
    </svg>
  );
};
