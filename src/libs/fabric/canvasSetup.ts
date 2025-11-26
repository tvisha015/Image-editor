// src/lib/fabric/canvasSetup.ts
// Logic for initializing the canvas and loading the main image.

"use client";

import { RefObject } from "react";
import { Tool } from "@/types/editor";

// Initializes a new Fabric.js canvas instance
export const initFabricCanvas = (
  canvasRef: RefObject<HTMLCanvasElement | null>
): any | null => {
  if (!canvasRef.current || !window.fabric) return null;
  return new window.fabric.Canvas(canvasRef.current, {
    preserveObjectStacking: true,
    selection: true,
    fireRightClick: true,  // Enable right-click events in Fabric
    stopContextMenu: true, // Disable the default browser right-click menu
  });
};

export const updateMainImage = (
  fabricCanvas: any,
  imageRef: RefObject<any>,
  url: string,
  activeTool: Tool,
  setImageDimensions: (dims: { width: number; height: number }) => void,
  onLoadComplete?: () => void
) => {
  if (!fabricCanvas || !window.fabric || !url) return;

  if (imageRef.current) {
    fabricCanvas.remove(imageRef.current);
    imageRef.current = null;
  }

  window.fabric.Image.fromURL(
    url,
    (img: any) => {
      const padding = 15;
      const scale =
        Math.min(
          (800 - padding) / (img.width || 1),
          (600 - padding) / (img.height || 1)
        ) * 0.5;

      img.scale(scale);
      const scaledWidth = Math.round((img.width || 0) * scale);
      const scaledHeight = Math.round((img.height || 0) * scale);
      setImageDimensions({ width: scaledWidth, height: scaledHeight });

      fabricCanvas.setWidth(scaledWidth);
      fabricCanvas.setHeight(scaledHeight);

      // --- NEW: Calculate Control Sizes based on canvas size ---
      const maxDim = Math.max(scaledWidth, scaledHeight);
      // Heuristic: ~2.5% of largest dimension, min 15px, max 100px
      const cornerSize = Math.max(15, Math.min(100, maxDim * 0.025));
      const borderScale = Math.max(2, maxDim * 0.003);
      const touchPadding = Math.max(10, maxDim * 0.01);

      // 1. Update Global Defaults (So new text/stickers use this size too)
      window.fabric.Object.prototype.set({
        cornerSize: cornerSize,
        transparentCorners: false,
        cornerColor: '#ffffff',
        cornerStrokeColor: '#3b82f6', // Blue
        borderColor: '#3b82f6',
        cornerStyle: 'circle',
        borderScaleFactor: borderScale,
        padding: touchPadding,
      });

      // 2. Apply to Main Image
      img.set({
        selectable: activeTool === "cursor",
        evented: activeTool === "cursor",
        crossOrigin: "anonymous",
        id: "main-image",
        // Apply the calculated sizes
        cornerSize: cornerSize,
        transparentCorners: false,
        cornerColor: '#ffffff',
        cornerStrokeColor: '#3b82f6',
        borderColor: '#3b82f6',
        cornerStyle: 'circle',
        borderScaleFactor: borderScale,
        padding: touchPadding,
      });

      imageRef.current = img;
      fabricCanvas.insertAt(img, 0, true);
      fabricCanvas.centerObject(img);
      fabricCanvas.renderAll();

      if (onLoadComplete) onLoadComplete();
    },
    { crossOrigin: "anonymous" }
  );
};