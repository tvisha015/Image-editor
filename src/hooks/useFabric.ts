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

  // --- HISTORY STATE ---
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const isHistoryLocked = useRef(false); 
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);
  
  // --- Active Object State ---
  const [activeObject, setActiveObject] = useState<any | null>(null);
  const [contextMenuPosition, setContextMenuPosition] = useState<{ x: number; y: number } | null>(null);

  // --- MAIN SAVE FUNCTION ---
  const saveState = useCallback((skipDebounce = false) => {
    if (isHistoryLocked.current) return;
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const performSave = () => {
      if (isHistoryLocked.current) return;

      try {
        const json = JSON.stringify(canvas.toJSON(['selectable', 'evented', 'id', 'lockMovementX', 'lockMovementY']));
        
        setHistory((prev) => {
          // Strict Duplicate Check: Don't save if state hasn't changed
          if (historyIndex >= 0 && prev[historyIndex] === json) {
             return prev; 
          }

          // Cut off future history if we are in the middle of the stack
          const newHistory = prev.slice(0, historyIndex + 1);
          newHistory.push(json);
          
          // Update index immediately
          setHistoryIndex(newHistory.length - 1);
          return newHistory;
        });
      } catch (e) {
        console.error("Failed to save state", e);
      }
    };

    if (saveTimeout.current) clearTimeout(saveTimeout.current);

    if (skipDebounce) {
      performSave();
    } else {
      saveTimeout.current = setTimeout(performSave, 500);
    }
  }, [historyIndex]);

  // --- Helper to close menu ---
  const closeContextMenu = useCallback(() => {
    setContextMenuPosition(null);
  }, []);

  // --- REFRESH REF PATTERN ---
  // This ensures our event listeners always see the latest 'saveState' function
  // without needing to unbind/rebind listeners on every render.
  const saveStateRef = useRef(saveState);
  useEffect(() => {
    saveStateRef.current = saveState;
  }, [saveState]);


  // 1. Initialize Canvas
  useEffect(() => {
    const canvas = initFabricCanvas(canvasRef);
    fabricCanvasRef.current = canvas;

    // Wrapper that calls the FRESH saveState from the Ref
    const handleCanvasChange = () => {
        if (isHistoryLocked.current) return;
        saveStateRef.current(false); 
    };

   // --- Handle Mouse Down (Context Menu Logic) ---
    canvas.on('mouse:down', (opt: any) => {
      // Right Click (Button 3)
      if (opt.button === 3) {
        if (opt.target) {
          // Select the object
          canvas.setActiveObject(opt.target);
          canvas.renderAll();
          setActiveObject(opt.target);
          
          // Show Menu at mouse position
          // We use pointer.x/y relative to page for the fixed/absolute menu
          setContextMenuPosition({ 
            x: opt.e.clientX, 
            y: opt.e.clientY 
          });
        }
      } else {
        // Left Click (Button 1) - Hide Menu
        setContextMenuPosition(null);
      }
    });

    canvas.on("object:modified", handleCanvasChange);
    canvas.on("object:added", (e: any) => {
        if (e.target && e.target.id === "main-image") return;
        handleCanvasChange();
    });
    canvas.on("object:removed", handleCanvasChange);
    canvas.on("path:created", handleCanvasChange);

    // Keep track of active object for general UI
    const updateActive = (e: any) => setActiveObject(e.selected ? e.selected[0] : null);
    canvas.on("selection:created", updateActive);
    canvas.on("selection:updated", updateActive);
    canvas.on("selection:cleared", () => {
        setActiveObject(null);
        setContextMenuPosition(null); // Close menu if deselected
    });

    // --- Selection Listeners (Left Click) ---
    const handleSelectionCreated = (e: any) => setActiveObject(e.selected ? e.selected[0] : null);
    const handleSelectionUpdated = (e: any) => setActiveObject(e.selected ? e.selected[0] : null);
    const handleSelectionCleared = () => setActiveObject(null); // Hides toolbar on deselect

    canvas.on("selection:created", handleSelectionCreated);
    canvas.on("selection:updated", handleSelectionUpdated);
    canvas.on("selection:cleared", handleSelectionCleared);

    return () => {
      canvas.off("object:modified", handleCanvasChange);
      canvas.off("object:added", handleCanvasChange);
      canvas.off("object:removed", handleCanvasChange);
      canvas.off("path:created", handleCanvasChange);
      canvas.off("mouse:down"); // Clean up right-click listener
      
      canvas.off("selection:created", handleSelectionCreated);
      canvas.off("selection:updated", handleSelectionUpdated);
      canvas.off("selection:cleared", handleSelectionCleared);
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
      setImageDimensions,
      () => { if (historyIndex === -1) { isHistoryLocked.current = false; saveState(true); } }
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageUrl]);

  // Tool Selectability
  useEffect(() => {
      const image = imageRef.current;
      if(image) {
        image.set({ selectable: activeTool === "cursor", evented: activeTool === "cursor" });
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
            saveState(true);
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
    isHistoryLocked.current = true;
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    const prevIndex = historyIndex - 1;
    const prevState = history[prevIndex];
    let json;
    try { json = JSON.parse(prevState); } catch (e) { isHistoryLocked.current = false; return; }
    canvas.loadFromJSON(json, () => {
      canvas.renderAll();
      const objects = canvas.getObjects();
      const mainImg = objects.find((obj: any) => obj.id === "main-image");
      if (mainImg) imageRef.current = mainImg;
      setHistoryIndex(prevIndex);
      setTimeout(() => { isHistoryLocked.current = false; }, 100);
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
    let json;
    try { json = JSON.parse(nextState); } catch (e) { isHistoryLocked.current = false; return; }
    canvas.loadFromJSON(json, () => {
      canvas.renderAll();
      const objects = canvas.getObjects();
      const mainImg = objects.find((obj: any) => obj.id === "main-image");
      if (mainImg) imageRef.current = mainImg;
      setHistoryIndex(nextIndex);
      setTimeout(() => { isHistoryLocked.current = false; }, 100);
    });
  }, [history, historyIndex]);

  const bringForward = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    const activeObj = canvas?.getActiveObject();
    if (canvas && activeObj) {
      activeObj.bringForward();
      canvas.renderAll();
      saveState(true);
      closeContextMenu();
    }
  }, [saveState, closeContextMenu]);

  const sendBackward = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    const activeObj = canvas?.getActiveObject();
    if (canvas && activeObj) {
      activeObj.sendBackwards();
      canvas.renderAll();
      saveState(true);
      closeContextMenu();
    }
  }, [saveState, closeContextMenu]);

  const bringToFront = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    const activeObj = canvas?.getActiveObject();
    if (canvas && activeObj) {
      activeObj.bringToFront();
      canvas.renderAll();
      saveState(true);
      closeContextMenu();
    }
  }, [saveState, closeContextMenu]);

  const sendToBack = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    const activeObj = canvas?.getActiveObject();
    if (canvas && activeObj) {
      activeObj.sendToBack();
      canvas.renderAll();
      saveState(true);
      closeContextMenu();
    }
  }, [saveState, closeContextMenu]);

  const duplicateObject = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    const activeObj = canvas?.getActiveObject();
    if (canvas && activeObj) {
      activeObj.clone((cloned: any) => {
        canvas.discardActiveObject();
        cloned.set({
          left: cloned.left + 20,
          top: cloned.top + 20,
          evented: true,
        });
        if (cloned.type === 'activeSelection') {
          // active selection needs a reference to the canvas.
          cloned.canvas = canvas;
          cloned.forEachObject((obj: any) => {
            canvas.add(obj);
          });
          cloned.setCoords();
        } else {
          canvas.add(cloned);
        }
        canvas.setActiveObject(cloned);
        canvas.requestRenderAll();
        saveState(true);
        closeContextMenu();
      });
    }
  }, [saveState, closeContextMenu]);

  // --- NEW: Delete Function (Wrapper) ---
  const deleteObject = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    const activeObj = canvas?.getActiveObject();
    if (canvas && activeObj) {
        const activeObjects = canvas.getActiveObjects();
        if (activeObjects.length) {
            activeObjects.forEach((obj: any) => canvas.remove(obj));
            canvas.discardActiveObject();
            canvas.renderAll();
            saveState(true);
            closeContextMenu();
        }
    }
  }, [saveState, closeContextMenu]);

  // 6. Apply Filters
  useEffect(() => {
    if (isHistoryLocked.current) return;

    const canvas = fabricCanvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image || !window.fabric || !window.fabric.Image.filters) return;

    const newFilters: any[] = [];

    // Adjustments
    if (brightness !== 0) newFilters.push(new window.fabric.Image.filters.Brightness({ brightness }));
    if (contrast !== 0) newFilters.push(new window.fabric.Image.filters.Contrast({ contrast }));
    const gammaValue = 1.0 + highlight;
    if (highlight > 0) newFilters.push(new window.fabric.Image.filters.Gamma({ gamma: [gammaValue, gammaValue, gammaValue] }));
    if (sharpen > 0) {
      const s = sharpen * 1.5;
      newFilters.push(new window.fabric.Image.filters.Convolute({ matrix: [ 0, -s, 0, -s, 1 + 4*s, -s, 0, -s, 0 ] }));
    }
    if (adjustBlur > 0) newFilters.push(new window.fabric.Image.filters.Blur({ blur: adjustBlur }));

    // Effects
    if (isBlurEnabled) {
      const blurIntensity = effectBlurValue / 100;
      switch (blurType) {
        case "gaussian": newFilters.push(new window.fabric.Image.filters.Blur({ blur: blurIntensity })); break;
        case "pixelate": 
        case "square": 
            const blockSize = Math.max(2, Math.round((effectBlurValue / 100) * 20));
            newFilters.push(new window.fabric.Image.filters.Pixelate({ blocksize: blockSize })); break;
        case "motion":
            let matrixSize = 3; if (effectBlurValue > 33) matrixSize = 5; if (effectBlurValue > 66) matrixSize = 7;
            const val = 1 / matrixSize;
            const motionMatrix = new Array(matrixSize * matrixSize).fill(0);
            for(let i=0; i<matrixSize; i++) motionMatrix[Math.floor(matrixSize/2) * matrixSize + i] = val; 
            newFilters.push(new window.fabric.Image.filters.Convolute({ matrix: motionMatrix }));
            break;
      }
    }

    if (isFilterEnabled) {
      switch (filterType) {
        case "noir": newFilters.push(new window.fabric.Image.filters.Grayscale()); newFilters.push(new window.fabric.Image.filters.Contrast({ contrast: 0.2 })); break;
        case "sepia": newFilters.push(new window.fabric.Image.filters.Sepia()); break;
        case "mono": newFilters.push(new window.fabric.Image.filters.Grayscale()); break;
        case "fade": newFilters.push(new window.fabric.Image.filters.Saturation({ saturation: -0.3 })); newFilters.push(new window.fabric.Image.filters.Brightness({ brightness: 0.1 })); break;
        case "process": newFilters.push(new window.fabric.Image.filters.ColorMatrix({ matrix: [ 1.0, 0.2, 0.0, 0, 0.05, 0.0, 1.0, 0.0, 0, 0.05, 0.2, 0.0, 1.0, 0, 0.05, 0, 0, 0, 1, 0] })); break;
        case "tonal": newFilters.push(new window.fabric.Image.filters.ColorMatrix({ matrix: [ 0.7, 0, 0, 0, 0.1, 0, 1.0, 0, 0, 0, 0, 0, 1.3, 0, 0.1, 0, 0, 0, 1, 0] })); break;
      }
    }

    // Properties
    image.set('opacity', opacity);
    if (shadow > 0) {
      image.set('shadow', new window.fabric.Shadow({ color: 'rgba(0,0,0,0.7)', blur: shadow * 20, offsetX: shadow * 5, offsetY: shadow * 5 }));
    } else {
      image.set('shadow', null);
    }

    image.filters = newFilters;
    image.applyFilters();
    canvas.renderAll();
    
    saveState(); // Debounced save for filters

  }, [
    isBlurEnabled, blurType, effectBlurValue, isFilterEnabled, filterType,
    brightness, contrast, highlight, sharpen, shadow, opacity, adjustBlur,
    saveState
  ]);

  // Actions (Wrapped to save history)
  const setBackgroundColor = useCallback((color: string) => {
    setCanvasColor(fabricCanvasRef.current, color);
    saveState(true);
  }, [saveState]);

  const handleBackgroundImageUpload = useCallback((file: File) => {
    uploadCanvasBgImage(fabricCanvasRef.current, file, () => saveState(true));
  }, [saveState]);

  const clearBackgroundImage = useCallback(() => {
    clearCanvasBgImage(fabricCanvasRef.current);
    saveState(true);
  }, [saveState]);

  const setBackgroundImageFromUrl = useCallback((imageUrl: string) => {
    setCanvasBgImageFromUrl(fabricCanvasRef.current, imageUrl, () => saveState(true));
  }, [saveState]);

  const handleDownloadImage = useCallback(() => { exportCanvasImage(fabricCanvasRef.current); }, []);
  
  const handleRemoveObject = useCallback(async () => { 
      await removeObjectApiCall(fabricCanvasRef.current, imageRef.current, onComplete); 
  }, [onComplete]);

  const clearDrawings = useCallback(() => { 
      clearCanvasDrawings(fabricCanvasRef.current);
      saveState(true);
  }, [saveState]);

  const addStyledText = useCallback((text: string, style: any) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !window.fabric) return;
    let shadowObj = null;
    if (style.shadow) shadowObj = new window.fabric.Shadow(style.shadow);
    const textObj = new window.fabric.IText(text, {
      left: canvas.getWidth() / 2, top: canvas.getHeight() / 2, originX: 'center', originY: 'center',
      ...style, shadow: shadowObj,
    });
    canvas.add(textObj);
    canvas.setActiveObject(textObj);
    canvas.renderAll();
    // object:added listener triggers save
  }, []);

  const setOverlay = useCallback((imageUrl: string) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !window.fabric) return;
    window.fabric.Image.fromURL(imageUrl, (img: any) => {
       img.scaleToWidth(canvas.getWidth());
       img.scaleToHeight(canvas.getHeight());
       canvas.setOverlayImage(img, () => {
         canvas.renderAll();
         saveState(true);
       }, { originX: 'left', originY: 'top', crossOrigin: 'anonymous' });
    }, { crossOrigin: 'anonymous' });
  }, [saveState]);

  const removeOverlay = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !window.fabric) return;
    canvas.setOverlayImage(null, () => {
      canvas.renderAll();
      saveState(true);
    });
  }, [saveState]);

  return {
    canvasRef, imageDimensions, handleRemoveObject, handleDownloadImage, clearDrawings,
    handleBackgroundImageUpload, clearBackgroundImage, setBackgroundImageFromUrl, setBackgroundColor,
    addStyledText, setOverlay, removeOverlay,
    undo, redo, canUndo: historyIndex > 0, canRedo: historyIndex < history.length - 1,
    activeObject,
    contextMenuPosition,
    closeContextMenu,
    bringForward,
    sendBackward,
    bringToFront,
    sendToBack,
    duplicateObject,
    deleteObject,
  };
};