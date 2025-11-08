"use client";

import React, { useState, FC, useCallback, useEffect } from "react";
import { useFabric } from "../../hooks/useFabric";
import EditorNavSidebar from "./EditorNavSidebar";
import MainCanvasArea from "./MainCanvasArea";
import BackgroundsPanel from "./BackgroundsPanel";
import CutoutPanel from "./CutoutPanel"; // <-- Import new panel
import { Tool } from "@/types/editor";

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
    false
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
    </div>
  );
};

export default EditorView;