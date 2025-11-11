"use client";

import React, { FC } from "react";
import { textDesigns, templates } from "@/libs/fabric/designAssets";

interface DesignPanelProps {
  // Updated signature to accept text and style object
  onAddTextDesign: (text: string, style: any) => void;
  onSelectTemplate: (imageUrl: string) => void;
  onRemoveTemplate: () => void;
}

const BanIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="text-gray-400"
  >
    <path
      d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4.92993 4.92999L19.07 19.07"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const DesignPanel: FC<DesignPanelProps> = ({ onAddTextDesign, onSelectTemplate, onRemoveTemplate }) => {
  return (
    <aside className="w-80 bg-white shadow-lg z-10 border-l border-gray-200 p-4 flex-shrink-0 flex flex-col gap-6 overflow-y-auto">
      <h3 className="text-base font-semibold text-gray-800">Design</h3>

      {/* --- Add Text Section --- */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Add Text</h4>
        <div className="grid grid-cols-2 gap-3">
          {textDesigns.map((design) => (
            <button
              key={design.id}
              // Pass the specific style and default text for this design
              onClick={() => onAddTextDesign(design.defaultText, design.style)}
              className="h-20 rounded-md flex items-center justify-center transition-transform hover:scale-105 shadow-sm border border-gray-100 bg-gray-50 overflow-hidden p-2"
              title={`Add ${design.id}`}
            >
              <img
                src={design.previewUrl}
                alt={design.id}
                className="max-h-full max-w-full object-contain"
              />
            </button>
          ))}
        </div>
      </div>

      {/* --- Templates Section --- */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">
          Use A Template
        </h4>
        <div className="grid grid-cols-3 gap-2">
          
          {/* --- NEW: Discard Button --- */}
          <button
            onClick={onRemoveTemplate}
            className="relative w-full aspect-square bg-white rounded-md overflow-hidden hover:bg-gray-50 transition-colors border-2 border-dashed border-gray-300 flex items-center justify-center flex-col gap-1"
            title="Remove Template"
          >
            <BanIcon />
            <span className="text-xs text-gray-500 font-medium">None</span>
          </button>

          {/* Existing Templates */}
          {templates.map((template) => (
            <button
              key={template.id}
              onClick={() => onSelectTemplate(template.url)}
              className="relative w-full aspect-square bg-gray-100 rounded-md overflow-hidden hover:opacity-80 transition-opacity border border-gray-200"
            >
              <img
                src={template.previewUrl}
                alt={template.id}
                className="object-cover w-full h-full"
              />
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default DesignPanel;