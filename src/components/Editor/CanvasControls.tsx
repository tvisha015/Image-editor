// src/components/Editor/CanvasControls.tsx
"use client";

import React from "react";
import { EditorTab } from "./index";
import { Tool } from "@/types/editor";

// --- Icons ---
const ResizeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
);
// --- Before/After Toggle Component ---
const PreviewToggle: React.FC<{
  isPreviewing: boolean;
  onToggle: () => void;
}> = ({ isPreviewing, onToggle }) => (
  <div className="flex items-center bg-gray-200 rounded-lg p-0.5">
    <button
      onClick={!isPreviewing ? onToggle : undefined}
      className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors
        ${
          !isPreviewing ? "text-gray-600" : "bg-white text-gray-900 shadow-sm"
        }`}
    >
      Before
    </button>
    <button
      onClick={isPreviewing ? onToggle : undefined}
      className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors
        ${
          !isPreviewing ? "bg-white text-gray-900 shadow-sm" : "text-gray-600"
        }`}
    >
      After
    </button>
  </div>
);

// --- BrushControls sub-component is REMOVED ---

// --- Main Controls Header Component ---
interface CanvasControlsProps {
  activeTab: EditorTab;
  isPreviewing: boolean;
  hasBeenEdited: boolean;
  onTogglePreview: () => void;
  onOpenResize: () => void;
}

const CanvasControls: React.FC<CanvasControlsProps> = ({
  activeTab,
  isPreviewing,
  hasBeenEdited,
  onTogglePreview,
  onOpenResize,
}) => {
  // Conditionally render controls based on the active tab
  const renderTabControls = () => {
    switch (activeTab) {
      case "backgrounds":
        return (
          <span className="text-sm font-semibold text-gray-600">
            Select a background from the panel
          </span>
        );
      case "cutout":
        // The controls are now in the right panel, so just show a message.
        return (
          <span className="text-sm font-semibold text-gray-600">
            Draw on the image to erase
          </span>
        );
      case "effect": 
        return (
          <span className="text-sm font-semibold text-gray-600">
            Apply filters and effects from the panel
          </span>
        );
      case "adjust":
        return (
          <span className="text-sm font-semibold text-gray-600">
            Fine-tune brightness, contrast, and more
          </span>
        );
      case "design":
        return (
          <span className="text-sm font-semibold text-gray-600">
            Add text stickers or overlay templates
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <header className="w-full h-16 bg-white flex items-center justify-between px-6 border-b border-gray-200 flex-shrink-0">
      <div className="flex-1 flex items-center gap-4">
        
        {/* --- RESIZE BUTTON --- */}
        <button 
            onClick={onOpenResize}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
            <ResizeIcon />
            Resize
        </button>

        <div className="h-6 w-px bg-gray-300 mx-2"></div>

        {!isPreviewing ? (
          renderTabControls()
        ) : (
          <span className="text-sm font-semibold text-gray-600">Preview Mode</span>
        )}
      </div>

      {hasBeenEdited && (
        <PreviewToggle isPreviewing={isPreviewing} onToggle={onTogglePreview} />
      )}
    </header>
  );
};

export default CanvasControls;
