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

  // --- CHANGE: Don't clear()! Remove previous image explicitly ---
  // fabricCanvas.clear();

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

      img.set({
        selectable: activeTool === "cursor",
        evented: activeTool === "cursor",
        crossOrigin: "anonymous",
        id: "main-image", // Tag the object
      });

      imageRef.current = img;
      // Insert at the bottom stack so text/design stays on top
      fabricCanvas.insertAt(img, 0, true);

      fabricCanvas.centerObject(img);
      fabricCanvas.renderAll();

      if (onLoadComplete) onLoadComplete();
    },
    { crossOrigin: "anonymous" }
  );
};