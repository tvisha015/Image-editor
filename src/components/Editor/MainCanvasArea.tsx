// src/components/Editor/MainCanvasArea.tsx
"use client";

import React from "react";
import { EditorTab } from "./index";
import EditorCanvas from "./EditorCanvas";
import CanvasControls from "./CanvasControls";
import CanvasFooter from "./CanvasFooter";
import { Tool } from "@/types/editor";
import ContextMenu from "./ContextMenu";

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
  // Active Object & Layer Actions
  activeObject: any | null;
  contextMenuPosition: { x: number; y: number } | null;
  onCloseContextMenu: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  // Resize
  onOpenResize: () => void;
  isTemplateLoading: boolean;
}

const MainCanvasArea: React.FC<MainCanvasAreaProps> = (props) => {
  return (
    <main className="flex-1 flex flex-col bg-gray-100 overflow-hidden relative">
      <CanvasControls
        activeTab={props.activeTab}
        isPreviewing={props.isPreviewing}
        onTogglePreview={props.onTogglePreview}
        hasBeenEdited={props.hasBeenEdited}
        onOpenResize={props.onOpenResize} 
      />

      {/* --- LOADING OVERLAY --- */}
      {props.isTemplateLoading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
           <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
           <p className="text-gray-600 font-semibold animate-pulse">Applying Template...</p>
        </div>
      )}
      
      {/* {props.contextMenuPosition && !props.isPreviewing && (
        <ContextMenu
          position={props.contextMenuPosition}
          onClose={props.onCloseContextMenu}
          onDuplicate={props.onDuplicate}
          onDelete={props.onDelete}
          onBringForward={props.onBringForward}
          onSendBackward={props.onSendBackward}
          onBringToFront={props.onBringToFront}
          onSendToBack={props.onSendToBack}
        />
      )} */}

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