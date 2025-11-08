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
  return new window.fabric.Canvas(canvasRef.current);
};

// Loads or updates the main image on the canvas
export const updateMainImage = (
  fabricCanvas: any,
  imageRef: RefObject<any>,
  url: string,
  activeTool: Tool,
  setImageDimensions: (dims: { width: number; height: number }) => void
) => {
  if (!fabricCanvas || !window.fabric || !url) return;
  fabricCanvas.clear();
  imageRef.current = null;

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
      });

      imageRef.current = img;
      fabricCanvas.add(img);
      fabricCanvas.centerObject(img);
      fabricCanvas.renderAll();
    },
    { crossOrigin: "anonymous" }
  );
};