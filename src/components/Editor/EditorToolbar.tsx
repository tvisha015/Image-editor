// src/components/Editor/EditorToolbar.tsx
"use client";

import React, { FC } from "react";
import ToolButton from "./ToolButton";
import { Tool } from "../../types/editor";

const EditorToolbar: FC<{
  activeTool: Tool;
  setActiveTool: (tool: Tool) => void;
}> = ({ activeTool, setActiveTool }) => (
  <aside className="w-20 bg-slate-900/50 p-4 flex flex-col items-center space-y-4">
    {/* Toolbar title */}
    <div className="w-12 h-12 bg-purple-600 rounded-xl text-white flex items-center justify-center font-bold text-2xl shrink-0">
      R
    </div>
    {/* Toolbar buttons */}
    <ToolButton title="Pan Tool" onClick={() => setActiveTool("pan")} isActive={activeTool === "pan"}>
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    </ToolButton>
    {/* Erase Tool */}
    <ToolButton title="Erase Tool" onClick={() => setActiveTool("erase")} isActive={activeTool === "erase"}>
       <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
         <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
       </svg>
    </ToolButton>
    {/* Restore Tool */}
    <ToolButton title="Restore Tool" onClick={() => setActiveTool("restore")} isActive={activeTool === "restore"}>
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9H0v5h4.582m15.356 2a8.001 8.001 0 01-15.356-2H24v-5h-4.582z" />
      </svg>
    </ToolButton>
  </aside>
);

export default EditorToolbar;