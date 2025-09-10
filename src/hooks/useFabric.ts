// src/hooks/useFabric.ts
"use client";

import { useRef, useEffect, useState } from "react";
import { Tool } from "../types/editor";

// TypeScript declarations for global Fabric.js instance
declare global {
  interface Window {
    fabric: any;
  }
}

export const useFabric = (
  imageUrl: string,
  activeTool: Tool,
  brushSize: number
) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<any | null>(null);
  const imageRef = useRef<any | null>(null);
  const patternSourceRef = useRef<HTMLImageElement | null>(null);

  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });

  // Function to constrain object movement
  const constrainObjectMovement = (obj: any, boundingBox: { width: number; height: number }) => {
    const objWidth = obj.getScaledWidth();
    const objHeight = obj.getScaledHeight();
    const maxX = boundingBox.width / 2 - objWidth / 2;
    const maxY = boundingBox.height / 2 - objHeight / 2;
    const minX = -maxX;
    const minY = -maxY;

    if (obj.left < minX) obj.left = minX;
    if (obj.left > maxX) obj.left = maxX;
    if (obj.top < minY) obj.top = minY;
    if (obj.top > maxY) obj.top = maxY;
  };

  // Effect for canvas initialization
  useEffect(() => {
    if (!imageUrl || !canvasRef.current || !window.fabric) return;

    const fabricInstance = window.fabric;
    const canvas = new fabricInstance.Canvas(canvasRef.current);
    fabricCanvasRef.current = canvas;

    const imgElement = new Image();
    imgElement.crossOrigin = "anonymous";
    imgElement.src = imageUrl;
    imgElement.onload = () => {
      patternSourceRef.current = imgElement;
      const originalWidth = imgElement.width;
      const originalHeight = imgElement.height;

      fabricInstance.Image.fromURL(imageUrl, (img: any) => {
        const padding = 15;
        const scale = Math.min(
            (800 - padding) / (img.width || 1),
            (600 - padding) / (img.height || 1)
        ) * 0.5; // <-- THE FIX: Changed 1.5 to 0.5 to make the image smaller

        img.scale(scale);
        const scaledWidth = Math.round(originalWidth * scale);
        const scaledHeight = Math.round(originalHeight * scale);
        setImageDimensions({ width: scaledWidth, height: scaledHeight });

        canvas.setWidth(scaledWidth);
        canvas.setHeight(scaledHeight);
        canvas.calcOffset();

        img.set({
          lockUniScaling: true,
          lockScalingX: true,
          lockScalingY: true,
          hoverCursor: "pointer",
        });
        img.setControlsVisibility({ mtr: true, mt: false, mb: false, ml: false, mr: false, bl: false, br: false, tl: false, tr: false });

        canvas.add(img);
        canvas.centerObject(img);
        imageRef.current = img;

        img.on("moving", () => {
          constrainObjectMovement(img, { width: scaledWidth, height: scaledHeight });
          canvas.renderAll();
        });

        canvas.renderAll();
      }, { crossOrigin: "anonymous" });
    };

    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
      }
    };
  }, [imageUrl]);

  // Effect for tool and brush changes
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;

    if (activeTool === "pan") {
      canvas.isDrawingMode = false;
      image.selectable = true;
      image.evented = true;
    } else {
      canvas.isDrawingMode = true;
      image.selectable = false;
      image.evented = false;

      if (activeTool === "erase") {
        const eraserBrush = new window.fabric.PencilBrush(canvas);
        eraserBrush.globalCompositeOperation = "destination-out";
        eraserBrush.width = brushSize;
        canvas.freeDrawingBrush = eraserBrush;
      } else if (activeTool === "restore" && patternSourceRef.current) {
        const restoreBrush = new window.fabric.PatternBrush(canvas);
        restoreBrush.width = brushSize;
        restoreBrush.source = patternSourceRef.current as CanvasImageSource;
        canvas.freeDrawingBrush = restoreBrush;
      }
    }
    canvas.renderAll();
  }, [activeTool, brushSize]);

  const handleDownload = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const dataURL = canvas.toDataURL({ format: "png", quality: 1.0, multiplier: 1 });
    const link = document.createElement("a");
    link.download = "edited-image.png";
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return { canvasRef, imageDimensions, handleDownload };
};