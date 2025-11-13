// Handles Undo, Redo, and Saving state.
// src/hooks/fabric/useFabricHistory.ts

"use client";

import { useState, useRef, useCallback } from "react";

export const useFabricHistory = (
  canvas: any, // Accepts the canvas instance directly
  imageRef: any
) => {
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const isHistoryLocked = useRef(false);
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);

  // --- SAVE STATE ---
  const saveState = useCallback((skipDebounce = false) => {
    if (isHistoryLocked.current || !canvas) return;

    const performSave = () => {
      if (isHistoryLocked.current) return;
      try {
        const json = JSON.stringify(canvas.toJSON(['selectable', 'evented', 'id', 'lockMovementX', 'lockMovementY']));
        setHistory((prev) => {
          // Duplicate check
          if (historyIndex >= 0 && prev[historyIndex] === json) return prev;
          
          const newHistory = prev.slice(0, historyIndex + 1);
          newHistory.push(json);
          setHistoryIndex(newHistory.length - 1);
          return newHistory;
        });
      } catch (e) { console.error("Failed to save state", e); }
    };

    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    if (skipDebounce) performSave();
    else saveTimeout.current = setTimeout(performSave, 500);
  }, [canvas, historyIndex]);

  // --- UNDO ---
  const undo = useCallback(() => {
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
  }, [canvas, history, historyIndex, imageRef]);

  // --- REDO ---
  const redo = useCallback(() => {
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
  }, [canvas, history, historyIndex, imageRef]);

  return {
    saveState,
    undo,
    redo,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
    isHistoryLocked,
    historyIndex,
  };
};