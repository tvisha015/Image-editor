"use client";

import React, { FC } from "react";
import { BlurType, FilterType } from "@/types/editor"; // Import types

// --- Helper: Toggle Switch Component ---
const ToggleSwitch: FC<{
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
}> = ({ enabled, setEnabled }) => (
  <button
    onClick={() => setEnabled(!enabled)}
    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out
      ${enabled ? "bg-blue-600" : "bg-gray-200"}
    `}
  >
    <span
      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
        ${enabled ? "translate-x-5" : "translate-x-0"}
      `}
    />
  </button>
);

// --- Helper: Segmented Button ---
const SegmentedButton: FC<{
  options: string[];
  selected: string;
  setSelected: (option: string) => void;
  disabled?: boolean;
}> = ({ options, selected, setSelected, disabled = false }) => (
  <div className="flex w-full overflow-hidden rounded-md border border-gray-300">
    {options.map((option, idx) => (
      <button
        key={option}
        disabled={disabled}
        onClick={() => setSelected(option)}
        className={`flex-1 py-1.5 px-2 text-sm font-medium transition-colors
          ${idx > 0 ? "border-l border-gray-300" : ""}
          ${
            selected === option
              ? "bg-blue-100 text-blue-700"
              : "bg-white text-gray-700 hover:bg-gray-50"
          }
          ${disabled ? "cursor-not-allowed bg-gray-100 text-gray-400" : ""}
        `}
      >
        {option}
      </button>
    ))}
  </div>
);

// --- Main Panel Component ---
interface EffectsPanelProps {
  isBlurEnabled: boolean;
  setIsBlurEnabled: (val: boolean) => void;
  blurType: BlurType;
  setBlurType: (val: BlurType) => void;
  blurValue: number;
  setBlurValue: (val: number) => void;

  isFilterEnabled: boolean;
  setIsFilterEnabled: (val: boolean) => void;
  filterType: FilterType;
  setFilterType: (val: FilterType) => void;
}

const EffectsPanel: FC<EffectsPanelProps> = ({
  isBlurEnabled,
  setIsBlurEnabled,
  blurType,
  setBlurType,
  blurValue,
  setBlurValue,
  isFilterEnabled,
  setIsFilterEnabled,
  filterType,
  setFilterType,
}) => {
  return (
    <aside className="w-80 bg-white shadow-lg z-10 border-l border-gray-200 p-4 flex-shrink-0 flex flex-col gap-4 overflow-y-auto">
      <h3 className="text-base font-semibold text-gray-800">Effect</h3>

      {/* --- Blur Section --- */}
      <div className="flex flex-col gap-3 rounded-lg border border-gray-200 p-3">
        <div className="flex justify-between items-center">
          <label className="font-semibold text-gray-700">Blur</label>
          <ToggleSwitch enabled={isBlurEnabled} setEnabled={setIsBlurEnabled} />
        </div>
        <SegmentedButton
          options={["Gaussian", "Motion", "Pixelate", "Square"]}
          selected={
            blurType.charAt(0).toUpperCase() + blurType.slice(1)
          }
          setSelected={(val) => setBlurType(val.toLowerCase() as BlurType)}
          disabled={!isBlurEnabled}
        />
        <div>
          <label
            htmlFor="blur-slider"
            className={`text-sm font-medium ${
              !isBlurEnabled ? "text-gray-400" : "text-gray-700"
            }`}
          >
            Blur Strength
          </label>
          <input
            id="blur-slider"
            type="range"
            min="0"
            max="100"
            value={blurValue}
            onChange={(e) => setBlurValue(Number(e.target.value))}
            disabled={!isBlurEnabled}
            className="w-full cursor-pointer accent-blue-600 mt-2"
          />
        </div>
      </div>

      {/* --- Filter Section --- */}
      <div className="flex flex-col gap-3 rounded-lg border border-gray-200 p-3">
        <div className="flex justify-between items-center">
          <label className="font-semibold text-gray-700">Filter</label>
          <ToggleSwitch
            enabled={isFilterEnabled}
            setEnabled={setIsFilterEnabled}
          />
        </div>
        {/* Using a grid for filter buttons */}
        <div className="grid grid-cols-3 gap-2">
          {["Noir", "Fade", "Mono", "Process", "Tonal", "Sepia"].map((opt) => (
            <button
              key={opt}
              disabled={!isFilterEnabled}
              onClick={() => setFilterType(opt.toLowerCase() as FilterType)}
              className={`py-1.5 px-2 text-sm font-medium rounded-md border transition-colors
                ${
                  filterType === opt.toLowerCase()
                    ? "bg-blue-100 text-blue-700 border-blue-300"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }
                ${
                  !isFilterEnabled
                    ? "cursor-not-allowed bg-gray-100 text-gray-400"
                    : ""
                }
              `}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default EffectsPanel;