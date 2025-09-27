// src/components/EditorView.tsx
"use client";

import React, { useState, FC, useEffect, useCallback } from "react";
import { useFabric } from "../hooks/useFabric";
import { Tool } from "../types/editor";
import EditorToolbar from "./Editor/EditorToolbar";
import EditorHeader from "./Editor/EditorHeader";
import EditorCanvas from "./Editor/EditorCanvas";
import BackgroundColorPanel from "./Editor/BackgroundColorPanel";

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
  const [backgroundImage, setBackgroundImage] = useState("");
  const [isBgLoading, setIsBgLoading] = useState(false);

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
    setBackgroundColor(color);
    setBackgroundImage(""); // Clear image if a color is selected
  };

  const handleBackgroundImageChange = (imageUrl: string) => {
    clearDrawings();
    setIsBgLoading(true);
    setBackgroundImage(imageUrl);
    setBackgroundColor("transparent"); // Set color to transparent when an image is used
  };

  const handleBgImageLoaded = () => {
    setIsBgLoading(false);
  };

  const {
    canvasRef,
    imageDimensions,
    handleRemoveObject,
    handleDownloadImage,
    clearDrawings,
  } = useFabric(
    currentImageUrl,
    activeTool,
    brushSize,
    handleComplete,
    backgroundColor,
    backgroundImage,
    () => setIsBgLoading(false),
    isBgPanelOpen 
  );

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
            onImageChange={handleBackgroundImageChange}
            onClose={() => setIsBgPanelOpen(false)}
            isBgLoading={isBgLoading}
          />
        )}
      </div>
    </div>
  );
};

export default EditorView;
