// src/lib/fabric/drawingActions.ts
"use client";

import { useEffect, RefObject } from "react";
import { Tool } from "@/types/editor";

// Custom hook to manage the brush tool state
export const useFabricBrush = (
  fabricCanvasRef: RefObject<any>,
  activeTool: Tool,
  brushSize: number
) => {
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !window.fabric) return;

    if (activeTool === "brush") {
      canvas.isDrawingMode = true;
      const brush = new window.fabric.PencilBrush(canvas);
      brush.width = brushSize;
      brush.color = "rgba(255, 255, 255, 1)";
      canvas.freeDrawingBrush = brush;
    } else {
      canvas.isDrawingMode = false;
    }
    canvas.renderAll();
  }, [fabricCanvasRef, activeTool, brushSize]);
};

// Clears all brush strokes (paths) from the canvas
export const clearCanvasDrawings = (fabricCanvas: any) => {
  if (!fabricCanvas) return;
  const paths = fabricCanvas.getObjects().filter((obj: any) => obj.type === "path");
  paths.forEach((path: any) => fabricCanvas.remove(path));
  fabricCanvas.renderAll();
};