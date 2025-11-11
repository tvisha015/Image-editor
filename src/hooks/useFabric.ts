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

// We're parking the hexagon filter for now
// import "@/libs/fabric/customFilters";

export const useFabric = (
  imageUrl: string,
  activeTool: Tool,
  brushSize: number,
  onComplete: (url: string) => void,
  backgroundColor: string,
  onBgImageUpload: (file: File) => void,
  isBgPanelOpen: boolean,
  // Effect Props
  isBlurEnabled: boolean,
  blurType: BlurType,
  effectBlurValue: number,
  isFilterEnabled: boolean,
  filterType: FilterType,
  // Adjust Props
  brightness: number,
  contrast: number,
  highlight: number,
  sharpen: number,
  shadow: number,
  opacity: number,
  adjustBlur: number,
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

  // Handle Delete Key for Object Removal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const canvas = fabricCanvasRef.current;
      if (!canvas) return;

      // Check for Delete or Backspace keys
      if (e.key === "Delete" || e.key === "Backspace") {
        
        // Prevent deletion if the user is typing in an input field (like a slider or text box)
        const target = e.target as HTMLElement;
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
          return;
        }

        const activeObjects = canvas.getActiveObjects();
        
        if (activeObjects.length) {
          // Check if the active object is currently being edited (e.g., text editing)
          const isEditing = activeObjects.some((obj: any) => obj.isEditing);
          
          if (!isEditing) {
            activeObjects.forEach((obj: any) => {
              canvas.remove(obj);
            });
            canvas.discardActiveObject();
            canvas.renderAll();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // --- 5. Apply All Filters & Properties (Logic Corrected) ---
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image || !window.fabric || !window.fabric.Image.filters) {
      return;
    }

    const newFilters: any[] = [];

    // --- A. APPLY ADJUSTMENTS ---
    if (brightness !== 0) {
      newFilters.push(new window.fabric.Image.filters.Brightness({ brightness }));
    }
    if (contrast !== 0) {
      newFilters.push(new window.fabric.Image.filters.Contrast({ contrast }));
    }

    const gammaValue = 1.0 + highlight;
    if (highlight > 0) {
      newFilters.push(new window.fabric.Image.filters.Gamma({
        gamma: [gammaValue, gammaValue, gammaValue]
      }));
    }

    // --- FIX 1: Moved sharpen logic out of shadow block ---
    if (sharpen > 0) {
      const s = sharpen * 1.5;
      newFilters.push(new window.fabric.Image.filters.Convolute({
        matrix: [
           0,   -s,    0,
          -s,  1 + 4*s,  -s,
           0,   -s,    0
        ]
      }));
    }
    
    // --- FIX 2: Add logic for the Adjust panel's blur ---
    if (adjustBlur > 0) {
       newFilters.push(new window.fabric.Image.filters.Blur({ blur: adjustBlur }));
    }

    // --- B. APPLY "EFFECT" TAB BLUR ---
    if (isBlurEnabled) {
      const blurIntensity = effectBlurValue / 100;

      switch (blurType) {
        case "gaussian":
          newFilters.push(
            new window.fabric.Image.filters.Blur({ blur: blurIntensity })
          );
          break;
        case "pixelate":
          // Use the custom Hexagonal filter
          if (window.fabric.Image.filters.HexagonalPixelate) {
            const hexBlockSize = Math.max(2, Math.round((effectBlurValue / 100) * 16));
            newFilters.push(
              new window.fabric.Image.filters.HexagonalPixelate({
                blocksize: hexBlockSize,
              })
            );
          } else {
            console.warn("HexagonalPixelate filter failed to load. Falling back to square.");
            const fallbackBlockSize = Math.max(2, Math.round((effectBlurValue / 100) * 20));
            newFilters.push(
              new window.fabric.Image.filters.Pixelate({ blocksize: fallbackBlockSize })
            );
          }
          break;

        case "square":
          const blockSize = Math.max(2, Math.round((effectBlurValue / 100) * 20));
          newFilters.push(
            new window.fabric.Image.filters.Pixelate({ blocksize: blockSize })
          );
          break;
        case "motion":
          let matrixSize = 3;
          if (effectBlurValue > 33) matrixSize = 5;
          if (effectBlurValue > 66) matrixSize = 7;
          
          let motionMatrix = [];
          const val = 1 / matrixSize;
          if (matrixSize === 3) {
            motionMatrix = [0, 0, 0, val, val, val, 0, 0, 0];
          } else if (matrixSize === 5) {
            motionMatrix = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, val, val, val, val, val, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
          } else {
            motionMatrix = [
              0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
              val, val, val, val, val, val, val,
              0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
            ];
          }
          newFilters.push(
            new window.fabric.Image.filters.Convolute({ matrix: motionMatrix })
          );
          break;
      }
    }

    // --- C. APPLY "EFFECT" TAB FILTERS ---
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
          newFilters.push(new window.fabric.Image.filters.ColorMatrix({
            matrix: [ 1.0, 0.2, 0.0, 0, 0.05, 0.0, 1.0, 0.0, 0, 0.05, 0.2, 0.0, 1.0, 0, 0.05, 0, 0, 0, 1, 0]
          }));
          break;
        case "tonal":
          newFilters.push(new window.fabric.Image.filters.ColorMatrix({
            matrix: [ 0.7, 0, 0, 0, 0.1, 0, 1.0, 0, 0, 0, 0, 0, 1.3, 0, 0.1, 0, 0, 0, 1, 0]
          }));
          break;
      }
    }

    // --- D. APPLY OBJECT PROPERTIES (NOT FILTERS) ---
    image.set('opacity', opacity);

    if (shadow > 0) {
      image.set('shadow', new window.fabric.Shadow({
        color: 'rgba(0, 0, 0, 0.7)',
        blur: shadow * 20, // Map 0-1 to 0-20 blur radius
        offsetX: shadow * 5, // Map 0-1 to 0-5 offset
        offsetY: shadow * 5
      }));
    } else {
      image.set('shadow', null);
    }

    // --- E. APPLY ALL FILTERS AND RENDER ---
    image.filters = newFilters;
    image.applyFilters();
    canvas.renderAll();

  }, [
    isBlurEnabled, 
    blurType,
    effectBlurValue,
    isFilterEnabled,
    filterType,
    brightness,
    contrast,
    highlight,
    sharpen,
    shadow,
    opacity,
    adjustBlur
  ]);

  // 6. Wrap Actions in useCallback
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

  // --- 6. NEW FUNCTION: Add SVG Text Design ---
  // const addSvgText = useCallback((url: string) => {
  //   const canvas = fabricCanvasRef.current;
  //   if (!canvas || !window.fabric) return;

  //   window.fabric.loadSVGFromURL(url, (objects: any[], options: any) => {
  //     if (!objects || objects.length === 0) return;

  //     // Group the SVG elements so they move together
  //     const svgGroup = window.fabric.util.groupSVGElements(objects, options);
      
  //     // Center and scale reasonably
  //     svgGroup.scaleToWidth(canvas.getWidth() * 0.5); 
      
  //     canvas.add(svgGroup);
  //     canvas.setActiveObject(svgGroup);
  //     canvas.centerObject(svgGroup);
  //     canvas.renderAll();
  //   });
  // }, []);
  const addStyledText = useCallback((text: string, style: any) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !window.fabric) return;

    // Create the Shadow object if the style has one
    let shadowObj = null;
    if (style.shadow) {
      shadowObj = new window.fabric.Shadow(style.shadow);
    }

    const textObj = new window.fabric.IText(text, {
      left: canvas.getWidth() / 2,
      top: canvas.getHeight() / 2,
      originX: 'center',
      originY: 'center',
      ...style, // Apply all simple properties (fill, font, etc.)
      shadow: shadowObj, // Apply the shadow object
    });

    canvas.add(textObj);
    canvas.setActiveObject(textObj);
    canvas.renderAll();
  }, []);

  // --- 7. NEW FUNCTION: Set Template Overlay ---
  const setOverlay = useCallback((imageUrl: string) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !window.fabric) return;

    window.fabric.Image.fromURL(imageUrl, (img: any) => {
       // Scale the overlay to cover the canvas exactly
       img.scaleToWidth(canvas.getWidth());
       img.scaleToHeight(canvas.getHeight());

       canvas.setOverlayImage(img, canvas.renderAll.bind(canvas), {
         originX: 'left',
         originY: 'top',
         crossOrigin: 'anonymous'
       });
    }, { crossOrigin: 'anonymous' });
  }, []);

  const removeOverlay = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !window.fabric) return;

    // Setting it to null removes it
    canvas.setOverlayImage(null, canvas.renderAll.bind(canvas));
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
    addStyledText,
    setOverlay,
    removeOverlay,
  };
};