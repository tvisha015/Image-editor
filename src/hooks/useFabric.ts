"use client";

import { useRef, useEffect, useState } from "react";
import { Tool } from "../types/editor";

declare global {
  interface Window {
    fabric: any;
  }
}

// Helper function to convert Data URL to a File object
const dataURLtoFile = (dataurl: string, filename: string): File => {
  const arr = dataurl.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  if (!mimeMatch) {
    throw new Error("Invalid Data URL");
  }
  const mime = mimeMatch[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
};

export const useFabric = (
  imageUrl: string,
  activeTool: Tool,
  brushSize: number,
  onComplete: (url: string) => void // Callback for when processing is successful
) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<any | null>(null);
  const imageRef = useRef<any | null>(null);

  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });

  // Effect to initialize the Fabric canvas and load the image
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
          selectable: false,
          evented: false,
        });

        canvas.add(img);
        canvas.centerObject(img);
        imageRef.current = img;
        canvas.sendToBack(img);

        canvas.renderAll();
      }, { crossOrigin: "anonymous" });
    };

    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
      }
    };
  }, [imageUrl]);

  // Effect to update the canvas when the active tool or brush size changes
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

  // Function to generate a mask Data URL from the drawn paths
  const generateMaskDataURL = (): string | null => {
    const mainCanvas = fabricCanvasRef.current;
    if (!mainCanvas) return null;

    const paths = mainCanvas.getObjects().filter((obj: any) => obj.type === 'path');
    
    const maskCanvas = new window.fabric.StaticCanvas(null, {
      width: mainCanvas.getWidth(),
      height: mainCanvas.getHeight(),
      backgroundColor: 'black',
    });

    paths.forEach((path: any) => {
      maskCanvas.add(path);
    });

    maskCanvas.renderAll();
    return maskCanvas.toDataURL({ format: 'png' });
  };

  // Function to download the mask as a PNG image
  const handleDownloadMask = () => {
    const dataURL = generateMaskDataURL();
    if (!dataURL) return;

    const link = document.createElement("a");
    link.download = "mask_image.png";
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Function to remove the object from the image using the mask
  const handleRemoveObject = async () => {
    const mainCanvas = fabricCanvasRef.current;
    const backgroundImage = imageRef.current;

    const maskDataURL = generateMaskDataURL();

    if (!maskDataURL || !mainCanvas || !backgroundImage) {
      alert("Could not generate data. Please ensure the image is loaded and you have drawn a mask.");
      return;
    }
    
    const scaledImageDataURL = mainCanvas.toDataURL({
        format: 'png',
        without: ['path'] 
    });

    try {
      const scaledImageFile = dataURLtoFile(scaledImageDataURL, "background_removed_image.png");
      const maskImageFile = dataURLtoFile(maskDataURL, "mask_image.png");

      const formData = new FormData();
      formData.append("background_removed_image", scaledImageFile);
      formData.append("mask_image", maskImageFile);

      console.log("Sending data to API...");
      const apiEndpoint = "https://img-bg-remover.makeitlive.info/remove-object/";
      const response = await fetch(apiEndpoint, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error Response:", errorData);
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      // Read the successful response as JSON
      const result = await response.json();
      console.log("Received API response:", result);

      // Call the onComplete callback with the final URL from the API
      if (result.url) {
        onComplete(result.url);
      } else {
        throw new Error("API response did not contain a URL.");
      }
      
    } catch (error) {
      console.error("Failed to remove object:", error);
      alert("An error occurred while removing the object. Please see the console for details.");
    }
  };
  return { canvasRef, imageDimensions, handleDownloadMask, handleRemoveObject };
};