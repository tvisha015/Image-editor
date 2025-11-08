"use client";

import React from "react";
import { EditorTab } from "./index";
import EditorCanvas from "./EditorCanvas";
import CanvasControls from "./CanvasControls";
import CanvasFooter from "./CanvasFooter";
import { Tool } from "@/types/editor";

interface MainCanvasAreaProps {
  // State
  activeTab: EditorTab;
  activeTool: Tool;
  brushSize: number; // <-- Keep for EditorCanvas cursor
  isPreviewing: boolean;
  hasBeenEdited: boolean;
  // Handlers
  onTogglePreview: () => void;
  onDownload: () => void;
  // Canvas Props
  canvasRef: React.RefObject<HTMLCanvasElement>;
  imageDimensions: { width: number; height: number };
  originalImageUrl: string;
}

const MainCanvasArea: React.FC<MainCanvasAreaProps> = (props) => {
  return (
    <main className="flex-1 flex flex-col bg-gray-100 overflow-hidden">
      {/* 1. Top Controls (Before/After, Colors, etc.) */}
      <CanvasControls
        activeTab={props.activeTab}
        isPreviewing={props.isPreviewing}
        onTogglePreview={props.onTogglePreview}
        hasBeenEdited={props.hasBeenEdited}
        // Brush and RemoveObject props are all removed
      />

      {/* 2. Main Canvas */}
      <EditorCanvas
        canvasRef={props.canvasRef}
        imageDimensions={props.imageDimensions}
        activeTool={props.activeTool}
        brushSize={props.brushSize} // <-- Pass brushSize for cursor
        isPreviewing={props.isPreviewing}
        originalImageUrl={props.originalImageUrl}
      />

      {/* 3. Bottom Controls (Undo, Redo, Download) */}
      <CanvasFooter onDownload={props.onDownload} />
    </main>
  );
};

export default MainCanvasArea;