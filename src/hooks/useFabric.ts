// src/hooks/useFabric.ts
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
import { EditableTemplate } from "@/libs/fabric/designAssets";

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

 // --- UPDATED: Resize Canvas Function ---
  // --- UPDATED: Resize Canvas with Smart Controls ---
  const resizeCanvas = useCallback((width: number, height: number) => {
    if (!fabricCanvas) return;

    // 1. Resize the canvas container
    fabricCanvas.setDimensions({ width, height });
    setImageDimensions({ width, height }); 

    // 2. Smart Controls: Calculate proper corner size
    // Standard screen is ~1000px wide. If canvas is 2000px, we need double size corners.
    // We aim for a visual size of roughly 15px-20px.
    const maxDim = Math.max(width, height);
    // Heuristic: roughly 2.5% of the largest dimension, clamped between 15px and 100px
    const cornerSize = Math.max(15, Math.min(100, maxDim * 0.025));
    
    // Update Global Defaults for NEW objects
    window.fabric.Object.prototype.set({
        cornerSize: cornerSize,
        transparentCorners: false,
        cornerColor: '#ffffff',
        cornerStrokeColor: '#3b82f6', // Blue
        borderColor: '#3b82f6',
        cornerStyle: 'circle',
        borderScaleFactor: Math.max(2, maxDim * 0.003), // Thicker borders for huge images
        padding: Math.max(10, maxDim * 0.01), // More padding for touch targets
    });

    // 3. Fit Content (Your existing logic)
    const objects = fabricCanvas.getObjects();
    if (objects.length > 0) {
        const group = new window.fabric.ActiveSelection(objects, {
            canvas: fabricCanvas,
        });
        const groupWidth = group.getScaledWidth();
        const groupHeight = group.getScaledHeight();
        const scaleX = (width * 0.85) / groupWidth;
        const scaleY = (height * 0.85) / groupHeight;
        const scale = Math.min(scaleX, scaleY);

        group.scale(scale);
        group.center();
        group.setCoords();
        group.destroy(); 
        
        // 4. Apply new control sizes to EXISTING objects
        objects.forEach((obj: any) => {
            obj.set({
                cornerSize: cornerSize,
                transparentCorners: false,
                cornerColor: '#ffffff',
                cornerStrokeColor: '#3b82f6',
                borderColor: '#3b82f6',
                cornerStyle: 'circle',
                borderScaleFactor: Math.max(2, maxDim * 0.003),
                padding: Math.max(10, maxDim * 0.01),
            });
            obj.setCoords();
        });
    }

    // 5. Background Image Logic (Unchanged)
    if (fabricCanvas.backgroundImage) {
        const bgImg = fabricCanvas.backgroundImage;
        if (bgImg instanceof window.fabric.Image) {
             const scaleX = width / (bgImg.width || 1);
             const scaleY = height / (bgImg.height || 1);
             const scale = Math.max(scaleX, scaleY); 
             bgImg.set({
                 scaleX: scale, scaleY: scale, left: width / 2, top: height / 2, originX: 'center', originY: 'center'
             });
        }
    }

    fabricCanvas.renderAll();
    saveState(true); 
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

  const applyTemplate = useCallback((template: EditableTemplate) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    // 1. Find the main image (The User's Upload)
    const objects = canvas.getObjects();
    const mainImg = objects.find((obj: any) => obj.id === "main-image");

    // 2. Clear Canvas (Remove everything except we saved a reference to mainImg)
    canvas.clear();

    // 3. Set Background Color
    canvas.setBackgroundColor(template.backgroundColor, canvas.renderAll.bind(canvas));

    const canvasWidth = canvas.getWidth();
    const canvasHeight = canvas.getHeight();

    // 4. Add Template Layers
    template.layers.forEach((layer) => {
      let obj;
      
      // Calculate absolute positions based on percentages (0.5 = center)
      const left = layer.left * canvasWidth;
      const top = layer.top * canvasHeight;

      if (layer.type === 'text') {
        obj = new window.fabric.IText(layer.text || "Text", {
          ...layer,
          left, top
        });
      } else if (layer.type === 'rect') {
        obj = new window.fabric.Rect({
          ...layer,
          width: layer.width || 100,
          height: layer.height || 100,
          left, top
        });
      } else if (layer.type === 'circle') {
        obj = new window.fabric.Circle({
          ...layer,
          radius: layer.width || 50, // map width to radius for simplicity
          left, top
        });
      }

      if (obj) {
        // We set id="template-item" so we know these aren't the main image
        obj.set('id', 'template-item');
        canvas.add(obj);
      }
    });

    // 5. Put the Main Image (Dog) back
    if (mainImg) {
      // Reset any previous filters/shadows if you want a clean look, 
      // or keep them if you want to preserve edits.
      
      // We add it back.
      canvas.add(mainImg);
      
      // Center it in the design
      mainImg.center();
      mainImg.setCoords();
      
      // Bring to front so it sits on top of the template background shapes
      mainImg.bringToFront();
      
      // Update the ref in case it got lost (though object reference persists)
      imageRef.current = mainImg;
    }

    canvas.renderAll();
    saveState(true); // Save to history
  }, [saveState]);

  return {
    canvasRef, imageDimensions, handleRemoveObject, handleDownloadImage, clearDrawings,
    handleBackgroundImageUpload, clearBackgroundImage, setBackgroundImageFromUrl, setBackgroundColor,
    addStyledText, setOverlay, removeOverlay,
    undo, redo, canUndo, canRedo,
    activeObject, contextMenuPosition, closeContextMenu,
    bringForward, sendBackward, bringToFront, sendToBack, duplicateObject, deleteObject,
    resizeCanvas, applyTemplate,
  };
};