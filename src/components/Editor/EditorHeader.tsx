"use client";

import React, { FC } from "react";
import { Tool } from "../../types/editor"; 

// Updated props to accept the new handler functions
const EditorHeader: FC<{
  brushSize: number;
  setBrushSize: (size: number) => void;
  activeTool: Tool;
  onStartNew: () => void;
  handleDownloadMask: () => void; // New prop for downloading the mask
  handleRemoveObject: () => void; // New prop for calling the API
}> = ({ 
    brushSize, 
    setBrushSize, 
    activeTool, 
    onStartNew, 
    handleDownloadMask, 
    handleRemoveObject 
}) => (
  <header className="flex justify-between items-center p-4 border-b border-slate-200">
    <div className="flex items-center gap-4">
      <h1 className="text-xl font-semibold text-slate-800 mr-4 hidden sm:block">Editor</h1>
      {activeTool === "brush" ? (
        <div className="flex items-center gap-3 text-slate-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" />
          </svg>
            <input
              type="range"
              min="0"
              max="100"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="w-32 cursor-pointer accent-purple-600"
            />
          <div className="text-sm text-slate-600">
            Size: {brushSize}
          </div>
        </div>
      ) : (
        <div className="text-sm text-slate-400">
          Select a tool to start editing
        </div>
      )}
    </div>
    <div className="flex items-center gap-4">
      <button onClick={onStartNew} className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
        Start New
      </button>

      {/* Button for downloading the mask (for testing) */}
      <button 
        onClick={handleDownloadMask} 
        className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors px-4 py-2 rounded-md bg-slate-200 hover:bg-slate-300"
      >
        Test Mask
      </button>
      
      {/* Primary button to call the API and remove the object */}
      <button 
        onClick={handleRemoveObject} 
        className="bg-purple-600 text-white font-bold py-2 px-6 rounded-lg shadow-lg hover:bg-purple-700 transition-all transform hover:scale-105"
      >
        Remove Object
      </button>
    </div>
  </header>
);

export default EditorHeader;