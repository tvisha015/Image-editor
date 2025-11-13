"use client";

import { useRef, useEffect, useState, useCallback, RefObject } from "react";
import { Tool, BlurType, FilterType } from "../types/editor";

// Imports
import { initFabricCanvas, updateMainImage } from "@/libs/fabric/canvasSetup";
import { clearCanvasDrawings, useFabricBrush } from "@/libs/fabric/drawingActions";
import { useFabricZoom } from "@/libs/fabric/interactionEffects";
import { useFabricHistory } from "./fabric/useFabricHistory";
import { useFabricFilters } from "./fabric/useFabricFilters";
import { useFabricSelection } from "./fabric/useFabricSelection";

import {
  clearCanvasBgImage,
  setCanvasBgImageFromUrl,
  setCanvasColor,
  uploadCanvasBgImage,
} from "@/libs/fabric/backgroundActions";
import { exportCanvasImage, removeObjectApiCall } from "@/libs/fabric/apiActions";
import { useFabricActions } from "./fabric/useFabricAction";

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
  effectBlurValue: number,
  isFilterEnabled: boolean,
  filterType: FilterType,
  brightness: number,
  contrast: number,
  highlight: number,
  sharpen: number,
  shadow: number,
  opacity: number,
  adjustBlur: number,
) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageRef = useRef<any | null>(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });

  // --- CORE: Store Canvas in State so other hooks react to it ---
  const [fabricCanvas, setFabricCanvas] = useState<any | null>(null);
  // We also keep a ref for functions that need immediate access without dependencies
  const fabricCanvasRef = useRef<any | null>(null);

  // 1. Initialize Canvas
  useEffect(() => {
    const canvas = initFabricCanvas(canvasRef);
    if (canvas) {
        fabricCanvasRef.current = canvas;
        setFabricCanvas(canvas); // This triggers the other hooks
    }
    return () => {
      canvas?.dispose();
      fabricCanvasRef.current = null;
    };
  }, []);

  // --- SUB-HOOKS (Pass the canvas state) ---
  
  // History Hook
  const { saveState, undo, redo, canUndo, canRedo, isHistoryLocked, historyIndex } = useFabricHistory(fabricCanvas, imageRef);

  // Selection Hook (Handles Right Click)
  const { activeObject, contextMenuPosition, closeContextMenu } = useFabricSelection(fabricCanvas);

  // Actions Hook (Layers, Delete, Duplicate, Design)
  // Note: You need to ensure useFabricActions is created (I provided it in previous step) 
  // and accepts (fabricCanvasRef, saveState, closeContextMenu)
  const { 
    bringForward, sendBackward, bringToFront, sendToBack, duplicateObject, deleteObject,
    addStyledText, setOverlay, removeOverlay
  } = useFabricActions(fabricCanvasRef, saveState, closeContextMenu);

  // Filters Hook
  useFabricFilters(fabricCanvasRef, imageRef, isHistoryLocked, saveState, {
    isBlurEnabled, blurType, effectBlurValue, isFilterEnabled, filterType,
    brightness, contrast, highlight, sharpen, shadow, opacity, adjustBlur
  });

  // --- GLOBAL EVENT BINDING FOR HISTORY ---
  useEffect(() => {
    if (!fabricCanvas) return;

    const handleCanvasChange = () => {
        if (isHistoryLocked.current) return;
        saveState(false); 
    };

    // Bind events to trigger history save
    fabricCanvas.on("object:modified", handleCanvasChange);
    fabricCanvas.on("object:added", (e: any) => {
        // Ignore main image initial load
        if (e.target && e.target.id === "main-image") return;
        handleCanvasChange();
    });
    fabricCanvas.on("object:removed", handleCanvasChange);
    fabricCanvas.on("path:created", handleCanvasChange);

    return () => {
      fabricCanvas.off("object:modified", handleCanvasChange);
      fabricCanvas.off("object:added", handleCanvasChange);
      fabricCanvas.off("object:removed", handleCanvasChange);
      fabricCanvas.off("path:created", handleCanvasChange);
    };
  }, [fabricCanvas, saveState, isHistoryLocked]);


  // 2. Load Main Image
  useEffect(() => {
    if (!fabricCanvas) return;
    updateMainImage(
      fabricCanvas,
      imageRef as RefObject<any>,
      imageUrl,
      activeTool,
      setImageDimensions,
      () => { 
          // Save initial state if history is empty
          if (historyIndex === -1) { 
              isHistoryLocked.current = false; 
              saveState(true); 
          } 
      }
    );
  }, [imageUrl, fabricCanvas]); // Run when canvas is ready

  // Tool Selectability
  useEffect(() => {
      const image = imageRef.current;
      if(image && fabricCanvas) {
        image.set({ selectable: activeTool === "cursor", evented: activeTool === "cursor" });
        fabricCanvas.renderAll();
      }
  }, [activeTool, fabricCanvas]);

  // Helpers
  useFabricBrush(fabricCanvasRef, activeTool, brushSize);
  useFabricZoom(fabricCanvasRef, activeTool, isBgPanelOpen);

  // Delete Key Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!fabricCanvas) return;
      if (e.key === "Delete" || e.key === "Backspace") {
        const target = e.target as HTMLElement;
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
        if (fabricCanvas.getActiveObjects().length) {
            deleteObject();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [fabricCanvas, deleteObject]);

  // Actions wrappers
  const setBackgroundColor = useCallback((color: string) => {
    setCanvasColor(fabricCanvas, color);
    saveState(true);
  }, [fabricCanvas, saveState]);

  const handleBackgroundImageUpload = useCallback((file: File) => {
    uploadCanvasBgImage(fabricCanvas, file, () => saveState(true));
  }, [fabricCanvas, saveState]);

  const clearBackgroundImage = useCallback(() => {
    clearCanvasBgImage(fabricCanvas);
    saveState(true);
  }, [fabricCanvas, saveState]);

  const setBackgroundImageFromUrl = useCallback((imageUrl: string) => {
    setCanvasBgImageFromUrl(fabricCanvas, imageUrl, () => saveState(true));
  }, [fabricCanvas, saveState]);

  const handleDownloadImage = useCallback(() => { exportCanvasImage(fabricCanvas); }, [fabricCanvas]);
  const handleRemoveObject = useCallback(async () => { await removeObjectApiCall(fabricCanvas, imageRef.current, onComplete); }, [fabricCanvas, onComplete]);
  const clearDrawings = useCallback(() => { clearCanvasDrawings(fabricCanvas); saveState(true); }, [fabricCanvas, saveState]);

  return {
    canvasRef, imageDimensions, handleRemoveObject, handleDownloadImage, clearDrawings,
    handleBackgroundImageUpload, clearBackgroundImage, setBackgroundImageFromUrl, setBackgroundColor,
    addStyledText, setOverlay, removeOverlay,
    undo, redo, canUndo, canRedo,
    activeObject, contextMenuPosition, closeContextMenu,
    bringForward, sendBackward, bringToFront, sendToBack, duplicateObject, deleteObject,
  };
};