"use client";

import React, { FC } from "react";

// An SVG icon for the transparent option
const TransparentIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 0H24V24H0V0Z" fill="url(#pattern0)"/>
    <defs>
      <pattern id="pattern0" patternContentUnits="objectBoundingBox" width="1" height="1">
        <use href="#image0" transform="scale(0.0416667)"/>
      </pattern>
      <image id="image0" width="24" height="24" href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAD9JREFUSEtjZGBgYJD//z8DEiALKDFge/YMYP/5/x/IAMp/gAyYyQDEwADy589AXAxEBdTAf8B6A7E1EA0A30sWFeT4sDMAAAAASUVORK5CYII="/>
    </defs>
  </svg>
);

interface BackgroundColorPanelProps {
  onColorChange: (color: string) => void;
  onClose: () => void;
}

const BackgroundColorPanel: FC<BackgroundColorPanelProps> = ({ onColorChange, onClose }) => {
  const PRESET_COLORS = [
    '#FFFFFF', '#000000', '#F44336', '#E91E63', '#9C27B0',
    '#673AB7', '#3F51B5', '#2196F3', '#00BCD4', '#4CAF50'
  ];

  return (
    <div className="absolute top-16 right-4 h-auto w-64 bg-white shadow-2xl z-20 p-4 flex flex-col rounded-lg border border-slate-200 animate-slide-in">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-slate-700">Background Color</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-800 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="space-y-4">
        {/* Color Swatches */}
        <div className="grid grid-cols-5 gap-2">
          {PRESET_COLORS.map(color => (
            <button
              key={color}
              onClick={() => onColorChange(color)}
              className="w-10 h-10 rounded-full border-2 border-slate-200 hover:scale-110 transition-transform"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>

        {/* Custom Color Picker and No BG */}
        <div className="grid grid-cols-2 gap-2">
          <label
            htmlFor="color-picker"
            className="w-full h-10 flex items-center justify-center rounded-lg border-2 border-slate-200 cursor-pointer bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500"
            title="Custom Color"
          >
            <input
              id="color-picker"
              type="color"
              className="opacity-0 w-0 h-0"
              onChange={(e) => onColorChange(e.target.value)}
            />
          </label>
          <button
            onClick={() => onColorChange('transparent')}
            className="w-full h-10 flex items-center justify-center rounded-lg border-2 border-slate-200 hover:bg-slate-100"
            title="No Background"
          >
            <TransparentIcon />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BackgroundColorPanel;