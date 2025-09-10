// src/components/Editor/EditorHeader.tsx
"use client";

import React, { FC } from "react";
import { Tool } from "../../types/editor"; 

const EditorHeader: FC<{
  brushSize: number;
  setBrushSize: (size: number) => void;
  activeTool: Tool;
  onStartNew: () => void;
  handleDownload: () => void;
}> = ({ brushSize, setBrushSize, activeTool, onStartNew, handleDownload }) => (
  <header className="flex justify-between items-center p-4 border-b border-slate-700">
    <div className="flex items-center gap-4">
      <h1 className="text-xl font-semibold text-white mr-4 hidden sm:block">Editor</h1>
      <div className="flex items-center gap-3 text-slate-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" />
        </svg>
        <input
          type="range"
          min="5"
          max="100"
          value={brushSize}
          onChange={(e) => setBrushSize(Number(e.target.value))}
          className="w-32 cursor-pointer accent-purple-600"
          disabled={activeTool === "pan"}
        />
      </div>
    </div>
    <div className="flex items-center gap-4">
      <button onClick={onStartNew} className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
        Start New
      </button>
      <button onClick={handleDownload} className="bg-purple-600 text-white font-bold py-2 px-6 rounded-lg shadow-lg hover:bg-purple-700 transition-all transform hover:scale-105">
        Download
      </button>
    </div>
  </header>
);

export default EditorHeader;