// src/components/Editor/index.tsx
"use client";

import React, { useState, FC, useCallback, useEffect } from "react";
import { useFabric } from "../../hooks/useFabric";
import EditorNavSidebar from "./EditorNavSidebar";
import MainCanvasArea from "./MainCanvasArea";
import BackgroundsPanel from "./BackgroundsPanel";
import CutoutPanel from "./CutoutPanel";
import { BlurType, FilterType, Tool } from "@/types/editor";
import EffectsPanel from "./EffectsPanel";
import AdjustPanel from "./AdjustPanel";

export type EditorTab =
  | "backgrounds"
  | "cutout"
  | "effect"
  | "adjust"
  | "design";

interface EditorViewProps {
  initialImageUrl: string;
  originalImageUrl: string;
  onStartNew: () => void;
}

const EditorView: FC<EditorViewProps> = ({
  initialImageUrl,
  originalImageUrl,
  onStartNew,
}) => {
  const [currentImageUrl, setCurrentImageUrl] = useState(initialImageUrl);
  const [activeTab, setActiveTab] = useState<EditorTab>("cutout"); // Default to cutout
  const [activeTool, setActiveTool] = useState<Tool>("brush"); // Default to brush
  const [brushSize, setBrushSize] = useState(30);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState("transparent");
  const [hasBeenEdited, setHasBeenEdited] = useState(false);

  // State for Effects
  const [isBlurEnabled, setIsBlurEnabled] = useState(false);
  const [blurType, setBlurType] = useState<BlurType>("gaussian");
  const [blurValue, setBlurValue] = useState(20);
  const [isFilterEnabled, setIsFilterEnabled] = useState(false);
  const [filterType, setFilterType] = useState<FilterType>("noir");

  // State for Adjustments
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [opacity, setOpacity] = useState(1);
  const [blur, setBlur] = useState(0);

  // Handlers
  const handleSetBrightness = (val: number) => { setBrightness(val); setHasBeenEdited(true); };
  const handleSetContrast = (val: number) => { setContrast(val); setHasBeenEdited(true); };
  const handleSetSaturation = (val: number) => { setSaturation(val); setHasBeenEdited(true); };
  const handleSetOpacity = (val: number) => { setOpacity(val); setHasBeenEdited(true); };
  const handleSetBlur = (val: number) => { setBlur(val); setHasBeenEdited(true); };

  const handleSetIsBlurEnabled = (val: boolean) => {
    setIsBlurEnabled(val);
    setHasBeenEdited(true);
  };
  const handleSetBlurType = (val: BlurType) => {
    setBlurType(val);
    setHasBeenEdited(true);
  };
  const handleSetBlurValue = (val: number) => {
    setBlurValue(val);
    setHasBeenEdited(true);
  };
  const handleSetIsFilterEnabled = (val: boolean) => {
    setIsFilterEnabled(val);
    setHasBeenEdited(true);
  };
  const handleSetFilterType = (val: FilterType) => {
    setFilterType(val);
    setHasBeenEdited(true);
  };

  useEffect(() => {
    if (sessionStorage.getItem("bgRemoved") === "true") {
      setHasBeenEdited(true);
    }
  }, []);

  // This is the "Erase" API callback
  const handleComplete = useCallback((newUrl: string) => {
    setCurrentImageUrl(newUrl);
    setActiveTool("cursor"); // Switch back to cursor after erase
    setHasBeenEdited(true);
    setActiveTab("backgrounds"); // Switch back to backgrounds tab
  }, []);

  const {
    canvasRef,
    imageDimensions,
    handleRemoveObject, // This is our "Erase" function
    handleDownloadImage,
    clearDrawings,
    handleBackgroundImageUpload,
    clearBackgroundImage,
    setBackgroundImageFromUrl,
    setBackgroundColor: setCanvasBackgroundColor,
  } = useFabric(
    currentImageUrl,
    activeTool,
    brushSize,
    handleComplete,
    backgroundColor,
    () => {},
    false,
    // Effect Props
    isBlurEnabled,
    blurType,
    blurValue,
    isFilterEnabled,
    filterType,
    // Adjust Props
    brightness,
    contrast,
    saturation,
    opacity,
    blur
  );

  const handleBackgroundColorChange = (color: string) => {
    clearDrawings();
    clearBackgroundImage();
    setCanvasBackgroundColor(color);
    setBackgroundColor(color);
    setHasBeenEdited(true);
  };

  const handleTabChange = (tab: EditorTab) => {
    setActiveTab(tab);
    if (tab === "cutout") {
      setActiveTool("brush");
    } else {
      setActiveTool("cursor");
    }
  };

  return (
    <div className="w-full flex-1 flex overflow-hidden">
      {/* 1. Left Nav Sidebar */}
      <EditorNavSidebar activeTab={activeTab} onTabChange={handleTabChange} />

      {/* 2. Main Canvas Area (Center) */}
      <MainCanvasArea
        activeTab={activeTab}
        activeTool={activeTool}
        brushSize={brushSize} // <-- Canvas needs this for the cursor
        isPreviewing={isPreviewing}
        onTogglePreview={() => setIsPreviewing(!isPreviewing)}
        onDownload={handleDownloadImage}
        // onRemoveObject is no longer passed here
        hasBeenEdited={hasBeenEdited}
        canvasRef={canvasRef as React.RefObject<HTMLCanvasElement>}
        imageDimensions={imageDimensions}
        originalImageUrl={originalImageUrl}
      />

      {/* 3. Right Side Panel (Conditional) */}
      {activeTab === "backgrounds" && (
        <BackgroundsPanel
          onColorChange={handleBackgroundColorChange}
          onImageUpload={handleBackgroundImageUpload}
          onStaticImageSelect={setBackgroundImageFromUrl}
        />
      )}

      {/* NEW: Render CutoutPanel when 'cutout' tab is active */}
      {activeTab === "cutout" && (
        <CutoutPanel
          brushSize={brushSize}
          setBrushSize={setBrushSize}
          onErase={handleRemoveObject} // Wire up the erase button
        />
      )}

      {activeTab === "effect" && (
        <EffectsPanel
          isBlurEnabled={isBlurEnabled}
          setIsBlurEnabled={handleSetIsBlurEnabled}
          blurType={blurType}
          setBlurType={handleSetBlurType}
          blurValue={blurValue}
          setBlurValue={handleSetBlurValue}
          isFilterEnabled={isFilterEnabled}
          setIsFilterEnabled={handleSetIsFilterEnabled}
          filterType={filterType}
          setFilterType={handleSetFilterType}
        />
      )}

      {activeTab === "adjust" && (
        <AdjustPanel
          brightness={brightness}
          setBrightness={handleSetBrightness}
          contrast={contrast}
          setContrast={handleSetContrast}
          saturation={saturation}
          setSaturation={handleSetSaturation}
          opacity={opacity}
          setOpacity={handleSetOpacity}
          blur={blur}
          setBlur={handleSetBlur}
        />
      )}
    </div>
  );
};

export default EditorView;