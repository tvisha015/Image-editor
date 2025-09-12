// FILE: src/components/Editor/EditorToolbar.tsx
// ---------------------------------------------

"use client";

import React from "react";
import ToolButton from "./ToolButton";
import { Tool } from "../../types/editor";

const EditorToolbar: React.FC<{
  activeTool: Tool;
  setActiveTool: (tool: Tool) => void;
}> = ({ activeTool, setActiveTool }) => {
  
  const handleToolClick = (tool: Tool) => {
    // If the clicked tool is already active, switch to cursor tool (deselect)
    if (activeTool === tool) {
      setActiveTool("cursor");
    } else {
      setActiveTool(tool);
    }
  };

  return (
    <aside className="w-20 bg-slate-100 p-4 flex flex-col items-center space-y-4 border-r border-slate-200">
      <div className="w-12 h-12 bg-purple-600 rounded-xl text-white flex items-center justify-center font-bold text-2xl shrink-0">
        B
      </div>

      {/* Cursor Tool */}
      <ToolButton 
        title="Cursor" 
        onClick={() => handleToolClick("cursor")} 
        isActive={activeTool === "cursor"}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-2 5L9 9l5-2 2 8z" />
        </svg>
      </ToolButton>

      {/* Brush/Erase Tool */}
      <ToolButton 
        title="Erase Tool" 
        onClick={() => handleToolClick("brush")} 
        isActive={activeTool === "brush"}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" />
        </svg>
      </ToolButton>
    </aside>
  );
};

export default EditorToolbar;