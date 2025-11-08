"use client";

import React, { FC } from "react";

// --- SVG Icons (Placeholders based on Figma) ---

const MagicBrushIcon = () => (
  <div className="w-12 h-12 flex-shrink-0 bg-blue-100 rounded-lg flex items-center justify-center">
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M19.707 6.293C19.316 5.902 18.684 5.902 18.293 6.293L12.707 11.879C12.316 12.27 12.316 12.902 12.707 13.293C13.098 13.684 13.73 13.684 14.121 13.293L19.707 7.707C20.098 7.316 20.098 6.684 19.707 6.293Z"
        fill="#2563EB"
      />
      <path
        d="M3 17.5C3 17.5 4.5 16 6 16C7.5 16 9 17.5 11 17.5C13 17.5 14.5 16 16 16C17.5 16 19 17.5 21 17.5V19.5C21 19.5 19.5 18 18 18C16.5 18 15 19.5 13 19.5C11 19.5 9.5 18 8 18C6.5 18 5 19.5 3 19.5V17.5Z"
        fill="#2563EB"
      />
      <path d="M18 9H20V11H18V9Z" fill="#2563EB" />
      <path d="M16 4H18V6H16V4Z" fill="#2563EB" />
      <path d="M20 4H22V6H20V4Z" fill="#2563EB" />
    </svg>
  </div>
);

const EraseIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M16.232 5.232L18.768 7.768M16.232 5.232C15.841 4.841 15.209 4.841 14.818 5.232L6.5 13.55L3 17.05L6.95 21L10.45 17.5L18.768 9.182C19.159 8.791 19.159 8.159 18.768 7.768L16.232 5.232Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M13 7L17 11"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const RestoreIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 2L9.5 8L3 10.5L9.5 13L12 19L14.5 13L21 10.5L14.5 8L12 2Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

interface CutoutPanelProps {
  brushSize: number;
  setBrushSize: (size: number) => void;
  onErase: () => void;
  // onRestore: () => void; // For the future
}

const CutoutPanel: FC<CutoutPanelProps> = ({
  brushSize,
  setBrushSize,
  onErase,
}) => {
  return (
    <aside className="w-80 bg-white shadow-lg z-10 border-l border-gray-200 p-4 flex-shrink-0 flex flex-col">
      <h3 className="text-base font-semibold text-gray-800 mb-4">Cutout</h3>

      {/* Magic Brush Section */}
      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg mb-4">
        <MagicBrushIcon />
        <div>
          <h4 className="font-semibold text-gray-900">Magic Brush</h4>
          <p className="text-sm text-gray-600">
            Easily Erase Or Restore Anything
          </p>
        </div>
      </div>

      {/* Tool Buttons */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <button
          onClick={onErase}
          className="flex flex-col items-center justify-center gap-2 p-3 bg-blue-100 text-blue-700 rounded-lg border-2 border-blue-300 hover:bg-blue-200 transition-colors"
        >
          <EraseIcon />
          <span className="text-sm font-semibold">Erase</span>
        </button>
        <button
          disabled // As requested, restore API is not ready
          className="flex flex-col items-center justify-center gap-2 p-3 bg-gray-100 text-gray-400 rounded-lg border-2 border-gray-200 cursor-not-allowed"
          title="Restore (Coming Soon)"
        >
          <RestoreIcon />
          <span className="text-sm font-semibold">Restore</span>
        </button>
      </div>

      {/* Brush Size Slider */}
      <div>
        <label
          htmlFor="brush-size"
          className="block text-sm font-semibold text-gray-700 mb-2"
        >
          Brush Size
        </label>
        <input
          id="brush-size"
          type="range"
          min="1"
          max="100"
          value={brushSize}
          onChange={(e) => setBrushSize(Number(e.target.value))}
          className="w-full cursor-pointer accent-blue-600"
        />
      </div>
    </aside>
  );
};

export default CutoutPanel;