// src/components/Editor/BackgroundColorPanel.tsx
"use client";

import React, { FC, useEffect, useState } from "react";
import { staticBackgrounds } from "@/libs/background";

const Spinner = () => (
  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-md">
    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
  </div>
);

// An SVG icon for the transparent option
const TransparentIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M0 0H24V24H0V0Z" fill="url(#pattern0)" />
    <defs>
      <pattern
        id="pattern0"
        patternContentUnits="objectBoundingBox"
        width="1"
        height="1"
      >
        <use href="#image0" transform="scale(0.0416667)" />
      </pattern>
      <image
        id="image0"
        width="24"
        height="24"
        href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IArs4c6QAAAD9JREFUSEtjZGBgYJD//z8DEiALKDFge/YMYP/5/x/IAMp/gAyYyQDEwADy589AXAxEBdTAf8B6A7E1EA0A30sWFeT4sDMAAAAASUVORK5CYII="
      />
    </defs>
  </svg>
);

interface BackgroundColorPanelProps {
  onColorChange: (color: string) => void;
  onImageChange: (imageUrl: string) => void;
  onClose: () => void;
  isBgLoading?: boolean;
}

const BackgroundColorPanel: FC<BackgroundColorPanelProps> = ({
  onColorChange,
  onClose,
  onImageChange,
  isBgLoading,
}) => {
  const [activeTab, setActiveTab] = useState<"color" | "photo">("color");
  const [loadingImageUrl, setLoadingImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!isBgLoading) {
      setLoadingImageUrl(null);
    }
  }, [isBgLoading]);

  const PRESET_COLORS = [
    "#FFFFFF",
    "#000000",
    "#F44336",
    "#E91E63",
    "#9C27B0",
    "#673AB7",
    "#3F51B5",
    "#2196F3",
    "#00BCD4",
    "#4CAF50",
  ];

  const handleImageClick = (imageUrl: string) => {
    setLoadingImageUrl(imageUrl); // Set local loader for this thumbnail
    onImageChange(imageUrl); // Tell the parent to start loading
  };

  return (
    <div className="absolute top-16 right-4 h-auto w-80 bg-white shadow-2xl z-20 p-4 flex flex-col rounded-lg border border-slate-200 animate-slide-in">
           {" "}
      <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-slate-700">Background</h3>   
           {" "}
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-800 transition-colors"
        >
                   {" "}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24"
            stroke="currentColor"
          >
                       {" "}
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
                     {" "}
          </svg>
                 {" "}
        </button>
             {" "}
      </div>
      {/* TABS */}
      <div className="flex w-full bg-slate-100 rounded-lg p-1 mb-4">
        <button
          onClick={() => setActiveTab("color")}
          className={`flex-1 text-sm font-semibold p-2 rounded-md transition-colors ${
            activeTab === "color"
              ? "bg-white text-purple-600 shadow-sm"
              : "text-slate-500"
          }`}
        >
          Color
        </button>
        <button
          onClick={() => setActiveTab("photo")}
          className={`flex-1 text-sm font-semibold p-2 rounded-md transition-colors ${
            activeTab === "photo"
              ? "bg-white text-purple-600 shadow-sm"
              : "text-slate-500"
          }`}
        >
          Photo
        </button>
      </div>
           {" "}
      {activeTab === "color" && (
        <div className="space-y-4">
          {/* Color Swatches */}
          <div className="grid grid-cols-5 gap-2">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => onColorChange(color)}
                className="w-12 h-12 rounded-full border-2 border-slate-200 hover:scale-110 transition-transform"
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
              onClick={() => onColorChange("transparent")}
              className="w-full h-10 flex items-center justify-center rounded-lg border-2 border-slate-200 hover:bg-slate-100"
              title="No Background"
            >
              <TransparentIcon />
            </button>
          </div>
        </div>
      )}
      {activeTab === "photo" && (
        <div className="h-64 overflow-y-auto">
          <div className="grid grid-cols-2 gap-2 pr-2">
            {staticBackgrounds.map((imageUrl) => (
              <button
                key={imageUrl}
                onClick={() => handleImageClick(imageUrl)}
                className="relative" // ADD: Needed for spinner positioning
              >
                <img
                  src={imageUrl}
                  alt="Background option"
                  className="w-full h-20 object-cover rounded-md hover:opacity-80 transition-opacity"
                />
                {loadingImageUrl === imageUrl && <Spinner />}
              </button>
            ))}
          </div>
        </div>
      )}
         {" "}
    </div>
  );
};

export default BackgroundColorPanel;
