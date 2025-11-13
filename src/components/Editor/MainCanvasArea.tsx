"use client";

import React from "react";
import { EditorTab } from "./index";
import EditorCanvas from "./EditorCanvas";
import CanvasControls from "./CanvasControls";
import CanvasFooter from "./CanvasFooter";
import { Tool } from "@/types/editor";
import ObjectLayerToolbar from "./ObjectLayerToolbar";

interface MainCanvasAreaProps {
  activeTab: EditorTab;
  activeTool: Tool;
  brushSize: number;
  isPreviewing: boolean;
  hasBeenEdited: boolean;
  onTogglePreview: () => void;
  onDownload: () => void;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  imageDimensions: { width: number; height: number };
  originalImageUrl: string;
  // Undo/Redo
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  activeObject: any | null;
  onBringForward: () => void;
  onSendBackward: () => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
}

const MainCanvasArea: React.FC<MainCanvasAreaProps> = (props) => {
  return (
    <main className="flex-1 flex flex-col bg-gray-100 overflow-hidden relative">
      <CanvasControls
        activeTab={props.activeTab}
        isPreviewing={props.isPreviewing}
        onTogglePreview={props.onTogglePreview}
        hasBeenEdited={props.hasBeenEdited}
      />

      {props.activeObject && !props.isPreviewing && (
        <ObjectLayerToolbar
          onBringForward={props.onBringForward}
          onSendBackward={props.onSendBackward}
          onBringToFront={props.onBringToFront}
          onSendToBack={props.onSendToBack}
        />
      )}

      <EditorCanvas
        canvasRef={props.canvasRef}
        imageDimensions={props.imageDimensions}
        activeTool={props.activeTool}
        brushSize={props.brushSize}
        isPreviewing={props.isPreviewing}
        originalImageUrl={props.originalImageUrl}
      />

      <CanvasFooter
        onDownload={props.onDownload}
        onUndo={props.onUndo}
        onRedo={props.onRedo}
        canUndo={props.canUndo}
        canRedo={props.canRedo}
      />
    </main>
  );
};

export default MainCanvasArea;