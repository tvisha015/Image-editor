"use client";

import React, { FC, useState, useRef, useEffect, useCallback } from "react";

// --- Re-used Transparent Icon from your old code ---
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

// --- Simple Loading Spinner ---
const LoadingSpinner = () => (
  <div className="absolute inset-0 flex items-center justify-center bg-gray-100/50 rounded-md">
    <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
  </div>
);

// Image cache for preloading (from your old code)
const imageCache = new Map<string, HTMLImageElement>();

// Static backgrounds from your old code
const staticBackgrounds = [
  "/background/bg1.jpg",
  "/background/bg2.jpg",
  "/background/bg3.jpg",
  "/background/bg4.jpg",
  "/background/bg5.jpg",
  "/background/bg6.jpg",
];

// Preset colors (based on Figma, but using your old values)
const PRESET_COLORS = [
  "#F44336",
  "#E91E63",
  "#9C27B0",
  "#4CAF50",
  "#FFEB3B",
  "#2196F3",
];

interface BackgroundsPanelProps {
  onColorChange: (color: string) => void;
  onImageUpload: (file: File) => void;
  onStaticImageSelect: (imageUrl: string) => void;
}

const BackgroundsPanel: FC<BackgroundsPanelProps> = ({
  onColorChange,
  onImageUpload,
  onStaticImageSelect,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  // Preload static images (from your old code)
  useEffect(() => {
    const preloadImages = async () => {
      const loadPromises = staticBackgrounds.map((imageUrl) => {
        return new Promise<void>((resolve) => {
          if (imageCache.has(imageUrl)) {
            setLoadedImages((prev) => new Set([...prev, imageUrl]));
            resolve();
            return;
          }
          const img = new Image();
          img.onload = () => {
            imageCache.set(imageUrl, img);
            setLoadedImages((prev) => new Set([...prev, imageUrl]));
            resolve();
          };
          img.onerror = () => resolve(); // Continue even if one fails
          img.src = imageUrl;
        });
      });
      await Promise.all(loadPromises);
    };
    preloadImages();
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setIsUploading(true);
      onImageUpload(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      // Simulate upload time
      setTimeout(() => setIsUploading(false), 1000);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleStaticImageClick = useCallback(
    (imageUrl: string) => {
      onStaticImageSelect(imageUrl);
    },
    [onStaticImageSelect]
  );

  return (
    <aside className="w-80 bg-white shadow-lg z-10 border-l border-gray-200 p-4 flex-shrink-0 overflow-y-auto">
      <h3 className="text-base font-semibold text-gray-800 mb-3">
        Backgrounds
      </h3>

      {/* Background Images Grid */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {/* Upload Button */}
        <button
          onClick={handleUploadClick}
          disabled={isUploading}
          className="relative w-full aspect-square bg-gray-100 rounded-md flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-gray-200 transition-colors"
        >
          {isUploading ? (
            <LoadingSpinner />
          ) : (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 5V19M5 12H19"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Static Images */}
        {staticBackgrounds.map((imageUrl) => (
          <button
            key={imageUrl}
            onClick={() => handleStaticImageClick(imageUrl)}
            className="relative w-full aspect-square bg-gray-100 rounded-md overflow-hidden group"
            disabled={!loadedImages.has(imageUrl)}
          >
            {!loadedImages.has(imageUrl) ? (
              <LoadingSpinner />
            ) : (
              <img
                src={imageUrl}
                alt="Background option"
                loading="lazy"
                className="w-full h-full object-cover transition-transform group-hover:scale-110"
              />
            )}
          </button>
        ))}
      </div>

      <h3 className="text-base font-semibold text-gray-800 mb-3">Colors</h3>

      {/* Color Swatches Grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Transparent Button */}
        <button
          onClick={() => onColorChange("transparent")}
          title="Transparent"
          className="w-full aspect-square rounded-md border border-gray-300 bg-white
                     bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAMCAIAAADZF8PkAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAZSURBVHicY/z//z8DHoBH+v///08GEgB6Sg0bWfM/uAAAAABJRU5ErkJggg==')]
                     hover:scale-110 transition-transform"
        />

        {/* Custom Color Picker */}
        <label
          htmlFor="color-picker-panel"
          className="w-full aspect-square rounded-md border border-gray-300 cursor-pointer
                     bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500
                     hover:scale-110 transition-transform flex items-center justify-center text-white"
          title="Custom Color"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 5V19M5 12H19"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <input
            id="color-picker-panel"
            type="color"
            className="opacity-0 w-0 h-0 absolute"
            onChange={(e) => onColorChange(e.target.value)}
          />
        </label>

        {/* Preset Colors */}
        {PRESET_COLORS.map((color) => (
          <button
            key={color}
            onClick={() => onColorChange(color)}
            title={color}
            className="w-full aspect-square rounded-md border border-gray-300 hover:scale-110 transition-transform"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    </aside>
  );
};

export default BackgroundsPanel;