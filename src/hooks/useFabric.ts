"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { Tool } from "../types/editor";

declare global {
  interface Window {
    fabric: any;
  }
}

const dataURLtoFile = (dataurl: string, filename: string): File => {
  const arr = dataurl.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  if (!mimeMatch) throw new Error("Invalid Data URL");
  const mime = mimeMatch[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);
  return new File([u8arr], filename, { type: mime });
};

export const useFabric = (
  imageUrl: string,
  activeTool: Tool,
  brushSize: number,
  onComplete: (url: string) => void
) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<any | null>(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });

  const updateCanvasImage = useCallback((url: string) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !window.fabric) return;

    window.fabric.Image.fromURL(url, (img: any) => {
      canvas.clear(); 

      const padding = 15;
      const scale = Math.min(
        (800 - padding) / (img.width || 1),
        (600 - padding) / (img.height || 1)
      ) * 0.5;

      img.scale(scale);
      const scaledWidth = Math.round((img.width || 0) * scale);
      const scaledHeight = Math.round((img.height || 0) * scale);
      setImageDimensions({ width: scaledWidth, height: scaledHeight });

      canvas.setWidth(scaledWidth);
      canvas.setHeight(scaledHeight);

      img.set({
        selectable: false,
        evented: false,
        crossOrigin: 'anonymous'
      });

      canvas.add(img);
      canvas.centerObject(img);
      canvas.sendToBack(img);
      
      canvas.renderAll();
    }, { crossOrigin: 'anonymous' });
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !window.fabric) return;

    const canvas = new window.fabric.Canvas(canvasRef.current, {
      backgroundColor: 'transparent'
    });
    fabricCanvasRef.current = canvas;
    updateCanvasImage(imageUrl);

    return () => {
      const canvasInstance = fabricCanvasRef.current;
      if (canvasInstance && typeof canvasInstance.dispose === 'function') {
        if (canvasInstance.wrapperEl && canvasInstance.wrapperEl.parentNode) {
          canvasInstance.dispose();
        }
      }
      fabricCanvasRef.current = null;
    };
  }, [imageUrl, updateCanvasImage]);

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

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
  }, [activeTool, brushSize]);

  /**
   * NEW: This function now processes the mask to remove anti-aliasing,
   * ensuring it only contains pure black and pure white pixels.
   */
  const generateHardMaskDataURL = (): Promise<string | null> => {
    return new Promise((resolve) => {
      const canvas = fabricCanvasRef.current;
      if (!canvas) {
        resolve(null);
        return;
      }
      const paths = canvas.getObjects().filter((obj: any) => obj.type === 'path');
      if (paths.length === 0) {
        resolve(null);
        return;
      }

      // 1. Create a temporary Fabric canvas to draw the initial mask
      const softMaskCanvas = new window.fabric.StaticCanvas(null, {
        width: canvas.getWidth(),
        height: canvas.getHeight(),
        backgroundColor: 'black',
      });
      paths.forEach((path: any) => softMaskCanvas.add(path));
      softMaskCanvas.renderAll();
      const softMaskDataURL = softMaskCanvas.toDataURL({ format: 'png' });

      // 2. Process this mask in a standard HTML canvas to create hard edges
      const tempImg = new Image();
      tempImg.crossOrigin = "anonymous";
      tempImg.onload = () => {
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) {
          resolve(null);
          return;
        }
        tempCanvas.width = canvas.getWidth();
        tempCanvas.height = canvas.getHeight();
        tempCtx.drawImage(tempImg, 0, 0);

        const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        const pixels = imageData.data;

        // 3. Apply a threshold: if a pixel isn't pure black, make it pure white
        for (let i = 0; i < pixels.length; i += 4) {
          // Check the red channel (pixels[i]). If it's greater than 0, it's not pure black.
          if (pixels[i] > 0) {
            pixels[i] = 255;     // R
            pixels[i + 1] = 255; // G
            pixels[i + 2] = 255; // B
            pixels[i + 3] = 255; // A (fully opaque)
          }
        }
        tempCtx.putImageData(imageData, 0, 0);

        // 4. Resolve the promise with the new, hard-edged mask
        resolve(tempCanvas.toDataURL('image/png'));
      };
      tempImg.src = softMaskDataURL;
    });
  };

  const handleDownloadImage = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const dataURL = canvas.toDataURL({ format: 'png' });
    const link = document.createElement("a");
    link.download = "edited-image.png";
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

const handleRemoveObject = async () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const maskDataURL = await generateHardMaskDataURL();

    if (!maskDataURL) {
      alert("Please draw on the image to select an area to remove.");
      return;
    }

    const scaledImageDataURL = canvas.toDataURL({ format: 'png', without: ['path'] });

    try {
      const scaledImageFile = dataURLtoFile(scaledImageDataURL, "background_removed_image.png");
      const maskImageFile = dataURLtoFile(maskDataURL, "mask_image.png");

      const formData = new FormData();
      formData.append("background_removed_image", scaledImageFile);
      formData.append("mask_image", maskImageFile);

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      if (!baseUrl) {
        const errorMsg = "Configuration error: API base URL is not defined. Check your .env.local file.";
        alert(errorMsg);
        console.error(errorMsg);
        return; 
      }
      const apiEndpoint = `${baseUrl}remove-object/`;
      const response = await fetch(apiEndpoint, { method: "POST", body: formData });

      const contentType = response.headers.get("content-type");
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server Error: ${response.status}. Response: ${errorText}`);
      }

      if (contentType && contentType.indexOf("application/json") !== -1) {
        const result = await response.json();
        if (result.url) {
          const paths = canvas.getObjects().filter((obj: any) => obj.type === 'path');
          paths.forEach((path: any) => canvas.remove(path));
          canvas.renderAll();
          onComplete(result.url);
        } else {
          throw new Error("API response did not contain a URL.");
        }
      } else {
        throw new Error("Received an invalid response from the server.");
      }
    } catch (error) {
      console.error("Failed to remove object:", error);
      alert(`An error occurred: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return { canvasRef, imageDimensions, handleRemoveObject, handleDownloadImage };
};