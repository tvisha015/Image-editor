"use client";

import { useRef, useEffect, useState, useCallback, RefObject } from "react";
import { Tool, BlurType, FilterType } from "../types/editor";

import { initFabricCanvas, updateMainImage } from "@/libs/fabric/canvasSetup";
import {
  clearCanvasDrawings,
  useFabricBrush,
} from "@/libs/fabric/drawingActions";
import { useFabricZoom } from "@/libs/fabric/interactionEffects";
import {
  clearCanvasBgImage,
  setCanvasBgImageFromUrl,
  setCanvasColor,
  uploadCanvasBgImage,
} from "@/libs/fabric/backgroundActions";
import {
  exportCanvasImage,
  removeObjectApiCall,
} from "@/libs/fabric/apiActions";

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
  adjustBlur: number
) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fabricCanvasRef = useRef<any | null>(null);
  const imageRef = useRef<any | null>(null);
  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  });

  // --- HISTORY STATE ---
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const isHistoryLocked = useRef(false);
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);

  // --- MAIN SAVE FUNCTION ---
  const saveState = useCallback(() => {
    if (isHistoryLocked.current) return;
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    if (saveTimeout.current) clearTimeout(saveTimeout.current);

    saveTimeout.current = setTimeout(() => {
      if (isHistoryLocked.current) return;

      try {
        // We use a minimal set of properties to keep it light, but include ID to find main image
        const json = JSON.stringify(
          canvas.toJSON([
            "selectable",
            "evented",
            "id",
            "lockMovementX",
            "lockMovementY",
          ])
        );

        setHistory((prev) => {
          // If current state is identical to last saved state, skip
          if (prev.length > 0 && prev[historyIndex] === json) return prev;

          const newHistory = prev.slice(0, historyIndex + 1);
          newHistory.push(json);
          return newHistory;
        });

        setHistoryIndex((prev) => {
          // Ensure index aligns with the new history length
          // (Simple increment works because we just sliced+pushed)
          return prev + 1;
        });
      } catch (e) {
        console.error("Failed to save state", e);
      }
    }, 500); // 500ms debounce
  }, [historyIndex]);

  // 1. Initialize Canvas
  useEffect(() => {
    const canvas = initFabricCanvas(canvasRef);
    fabricCanvasRef.current = canvas;

    const handleCanvasChange = () => {
      if (isHistoryLocked.current) return;
      saveState();
    };

    canvas.on("object:modified", handleCanvasChange);
    canvas.on("object:added", (e: any) => {
      // Ignore initial load
      if (e.target && e.target.id === "main-image" && historyIndex === -1)
        return;
      handleCanvasChange();
    });
    canvas.on("object:removed", handleCanvasChange);
    canvas.on("path:created", handleCanvasChange);

    return () => {
      canvas.off("object:modified", handleCanvasChange);
      canvas.off("object:added", handleCanvasChange);
      canvas.off("object:removed", handleCanvasChange);
      canvas.off("path:created", handleCanvasChange);
      fabricCanvasRef.current?.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. Load Main Image
  useEffect(() => {
    updateMainImage(
      fabricCanvasRef.current,
      imageRef as RefObject<any>,
      imageUrl,
      activeTool,
      setImageDimensions,
      () => {
        // Initial Save on fresh load
        if (historyIndex === -1) {
          isHistoryLocked.current = false;
          saveState();
        }
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageUrl]);

  // Tool Selectability
  useEffect(() => {
    const image = imageRef.current;
    if (image) {
      image.set({
        selectable: activeTool === "cursor",
        evented: activeTool === "cursor",
      });
      fabricCanvasRef.current?.renderAll();
    }
  }, [activeTool]);

  // 3. Setup Brush
  useFabricBrush(fabricCanvasRef, activeTool, brushSize);

  // 4. Setup Zoom
  useFabricZoom(fabricCanvasRef, activeTool, isBgPanelOpen);

  // 5. Delete Key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const canvas = fabricCanvasRef.current;
      if (!canvas) return;
      if (e.key === "Delete" || e.key === "Backspace") {
        const target = e.target as HTMLElement;
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;

        const activeObjects = canvas.getActiveObjects();
        if (activeObjects.length) {
          const isEditing = activeObjects.some((obj: any) => obj.isEditing);
          if (!isEditing) {
            activeObjects.forEach((obj: any) => canvas.remove(obj));
            canvas.discardActiveObject();
            canvas.renderAll();
            saveState();
          }
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [saveState]);

  // --- UNDO FUNCTION ---
  const undo = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || historyIndex <= 0) return;

    // 1. Lock History
    isHistoryLocked.current = true;
    if (saveTimeout.current) clearTimeout(saveTimeout.current);

    const prevIndex = historyIndex - 1;
    const prevState = history[prevIndex];

    console.log("Undoing...");

    // 2. Parse JSON safely
    let json;
    try {
      json = JSON.parse(prevState);
    } catch (e) {
      console.error("Invalid history state", e);
      isHistoryLocked.current = false;
      return;
    }

    // 3. Load
    canvas.loadFromJSON(json, () => {
      // This callback runs AFTER objects are created
      canvas.renderAll();

      // Rebind main image
      const objects = canvas.getObjects();
      const mainImg = objects.find((obj: any) => obj.id === "main-image");
      if (mainImg) imageRef.current = mainImg;

      setHistoryIndex(prevIndex);

      // Delay unlock slightly to let Fabric finish rendering filters
      setTimeout(() => {
        isHistoryLocked.current = false;
      }, 100);
    });
  }, [history, historyIndex]);

  // --- REDO FUNCTION ---
  const redo = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || historyIndex >= history.length - 1) return;

    isHistoryLocked.current = true;
    if (saveTimeout.current) clearTimeout(saveTimeout.current);

    const nextIndex = historyIndex + 1;
    const nextState = history[nextIndex];

    console.log("Redoing...");

    let json;
    try {
      json = JSON.parse(nextState);
    } catch (e) {
      console.error("Invalid history state", e);
      isHistoryLocked.current = false;
      return;
    }

    canvas.loadFromJSON(json, () => {
      canvas.renderAll();

      const objects = canvas.getObjects();
      const mainImg = objects.find((obj: any) => obj.id === "main-image");
      if (mainImg) imageRef.current = mainImg;

      setHistoryIndex(nextIndex);

      setTimeout(() => {
        isHistoryLocked.current = false;
      }, 100);
    });
  }, [history, historyIndex]);

  // 6. Apply Filters
  useEffect(() => {
    // If we are currently undoing/redoing (locked), DO NOT apply filters.
    // This prevents the "width of undefined" error because the image isn't ready yet.
    if (isHistoryLocked.current) return;

    const canvas = fabricCanvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image || !window.fabric || !window.fabric.Image.filters)
      return;

    const newFilters: any[] = [];

    // Adjustments
    if (brightness !== 0)
      newFilters.push(
        new window.fabric.Image.filters.Brightness({ brightness })
      );
    if (contrast !== 0)
      newFilters.push(new window.fabric.Image.filters.Contrast({ contrast }));
    const gammaValue = 1.0 + highlight;
    if (highlight > 0)
      newFilters.push(
        new window.fabric.Image.filters.Gamma({
          gamma: [gammaValue, gammaValue, gammaValue],
        })
      );
    if (sharpen > 0) {
      const s = sharpen * 1.5;
      newFilters.push(
        new window.fabric.Image.filters.Convolute({
          matrix: [0, -s, 0, -s, 1 + 4 * s, -s, 0, -s, 0],
        })
      );
    }
    if (adjustBlur > 0)
      newFilters.push(
        new window.fabric.Image.filters.Blur({ blur: adjustBlur })
      );

    // Effects
    if (isBlurEnabled) {
      const blurIntensity = effectBlurValue / 100;
      switch (blurType) {
        case "gaussian":
          newFilters.push(
            new window.fabric.Image.filters.Blur({ blur: blurIntensity })
          );
          break;
        case "pixelate":
        case "square":
          const blockSize = Math.max(
            2,
            Math.round((effectBlurValue / 100) * 20)
          );
          newFilters.push(
            new window.fabric.Image.filters.Pixelate({ blocksize: blockSize })
          );
          break;
        case "motion":
          let matrixSize = 3;
          if (effectBlurValue > 33) matrixSize = 5;
          if (effectBlurValue > 66) matrixSize = 7;
          const val = 1 / matrixSize;
          const motionMatrix = new Array(matrixSize * matrixSize).fill(0);
          for (let i = 0; i < matrixSize; i++)
            motionMatrix[Math.floor(matrixSize / 2) * matrixSize + i] = val;
          newFilters.push(
            new window.fabric.Image.filters.Convolute({ matrix: motionMatrix })
          );
          break;
      }
    }

    if (isFilterEnabled) {
      switch (filterType) {
        case "noir":
          newFilters.push(new window.fabric.Image.filters.Grayscale());
          newFilters.push(
            new window.fabric.Image.filters.Contrast({ contrast: 0.2 })
          );
          break;
        case "sepia":
          newFilters.push(new window.fabric.Image.filters.Sepia());
          break;
        case "mono":
          newFilters.push(new window.fabric.Image.filters.Grayscale());
          break;
        case "fade":
          newFilters.push(
            new window.fabric.Image.filters.Saturation({ saturation: -0.3 })
          );
          newFilters.push(
            new window.fabric.Image.filters.Brightness({ brightness: 0.1 })
          );
          break;
        case "process":
          newFilters.push(
            new window.fabric.Image.filters.ColorMatrix({
              matrix: [
                1.0, 0.2, 0.0, 0, 0.05, 0.0, 1.0, 0.0, 0, 0.05, 0.2, 0.0, 1.0,
                0, 0.05, 0, 0, 0, 1, 0,
              ],
            })
          );
          break;
        case "tonal":
          newFilters.push(
            new window.fabric.Image.filters.ColorMatrix({
              matrix: [
                0.7, 0, 0, 0, 0.1, 0, 1.0, 0, 0, 0, 0, 0, 1.3, 0, 0.1, 0, 0, 0,
                1, 0,
              ],
            })
          );
          break;
      }
    }

    // Properties
    image.set("opacity", opacity);
    if (shadow > 0) {
      image.set(
        "shadow",
        new window.fabric.Shadow({
          color: "rgba(0,0,0,0.7)",
          blur: shadow * 20,
          offsetX: shadow * 5,
          offsetY: shadow * 5,
        })
      );
    } else {
      image.set("shadow", null);
    }

    // IMPORTANT: Only apply filters if we are NOT currently locked (undoing/redoing)
    if (!isHistoryLocked.current) {
      image.filters = newFilters;
      image.applyFilters();
      canvas.renderAll();
      saveState();
    }
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
    adjustBlur,
    saveState, // Added saveState dependency
  ]);

  // Actions
  const setBackgroundColor = useCallback(
    (color: string) => {
      setCanvasColor(fabricCanvasRef.current, color);
      saveState();
    },
    [saveState]
  );
  const handleBackgroundImageUpload = useCallback(
    (file: File) => {
      uploadCanvasBgImage(fabricCanvasRef.current, file, saveState);
    },
    [saveState]
  );
  const clearBackgroundImage = useCallback(() => {
    clearCanvasBgImage(fabricCanvasRef.current);
    saveState();
  }, [saveState]);
  const setBackgroundImageFromUrl = useCallback(
    (imageUrl: string) => {
      setCanvasBgImageFromUrl(fabricCanvasRef.current, imageUrl, saveState);
    },
    [saveState]
  );
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
    saveState();
  }, [saveState]);

  const addStyledText = useCallback((text: string, style: any) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !window.fabric) return;
    let shadowObj = null;
    if (style.shadow) shadowObj = new window.fabric.Shadow(style.shadow);
    const textObj = new window.fabric.IText(text, {
      left: canvas.getWidth() / 2,
      top: canvas.getHeight() / 2,
      originX: "center",
      originY: "center",
      ...style,
      shadow: shadowObj,
    });
    canvas.add(textObj);
    canvas.setActiveObject(textObj);
    canvas.renderAll();
  }, []);

  const setOverlay = useCallback(
    (imageUrl: string) => {
      const canvas = fabricCanvasRef.current;
      if (!canvas || !window.fabric) return;
      window.fabric.Image.fromURL(
        imageUrl,
        (img: any) => {
          img.scaleToWidth(canvas.getWidth());
          img.scaleToHeight(canvas.getHeight());
          canvas.setOverlayImage(
            img,
            () => {
              canvas.renderAll();
              saveState();
            },
            { originX: "left", originY: "top", crossOrigin: "anonymous" }
          );
        },
        { crossOrigin: "anonymous" }
      );
    },
    [saveState]
  );

  const removeOverlay = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !window.fabric) return;
    canvas.setOverlayImage(null, () => {
      canvas.renderAll();
      saveState();
    });
  }, [saveState]);

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
    undo,
    redo,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
  };
};
