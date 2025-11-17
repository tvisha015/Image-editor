"use client";

import React, { FC, useState } from "react";
import { SizePreset } from "@/types/editor";

// --- Icons ---
const InstagramIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
);
const CustomIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
);

// --- Presets Data ---
const standardPresets: SizePreset[] = [
  { name: "Square", width: 1080, height: 1080 },
  { name: "Landscape", width: 1920, height: 1080 },
  { name: "Portrait", width: 1080, height: 1350 },
];

const socialPresets: SizePreset[] = [
  { name: "Instagram Story", width: 1080, height: 1920, icon: <InstagramIcon /> },
  { name: "Instagram Post", width: 1080, height: 1080, icon: <InstagramIcon /> },
  { name: "Instagram Portrait", width: 1080, height: 1350, icon: <InstagramIcon /> },
];

interface ResizePanelProps {
  onResize: (width: number, height: number) => void;
  onClose: () => void;
}

const ResizePanel: FC<ResizePanelProps> = ({ onResize, onClose }) => {
  const [selectedPreset, setSelectedPreset] = useState<SizePreset | null>(null);
  const [customWidth, setCustomWidth] = useState(1080);
  const [customHeight, setCustomHeight] = useState(1080);

  const handleApply = () => {
    if (selectedPreset) {
      onResize(selectedPreset.width, selectedPreset.height);
    } else {
      onResize(customWidth, customHeight);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-[400px] max-h-[90vh] overflow-y-auto flex flex-col">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
          <h3 className="text-lg font-bold text-gray-900">Resize Canvas</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Standard Presets */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Standard</h4>
            <div className="space-y-2">
              {standardPresets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => { setSelectedPreset(preset); setCustomWidth(preset.width); setCustomHeight(preset.height); }}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                    selectedPreset?.name === preset.name
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 hover:border-gray-300 text-gray-700"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <CustomIcon /> {preset.name}
                  </span>
                  <span className="text-xs text-gray-400">{preset.width} x {preset.height}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Social Media Presets */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Social Media</h4>
            <div className="space-y-2">
              {socialPresets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => { setSelectedPreset(preset); setCustomWidth(preset.width); setCustomHeight(preset.height); }}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                    selectedPreset?.name === preset.name
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 hover:border-gray-300 text-gray-700"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    {preset.icon} {preset.name}
                  </span>
                  <span className="text-xs text-gray-400">{preset.width} x {preset.height}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Size Input */}
          <div className="pt-2 border-t border-gray-100">
             <div 
                onClick={() => setSelectedPreset(null)}
                className={`p-3 rounded-lg border cursor-pointer mb-2 transition-all ${!selectedPreset ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}
             >
                <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-700">Custom Size</span>
                </div>
                <div className="flex gap-2">
                    <input 
                        type="number" 
                        value={customWidth}
                        onChange={(e) => { setCustomWidth(Number(e.target.value)); setSelectedPreset(null); }}
                        className="w-full p-2 border border-gray-300 rounded text-sm"
                        placeholder="Width"
                    />
                    <span className="self-center text-gray-400">x</span>
                    <input 
                        type="number" 
                        value={customHeight}
                        onChange={(e) => { setCustomHeight(Number(e.target.value)); setSelectedPreset(null); }}
                        className="w-full p-2 border border-gray-300 rounded text-sm"
                        placeholder="Height"
                    />
                </div>
             </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 sticky bottom-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-6 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm transition-colors"
          >
            Resize
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResizePanel;