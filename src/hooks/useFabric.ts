"use client";

import { useRef, useEffect, useState, useCallback, RefObject } from "react";
import { Tool, BlurType, FilterType } from "../types/editor";

import { initFabricCanvas, updateMainImage } from "@/libs/fabric/canvasSetup";
import { clearCanvasDrawings, useFabricBrush } from "@/libs/fabric/drawingActions";
import { useFabricZoom } from "@/libs/fabric/interactionEffects";
import {
  clearCanvasBgImage,
  setCanvasBgImageFromUrl,
  setCanvasColor,
  uploadCanvasBgImage,
} from "@/libs/fabric/backgroundActions";
import { exportCanvasImage, removeObjectApiCall } from "@/libs/fabric/apiActions";

// import "@/libs/fabric/customFilters";

export const useFabric = (
  imageUrl: string,
  activeTool: Tool,
  brushSize: number,
  onComplete: (url: string) => void,
  backgroundColor: string,
  onBgImageUpload: (file: File) => void,
  isBgPanelOpen: boolean,
  isBlurEnabled: boolean,
  blurType: BlurType,
  blurValue: number,
  isFilterEnabled: boolean,
  filterType: FilterType
) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fabricCanvasRef = useRef<any | null>(null);
  const imageRef = useRef<any | null>(null);
  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  });

  // 1. Initialize Canvas
  useEffect(() => {
    const canvas = initFabricCanvas(canvasRef);
    fabricCanvasRef.current = canvas;
    return () => {
      fabricCanvasRef.current?.dispose();
    };
  }, []);

  // 2. Load Main Image
  useEffect(() => {
    updateMainImage(
      fabricCanvasRef.current,
      imageRef as RefObject<any>,
      imageUrl,
      activeTool,
      setImageDimensions
    );
  }, [imageUrl, activeTool]);

  // 3. Setup Brush Effect
  useFabricBrush(fabricCanvasRef, activeTool, brushSize);

  // 4. Setup Zoom Effect
  useFabricZoom(fabricCanvasRef, activeTool, isBgPanelOpen);

  // --- 5. Apply Effects (Logic updated) ---
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image || !window.fabric || !window.fabric.Image.filters) {
      return;
    }

    const newFilters: any[] = [];

    // 2. Add Blur filters if enabled
    if (isBlurEnabled) {
      const blurIntensity = blurValue / 100; // Scale 0-100 to 0-1

      switch (blurType) {
        case "gaussian":
          newFilters.push(
            new window.fabric.Image.filters.Blur({ blur: blurIntensity })
          );
          break;

        // --- FIX 4: Re-introducing Hexagon/Square logic ---
        case "pixelate":
          // Use the custom Hexagonal filter
          if (window.fabric.Image.filters.HexagonalPixelate) {
            const hexBlockSize = Math.max(2, Math.round((blurValue / 100) * 16));
            newFilters.push(
              new window.fabric.Image.filters.HexagonalPixelate({
                blocksize: hexBlockSize,
              })
            );
          } else {
            console.warn("HexagonalPixelate filter failed to load. Falling back to square.");
            const fallbackBlockSize = Math.max(2, Math.round((blurValue / 100) * 20));
            newFilters.push(
              new window.fabric.Image.filters.Pixelate({ blocksize: fallbackBlockSize })
            );
          }
          break;

        case "square":
          // Use the standard Square filter
          const blockSize = Math.max(2, Math.round((blurValue / 100) * 20));
          newFilters.push(
            new window.fabric.Image.filters.Pixelate({ blocksize: blockSize })
          );
          break;

        case "motion":
          // Your existing motion blur logic
          let matrixSize = 3;
          if (blurValue > 33) matrixSize = 5;
          if (blurValue > 66) matrixSize = 7;
          
          let motionMatrix = [];
          const val = 1 / matrixSize;

          if (matrixSize === 3) {
            motionMatrix = [0, 0, 0, val, val, val, 0, 0, 0];
          } else if (matrixSize === 5) {
            motionMatrix = [
              0, 0, 0, 0, 0,
              0, 0, 0, 0, 0,
              val, val, val, val, val,
              0, 0, 0, 0, 0,
              0, 0, 0, 0, 0
            ];
          } else { // 7x7
            motionMatrix = [
              0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 0,
              val, val, val, val, val, val, val,
              0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 0,
              0, 0, 0, 0, 0, 0, 0
            ];
          }
          
          newFilters.push(
            new window.fabric.Image.filters.Convolute({ matrix: motionMatrix })
          );
          break;
      }
    }

    // 3. Add simple Filters if enabled
    if (isFilterEnabled) {
      switch (filterType) {
        case "noir":
          newFilters.push(new window.fabric.Image.filters.Grayscale());
          newFilters.push(new window.fabric.Image.filters.Contrast({ contrast: 0.2 }));
          break;
        case "sepia":
          newFilters.push(new window.fabric.Image.filters.Sepia());
          break;
        case "mono":
          newFilters.push(new window.fabric.Image.filters.Grayscale());
          break;
        case "fade":
          newFilters.push(new window.fabric.Image.filters.Saturation({ saturation: -0.3 }));
          newFilters.push(new window.fabric.Image.filters.Brightness({ brightness: 0.1 }));
          break;
        case "process":
          // This matrix gives a "cross-process" vintage look by shifting color channels
          newFilters.push(new window.fabric.Image.filters.ColorMatrix({
            matrix: [
              1.0, 0.2, 0.0, 0, 0.05,
              0.0, 1.0, 0.0, 0, 0.05,
              0.2, 0.0, 1.0, 0, 0.05,
              0,   0,   0, 1, 0
            ]
          }));
          break;
          
        case "tonal":
          // This matrix mutes reds and boosts blues for a "cool" tonal effect
          newFilters.push(new window.fabric.Image.filters.ColorMatrix({
            matrix: [
              0.7, 0,   0,   0, 0.1, // Less red
              0,   1.0, 0,   0, 0,   // Normal green
              0,   0,   1.3, 0, 0.1, // More blue
              0,   0,   0,   1, 0
            ]
          }));
          break;
      }
    }

    // 4. Apply the new filter array to the image
    image.filters = newFilters;
    image.applyFilters();
    canvas.renderAll();

  }, [
    // --- FIX 5: Added the missing dependency ---
    isBlurEnabled, 
    blurType,
    blurValue,
    isFilterEnabled,
    filterType,
  ]);

  // 6. Wrap Actions in useCallback (All unchanged)
  const setBackgroundColor = useCallback((color: string) => {
    setCanvasColor(fabricCanvasRef.current, color);
  }, []);

  const handleBackgroundImageUpload = useCallback((file: File) => {
    uploadCanvasBgImage(fabricCanvasRef.current, file);
  }, []);

  const clearBackgroundImage = useCallback(() => {
    clearCanvasBgImage(fabricCanvasRef.current);
  }, []);

  const setBackgroundImageFromUrl = useCallback((imageUrl: string) => {
    setCanvasBgImageFromUrl(fabricCanvasRef.current, imageUrl);
  }, []);

  const handleDownloadImage = useCallback(() => {
    exportCanvasImage(fabricCanvasRef.current);
  }, []);

  const handleRemoveObject = useCallback(async () => {
    await removeObjectApiCall(
      fabricCanvasRef.current,
      imageRef.current,
      onComplete
    );
  }, [onComplete]);

  const clearDrawings = useCallback(() => {
    clearCanvasDrawings(fabricCanvasRef.current);
  }, []);

  // Return the same interface as before
  return {
    canvasRef,
    imageDimensions,
    handleRemoveObject,
    handleDownloadImage,
    clearDrawings,
    handleBackgroundImageUpload,
    clearBackgroundImage,
    setBackgroundImageFromUrl,
    setBackgroundColor,
  };
};