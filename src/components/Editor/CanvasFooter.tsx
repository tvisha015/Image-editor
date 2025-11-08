"use client";

import React from "react";

// --- Placeholder Icons ---
const UndoIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12.5 8C9.81 8 7.45 8.99 5.6 10.6L2 7V16H11L7.38 12.38C8.77 11.22 10.54 10.5 12.5 10.5C16.04 10.5 19.05 12.81 20.1 16L22.47 15.2C21.01 10.97 17.13 8 12.5 8Z"
      fill="currentColor"
    />
  </svg>
);

const RedoIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M18.4 10.6C16.55 8.99 14.19 8 11.5 8C6.87 8 2.99 10.97 1.53 15.2L3.9 16C5.05 12.81 8.04 10.5 11.5 10.5C13.46 10.5 15.23 11.22 16.62 12.38L13 16H22V7L18.4 10.6Z"
      fill="currentColor"
    />
  </svg>
);

interface CanvasFooterProps {
  onDownload: () => void;
}

const CanvasFooter: React.FC<CanvasFooterProps> = ({ onDownload }) => {
  return (
    <footer className="w-full h-16 bg-white flex items-center justify-between px-6 border-t border-gray-200 flex-shrink-0">
      {/* Left Side: Undo/Redo */}
      <div className="flex items-center gap-2">
        <button
          title="Undo (Not Implemented)"
          className="p-2 rounded-md text-gray-400 cursor-not-allowed"
          disabled
        >
          <UndoIcon />
        </button>
        <button
          title="Redo (Not Implemented)"
          className="p-2 rounded-md text-gray-400 cursor-not-allowed"
          disabled
        >
          <RedoIcon />
        </button>
      </div>

      {/* Right Side: Download Button */}
      <button
        onClick={onDownload}
        className="font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors px-6 py-2.5 rounded-lg shadow-sm"
      >
        Download
      </button>
    </footer>
  );
};

export default CanvasFooter;