// src/components/Editor/EditorHeader.tsx
"use client";

import React from "react";
import { Tool } from "../../types/editor";

const EditorHeader: React.FC<{
  brushSize: number;
  setBrushSize: (size: number) => void;
  activeTool: Tool;
  onStartNew: () => void;
  handleRemoveObject: () => void;
  handleDownloadImage: () => void;
  hasBeenEdited: boolean;
  isPreviewing: boolean;
  onTogglePreview: () => void;
  isBgPanelOpen: boolean;
}> = ({
  brushSize,
  setBrushSize,
  activeTool,
  onStartNew,
  handleRemoveObject,
  handleDownloadImage,
  hasBeenEdited,
  isPreviewing,
  onTogglePreview,
  isBgPanelOpen,
}) => (
  <header className="flex justify-between items-center p-4 border-b border-slate-200">
    <div className="flex items-center gap-4">
      <h1 className="text-xl font-semibold text-slate-800 mr-4 hidden sm:block">
        Editor
      </h1>
      {activeTool === "brush" && !isPreviewing ? (
        <div className="flex items-center gap-3 text-slate-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" />
          </svg>
          <input
            type="range"
            min="1"
            max="100"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="w-32 cursor-pointer accent-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isPreviewing}
          />
          <div className="text-sm text-slate-600">Size: {brushSize}</div>
        </div>
      ) : (
        <div className="text-sm text-slate-400">
          {isBgPanelOpen 
            ? "Select a background color/image" 
            : isPreviewing 
            ? "Previewing changes" 
            : "Select a tool to start editing"}
        </div>
      )}
    </div>
    <div className="flex items-center gap-4">
      <button
        onClick={onStartNew}
        className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isPreviewing}
      >
        Start New
      </button>

      {hasBeenEdited && (
        <button
          onClick={onTogglePreview}
          className="text-sm font-medium text-purple-600 hover:text-purple-800 transition-colors py-2 px-4 rounded-lg bg-purple-100"
        >
          {isPreviewing ? "Hide Preview" : "Show Preview"}
        </button>
      )}

      {/* This button was missing from your file but is needed for the remove object feature */}
      {activeTool === "brush" && (
        <button
          onClick={handleRemoveObject}
          className="bg-teal-500 text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-teal-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isPreviewing}
        >
          Remove Object
        </button>
      )}

      <button
        onClick={handleDownloadImage}
        className="bg-purple-600 text-white font-bold py-2 px-6 rounded-lg shadow-md hover:bg-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isPreviewing}
      >
        Download
      </button>
    </div>
  </header>
);

export default EditorHeader;