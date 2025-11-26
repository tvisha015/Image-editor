// Handles Layers, Duplicate, Delete, and Design tools. 
// src/hooks/fabric/useFabricAction.ts

"use client";

import { useCallback, MutableRefObject } from "react";

export const useFabricActions = (
  fabricCanvasRef: MutableRefObject<any>,
  saveState: (skipDebounce?: boolean) => void,
  closeContextMenu: () => void
) => {

  // --- Layering ---
  const bringForward = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    const activeObj = canvas?.getActiveObject();
    if (canvas && activeObj) {
      activeObj.bringForward();
      canvas.renderAll();
      saveState(true);
      closeContextMenu();
    }
  }, [saveState, closeContextMenu, fabricCanvasRef]);

  const sendBackward = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    const activeObj = canvas?.getActiveObject();
    if (canvas && activeObj) {
      activeObj.sendBackwards();
      canvas.renderAll();
      saveState(true);
      closeContextMenu();
    }
  }, [saveState, closeContextMenu, fabricCanvasRef]);

  const bringToFront = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    const activeObj = canvas?.getActiveObject();
    if (canvas && activeObj) {
      activeObj.bringToFront();
      canvas.renderAll();
      saveState(true);
      closeContextMenu();
    }
  }, [saveState, closeContextMenu, fabricCanvasRef]);

  const sendToBack = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    const activeObj = canvas?.getActiveObject();
    if (canvas && activeObj) {
      activeObj.sendToBack();
      canvas.renderAll();
      saveState(true);
      closeContextMenu();
    }
  }, [saveState, closeContextMenu, fabricCanvasRef]);

  // --- Object Actions ---
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
  }, [saveState, closeContextMenu, fabricCanvasRef]);

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
  }, [saveState, closeContextMenu, fabricCanvasRef]);

  // --- Design Actions ---
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
    // saveState handled by object:added event in main hook
  }, [fabricCanvasRef]);

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
  }, [saveState, fabricCanvasRef]);

  const removeOverlay = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !window.fabric) return;

    // 1. Remove Overlay Image (Frames)
    canvas.setOverlayImage(null, () => {});

    // 2. Remove Background Image (Posters set via URL)
    canvas.setBackgroundImage(null, () => {});

    // 3. Reset Background Color
    canvas.setBackgroundColor('transparent', () => {});

    // 4. Remove Editable Template Objects
    // We look for objects we tagged with id="template-item"
    const objects = canvas.getObjects();
    const templateObjects = objects.filter((obj: any) => obj.id === 'template-item');
    
    templateObjects.forEach((obj: any) => {
        canvas.remove(obj);
    });

    canvas.renderAll();
    saveState(true);
  }, [saveState, fabricCanvasRef]);

  return {
    bringForward, sendBackward, bringToFront, sendToBack,
    duplicateObject, deleteObject,
    addStyledText, setOverlay, removeOverlay
  };
};