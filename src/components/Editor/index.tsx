// src/components/Editor/index.tsx
"use client";

import React, { useState, FC, useEffect, useCallback } from "react";
import { useFabric } from "../../hooks/useFabric";
import { Tool } from "../../types/editor";
import EditorToolbar from "./EditorToolbar";
import EditorHeader from "./EditorHeader";
import EditorCanvas from "./EditorCanvas";
import BackgroundColorPanel from "./BackgroundColorPanel";

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
  const [activeTool, setActiveTool] = useState<Tool>("cursor");
  const [brushSize, setBrushSize] = useState(30);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [hasBeenEdited, setHasBeenEdited] = useState(false);
  const [isBgPanelOpen, setIsBgPanelOpen] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState("transparent");

  // **CHANGE 2: Add useEffect to close the panel when erase tool is selected**
  useEffect(() => {
    if (activeTool === "brush" && isBgPanelOpen) {
      setIsBgPanelOpen(false);
    }
  }, [activeTool, isBgPanelOpen]);

  useEffect(() => {
    if (sessionStorage.getItem("bgRemoved") === "true") {
      setHasBeenEdited(true);
    }
  }, []);

  const handleComplete = useCallback((newUrl: string) => {
    setCurrentImageUrl(newUrl);
    setActiveTool("cursor");
    setHasBeenEdited(true);
  }, []);

  // **CHANGE 1: Update the panel toggle handler to deselect the erase tool**
  const handleToggleBgPanel = () => {
    const newPanelState = !isBgPanelOpen;
    setIsBgPanelOpen(newPanelState);
    // If we are opening the panel, ensure the erase tool is deactivated
    if (newPanelState) {
      setActiveTool("cursor");
    }
  };

  const handleBackgroundColorChange = (color: string) => {
    clearDrawings();
    clearBackgroundImage(); // Clear any background image when selecting a color
    setBackgroundColor(color);
  };

  const {
    canvasRef,
    imageDimensions,
    handleRemoveObject,
    handleDownloadImage,
    clearDrawings,
    handleBackgroundImageUpload,
    clearBackgroundImage,
    setBackgroundImageFromUrl,
  } = useFabric(
    currentImageUrl,
    activeTool,
    brushSize,
    handleComplete,
    backgroundColor,
    () => {}, // Placeholder for onBgImageUpload parameter
    isBgPanelOpen 
  );

  const handleBackgroundImageUploadWrapper = (file: File) => {
    clearDrawings();
    setBackgroundColor("transparent"); // Set background to transparent when uploading an image
    handleBackgroundImageUpload(file);
  };

  const handleStaticImageSelect = (imageUrl: string) => {
    clearDrawings();
    setBackgroundColor("transparent"); // Set background to transparent when selecting an image
    setBackgroundImageFromUrl(imageUrl);
  };

  const handleRemoveBackground = () => {
    clearDrawings();
    clearBackgroundImage();
    setBackgroundColor("transparent");
  };

  return (
    <div className="w-full max-w-screen-2xl h-[90vh] bg-white rounded-2xl shadow-xl flex overflow-hidden border border-slate-200">
      <EditorToolbar
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        isPreviewing={isPreviewing}
        isBgPanelOpen={isBgPanelOpen}
        onToggleBgPanel={handleToggleBgPanel} // Use the new handler
      />
      <div className="flex-1 flex relative">
        <main className="flex-1 flex flex-col">
          <EditorHeader
            brushSize={brushSize}
            setBrushSize={setBrushSize}
            activeTool={activeTool}
            onStartNew={onStartNew}
            handleRemoveObject={handleRemoveObject}
            handleDownloadImage={handleDownloadImage}
            hasBeenEdited={hasBeenEdited}
            isPreviewing={isPreviewing}
            onTogglePreview={() => setIsPreviewing(!isPreviewing)}
            isBgPanelOpen={isBgPanelOpen}
          />
          <EditorCanvas
            canvasRef={canvasRef as React.RefObject<HTMLCanvasElement>}
            imageDimensions={imageDimensions}
            activeTool={activeTool}
            brushSize={brushSize}
            isPreviewing={isPreviewing}
            originalImageUrl={originalImageUrl}
          />
        </main>

        {isBgPanelOpen && (
          <BackgroundColorPanel
            onColorChange={handleBackgroundColorChange}
            onImageUpload={handleBackgroundImageUploadWrapper}
            onStaticImageSelect={handleStaticImageSelect}
            onRemoveBackground={handleRemoveBackground}
            onClose={() => setIsBgPanelOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

export default EditorView;
