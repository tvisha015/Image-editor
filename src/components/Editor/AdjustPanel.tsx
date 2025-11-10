// src/components/Editor/AdjustPanel.tsx
"use client";

import React, { FC } from "react";

interface SliderProps { 
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (val: number) => void;
}

const Slider: FC<SliderProps> = ({
  label,
  value,
  min = -1,
  max = 1,
  step = 0.01,
  onChange,
}) => (
  <div className="flex flex-col gap-1">
    <div className="flex justify-between">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <span className="text-xs text-gray-500">{value.toFixed(2)}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full cursor-pointer accent-blue-600"
    />
  </div>
);

interface AdjustPanelProps {
  brightness: number;
  setBrightness: (val: number) => void;
  contrast: number;
  setContrast: (val: number) => void;
  highlight: number;
  setHighlight: (val: number) => void;
  sharpen: number;
  setSharpen: (val: number) => void;
  shadow: number;
  setShadow: (val: number) => void;
  opacity: number;
  setOpacity: (val: number) => void;
  adjustBlur: number;
  setAdjustBlur: (val: number) => void;
}

const AdjustPanel: FC<AdjustPanelProps> = ({
  brightness,
  setBrightness,
  contrast,
  setContrast,
  highlight,
  setHighlight,
  sharpen,
  setSharpen,
  shadow,
  setShadow,
  opacity,
  setOpacity,
  adjustBlur,
  setAdjustBlur,
}) => {
  return (
    <aside className="w-80 bg-white shadow-lg z-10 border-l border-gray-200 p-4 flex-shrink-0 flex flex-col gap-6 overflow-y-auto">
      <h3 className="text-base font-semibold text-gray-800">Adjust</h3>

      <div className="flex flex-col gap-5">
        <Slider
          label="Brightness"
          value={brightness}
          min={-0.5} // Toned down range for better control
          max={0.5}
          onChange={setBrightness}
        />
        <Slider
          label="Contrast"
          value={contrast}
          min={-0.5}
          max={0.5}
          onChange={setContrast}
        />
        <Slider
          label="Highlight"
          value={highlight}
          min={0} // 0 (normal) to 1 (crushed)
          max={1}
          onChange={setHighlight}
        />
        <Slider
          label="Sharpen"
          value={sharpen}
          min={0} // 0 (normal) to 1 (max sharpen)
          max={1}
          onChange={setSharpen}
        />
        <Slider
          label="Shadow"
          value={shadow}
          min={0} // 0 (no shadow) to 1 (max shadow)
          max={1}
          onChange={setShadow}
        />
        <Slider
          label="Opacity"
          value={opacity}
          min={0}
          max={1}
          onChange={setOpacity}
        />
        <Slider
          label="Blur"
          value={adjustBlur}
          min={0}
          max={1}
          onChange={setAdjustBlur}
        />
      </div>
    </aside>
  );
};

export default AdjustPanel;