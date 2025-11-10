"use client";

import React from "react";
import { EditorTab } from "./index";
import { Tool } from "@/types/editor";

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
  // All brush and remove object props are REMOVED
}

const CanvasControls: React.FC<CanvasControlsProps> = ({
  activeTab,
  isPreviewing,
  hasBeenEdited,
  onTogglePreview,
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
      default:
        return (
          <span className="text-sm text-gray-500">
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} controls
          </span>
        );
    }
  };

  return (
    <header className="w-full h-16 bg-white flex items-center justify-between px-6 border-b border-gray-200 flex-shrink-0">
      {/* Left Side: Tab-specific controls */}
      <div className="flex-1">
        {!isPreviewing ? (
          renderTabControls()
        ) : (
          <span className="text-sm font-semibold text-gray-600">
            Preview Mode
          </span>
        )}
      </div>

      {/* Right Side: Before/After Toggle */}
      {hasBeenEdited && (
        <PreviewToggle isPreviewing={isPreviewing} onToggle={onTogglePreview} />
      )}
    </header>
  );
};

export default CanvasControls;
