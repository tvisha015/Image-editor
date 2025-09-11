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

  // Effect for canvas initialization
  useEffect(() => {
    if (!imageUrl || !canvasRef.current || !window.fabric) return;

    const fabricInstance = window.fabric;
    const canvas = new fabricInstance.Canvas(canvasRef.current, {
      backgroundColor: 'transparent'
    });
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
           hoverCursor: "default",
           selectable: false,
           evented: false,
         });
         img.setControlsVisibility({ mtr: false, mt: false, mb: false, ml: false, mr: false, bl: false, br: false, tl: false, tr: false });

        canvas.add(img);
        canvas.centerObject(img);
        imageRef.current = img;

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

    if (activeTool === "brush") {
      canvas.isDrawingMode = true;
      image.selectable = false;
      image.evented = false;

      const brush = new window.fabric.PencilBrush(canvas);
      brush.width = brushSize;
      brush.color = "rgba(255, 255, 255, 1)";
      canvas.freeDrawingBrush = brush;
    } else if (activeTool === "none") {
      canvas.isDrawingMode = false;
      image.selectable = false;
      image.evented = false;
    }
    canvas.renderAll();
  }, [activeTool, brushSize]);

  const handleDownload = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    
    // Create a mask image where white brush areas are white and other areas are black
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;
    
    tempCanvas.width = canvas.getWidth();
    tempCanvas.height = canvas.getHeight();
    
    // Fill with black background
    tempCtx.fillStyle = 'black';
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    
    // Get the fabric canvas content (which includes brush strokes)
    const fabricCanvasElement = canvas.getElement();
    tempCtx.drawImage(fabricCanvasElement, 0, 0);
    
    // Get the image data to process brush strokes
    const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    const pixels = imageData.data;
    
    // Process each pixel to create the mask
    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const a = pixels[i + 3];
      
      // If this pixel has white brush stroke (white or near white)
      if (r > 200 && g > 200 && b > 200 && a > 0) {
        // Make it pure white
        pixels[i] = 255;     // R
        pixels[i + 1] = 255; // G
        pixels[i + 2] = 255; // B
        pixels[i + 3] = 255; // A
      } else {
        // Make it pure black
        pixels[i] = 0;       // R
        pixels[i + 1] = 0;   // G
        pixels[i + 2] = 0;   // B
        pixels[i + 3] = 255; // A
      }
    }
    
    // Put the processed image data back
    tempCtx.putImageData(imageData, 0, 0);
    
    // Export the mask image
    const dataURL = tempCanvas.toDataURL('image/png');
    const link = document.createElement("a");
    link.download = "mask-image.png";
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return { canvasRef, imageDimensions, handleDownload };
};