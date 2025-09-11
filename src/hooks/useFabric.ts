// src/hooks/useFabric.ts
"use client";

import { useRef, useEffect, useState } from "react";
import { Tool } from "../types/editor";

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

  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });

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
      const originalWidth = imgElement.width;
      const originalHeight = imgElement.height;

      fabricInstance.Image.fromURL(imageUrl, (img: any) => {
        const padding = 15;
        const scale = Math.min(
            (800 - padding) / (img.width || 1),
            (600 - padding) / (img.height || 1)
        ) * 0.5;

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
    
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;
    
    tempCanvas.width = canvas.getWidth();
    tempCanvas.height = canvas.getHeight();
    
    tempCtx.fillStyle = 'black';
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    
    const fabricCanvasElement = canvas.getElement();
    tempCtx.drawImage(fabricCanvasElement, 0, 0);
    
    const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    const pixels = imageData.data;
    
    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const a = pixels[i + 3];
      
      if (r > 200 && g > 200 && b > 200 && a > 0) {
        pixels[i] = 255;
        pixels[i + 1] = 255;
        pixels[i + 2] = 255;
        pixels[i + 3] = 255;
      } else {
        pixels[i] = 0;
        pixels[i + 1] = 0;
        pixels[i + 2] = 0;
        pixels[i + 3] = 255;
      }
    }
    
    tempCtx.putImageData(imageData, 0, 0);
    
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