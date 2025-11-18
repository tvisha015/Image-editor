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
import DesignPanel from "./DesignPanel";
import ContextMenu from "./ContextMenu";
import ResizePanel from "./ResizePanel";

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
  const [activeTab, setActiveTab] = useState<EditorTab>("cutout");
  const [activeTool, setActiveTool] = useState<Tool>("brush");
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
  const [highlight, setHighlight] = useState(0);
  const [sharpen, setSharpen] = useState(0);
  const [shadow, setShadow] = useState(0); 
  const [opacity, setOpacity] = useState(1);
  const [adjustBlur, setAdjustBlur] = useState(0);

  // State for Resize Panel
  const [isResizeOpen, setIsResizeOpen] = useState(false);

  // Handlers (omitted for brevity, keep your existing ones)
  // ... keep handleSetBrightness, handleSetIsBlurEnabled etc ... 
  // Make sure they call setHasBeenEdited(true)

  // Re-declare handlers just in case they were missing in previous context
  const handleSetBrightness = (val: number) => { setBrightness(val); setHasBeenEdited(true); };
  const handleSetContrast = (val: number) => { setContrast(val); setHasBeenEdited(true); };
  const handleSetHighlight = (val: number) => { setHighlight(val); setHasBeenEdited(true); };
  const handleSetSharpen = (val: number) => { setSharpen(val); setHasBeenEdited(true); };
  const handleSetShadow = (val: number) => { setShadow(val); setHasBeenEdited(true); };
  const handleSetOpacity = (val: number) => { setOpacity(val); setHasBeenEdited(true); };
  const handleSetAdjustBlur = (val: number) => { setAdjustBlur(val); setHasBeenEdited(true); };

  const handleSetIsBlurEnabled = (val: boolean) => { setIsBlurEnabled(val); setHasBeenEdited(true); };
  const handleSetBlurType = (val: BlurType) => { setBlurType(val); setHasBeenEdited(true); };
  const handleSetBlurValue = (val: number) => { setBlurValue(val); setHasBeenEdited(true); };
  const handleSetIsFilterEnabled = (val: boolean) => { setIsFilterEnabled(val); setHasBeenEdited(true); };
  const handleSetFilterType = (val: FilterType) => { setFilterType(val); setHasBeenEdited(true); };

  useEffect(() => {
    if (sessionStorage.getItem("bgRemoved") === "true") {
      setHasBeenEdited(true);
    }
  }, []);

  const handleComplete = useCallback((newUrl: string) => {
    setCurrentImageUrl(newUrl);
    setActiveTool("cursor");
    setHasBeenEdited(true);
    setActiveTab("backgrounds");
  }, []);

  const {
    canvasRef,
    imageDimensions,
    handleRemoveObject,
    handleDownloadImage,
    clearDrawings,
    handleBackgroundImageUpload,
    clearBackgroundImage,
    setBackgroundImageFromUrl,
    setBackgroundColor: setCanvasBackgroundColor,
    addStyledText,
    applyTemplate,
    setOverlay,
    removeOverlay,
    undo,
    redo,
    canUndo,
    canRedo,
    activeObject,
    contextMenuPosition,
    closeContextMenu,
    bringForward,
    sendBackward,
    bringToFront,
    sendToBack,
    duplicateObject,
    deleteObject,
    resizeCanvas,
  } = useFabric(
    currentImageUrl,
    activeTool,
    brushSize,
    handleComplete,
    backgroundColor,
    () => {},
    false,
    isBlurEnabled,
    blurType,
    blurValue,
    isFilterEnabled,
    filterType,
    brightness,
    contrast,
    highlight,
    sharpen,
    shadow,
    opacity,
    adjustBlur
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

  // --- Template Selection Handler ---
  const handleTemplateSelect = (url: string) => {
      // You can add logic here if you have different types of templates.
      // Based on your description (Posters), we treat them as BACKGROUNDS.
      setBackgroundImageFromUrl(url);
  };
  return (
    <div className="w-full flex-1 flex overflow-hidden">
      <EditorNavSidebar activeTab={activeTab} onTabChange={handleTabChange} />

      <MainCanvasArea
        activeTab={activeTab}
        activeTool={activeTool}
        brushSize={brushSize}
        isPreviewing={isPreviewing}
        onTogglePreview={() => setIsPreviewing(!isPreviewing)}
        onDownload={handleDownloadImage}
        hasBeenEdited={hasBeenEdited}
        canvasRef={canvasRef as React.RefObject<HTMLCanvasElement>}
        imageDimensions={imageDimensions}
        originalImageUrl={originalImageUrl}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        activeObject={activeObject}
        contextMenuPosition={contextMenuPosition}
        onCloseContextMenu={closeContextMenu}
        onBringForward={bringForward}
        onSendBackward={sendBackward}
        onBringToFront={bringToFront}
        onSendToBack={sendToBack}
        onDuplicate={duplicateObject}
        onDelete={deleteObject}
        onOpenResize={() => setIsResizeOpen(true)}
      />

      {/* Panels */}
      {activeTab === "backgrounds" && (
        <BackgroundsPanel
          onColorChange={handleBackgroundColorChange}
          onImageUpload={handleBackgroundImageUpload}
          onStaticImageSelect={setBackgroundImageFromUrl}
        />
      )}

      {activeTab === "cutout" && (
        <CutoutPanel
          brushSize={brushSize}
          setBrushSize={setBrushSize}
          onErase={handleRemoveObject}
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
          highlight={highlight}
          setHighlight={handleSetHighlight}
          sharpen={sharpen}
          setSharpen={handleSetSharpen}
          shadow={shadow}
          setShadow={handleSetShadow}
          opacity={opacity}
          setOpacity={handleSetOpacity}
          adjustBlur={adjustBlur}
          setAdjustBlur={handleSetAdjustBlur}
        />
      )}

      {activeTab === "design" && (
        <DesignPanel
          onAddTextDesign={addStyledText}
          onSelectTemplate={setOverlay}
          onApplyTemplate={applyTemplate}
          onRemoveTemplate={removeOverlay}
        />
      )}

      {contextMenuPosition && !isPreviewing && (
        <ContextMenu
          position={contextMenuPosition}
          onClose={closeContextMenu}
          onDuplicate={duplicateObject}
          onDelete={deleteObject}
          onBringForward={bringForward}
          onSendBackward={sendBackward}
          onBringToFront={bringToFront}
          onSendToBack={sendToBack}
        />
      )}

      {isResizeOpen && (
        <ResizePanel 
            onResize={resizeCanvas} 
            onClose={() => setIsResizeOpen(false)} 
        />
      )}
    </div>
  );
};

export default EditorView;