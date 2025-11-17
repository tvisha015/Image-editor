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

// --- Import Sub-Hooks ---
import { useFabricHistory } from "./fabric/useFabricHistory";
import { useFabricFilters } from "./fabric/useFabricFilters";
import { useFabricSelection } from "./fabric/useFabricSelection";
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
  const fabricCanvasRef = useRef<any | null>(null);
  const imageRef = useRef<any | null>(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });

  // --- CORE: Store Canvas in State ---
  const [fabricCanvas, setFabricCanvas] = useState<any | null>(null);

  // 1. Initialize Canvas
  useEffect(() => {
    const canvas = initFabricCanvas(canvasRef);
    if (canvas) {
        fabricCanvasRef.current = canvas;
        setFabricCanvas(canvas); 
    }
    return () => {
      canvas?.dispose();
      fabricCanvasRef.current = null;
    };
  }, []);

  // --- SUB-HOOKS ---
  const { saveState, undo, redo, canUndo, canRedo, isHistoryLocked, historyIndex } = useFabricHistory(fabricCanvas, imageRef);
  const { activeObject, contextMenuPosition, closeContextMenu } = useFabricSelection(fabricCanvas);
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageUrl, fabricCanvas]); 

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

  // --- NEW: RESIZE FUNCTION ---
  const resizeCanvas = useCallback((width: number, height: number) => {
    if (!fabricCanvas) return;

    // 1. Resize the canvas logic
    fabricCanvas.setDimensions({ width, height });
    setImageDimensions({ width, height }); // Update UI state

    // 2. Re-center the main image (Dog)
    const objects = fabricCanvas.getObjects();
    const mainImg = objects.find((obj: any) => obj.id === "main-image");

    if (mainImg) {
      mainImg.center(); 
      mainImg.setCoords(); 
    }

    // 3. Re-scale background if it's an image (Template)
    if (fabricCanvas.backgroundImage) {
        const bgImg = fabricCanvas.backgroundImage;
        if (bgImg instanceof window.fabric.Image) {
             // Scale image to cover the new canvas size
             const scaleX = width / (bgImg.width || 1);
             const scaleY = height / (bgImg.height || 1);
             const scale = Math.max(scaleX, scaleY);
             
             bgImg.set({
                 scaleX: scale,
                 scaleY: scale,
                 left: width / 2,
                 top: height / 2,
                 originX: 'center',
                 originY: 'center'
             });
        }
    }

    fabricCanvas.renderAll();
    saveState(true); // Save history
  }, [fabricCanvas, saveState]);


  // Actions wrappers
  const setBackgroundColor = useCallback((color: string) => {
    if (!fabricCanvas) return;
    setCanvasColor(fabricCanvas, color);
    saveState(true);
  }, [fabricCanvas, saveState]);

  const handleBackgroundImageUpload = useCallback((file: File) => {
    if (!fabricCanvas) return;
    uploadCanvasBgImage(fabricCanvas, file, () => saveState(true));
  }, [fabricCanvas, saveState]);

  const clearBackgroundImage = useCallback(() => {
    if (!fabricCanvas) return;
    clearCanvasBgImage(fabricCanvas);
    saveState(true);
  }, [fabricCanvas, saveState]);

  const setBackgroundImageFromUrl = useCallback((imageUrl: string) => {
    if (!fabricCanvas) return;
    setCanvasBgImageFromUrl(fabricCanvas, imageUrl, () => saveState(true));
  }, [fabricCanvas, saveState]);

  const handleDownloadImage = useCallback(() => { if(fabricCanvas) exportCanvasImage(fabricCanvas); }, [fabricCanvas]);
  const handleRemoveObject = useCallback(async () => { if(fabricCanvas) await removeObjectApiCall(fabricCanvas, imageRef.current, onComplete); }, [fabricCanvas, onComplete]);
  const clearDrawings = useCallback(() => { if(fabricCanvas) { clearCanvasDrawings(fabricCanvas); saveState(true); } }, [fabricCanvas, saveState]);

  return {
    canvasRef, imageDimensions, handleRemoveObject, handleDownloadImage, clearDrawings,
    handleBackgroundImageUpload, clearBackgroundImage, setBackgroundImageFromUrl, setBackgroundColor,
    addStyledText, setOverlay, removeOverlay,
    undo, redo, canUndo, canRedo,
    activeObject, contextMenuPosition, closeContextMenu,
    bringForward, sendBackward, bringToFront, sendToBack, duplicateObject, deleteObject,
    resizeCanvas,
  };
};