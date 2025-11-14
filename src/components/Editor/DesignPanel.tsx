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
    <aside className="w-80 bg-white shadow-lg z-10 border-l border-gray-200 flex flex-col h-full">
      
      {/* Fixed Header */}
      <div className="p-4 border-b border-gray-100 flex-shrink-0">
        <h3 className="text-base font-semibold text-gray-800">Design</h3>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
        
        {/* --- Add Text Section --- */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Add Text</h4>
          
          <div className="grid grid-cols-2 gap-3 max-h-[180px] overflow-y-auto custom-scrollbar pr-2">
            {textDesigns.map((design) => (
              <button
                key={design.id}
                onClick={() => onAddTextDesign(design.defaultText, design.style)}
                className="h-20 rounded-md flex items-center justify-center transition-transform hover:scale-105 shadow-sm border border-gray-100 bg-gray-50 overflow-hidden p-2 group shrink-0"
                title={`Add ${design.id}`}
              >
                <img
                  src={design.previewUrl}
                  alt={design.id}
                  className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-200"
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
            
            {/* Discard Button */}
            <button
              onClick={onRemoveTemplate}
              className="relative w-full aspect-square bg-white rounded-md overflow-hidden hover:bg-gray-50 transition-colors border-2 border-dashed border-gray-300 flex items-center justify-center flex-col gap-1"
              title="Remove Template"
            >
              <BanIcon />
              <span className="text-xs text-gray-500 font-medium">None</span>
            </button>

            {/* Templates List */}
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => onSelectTemplate(template.url)}
                className="relative w-full aspect-square bg-gray-100 rounded-md overflow-hidden hover:opacity-80 transition-opacity border border-gray-200 group"
              >
                <img
                  src={template.previewUrl}
                  alt={template.id}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-200"
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default DesignPanel;