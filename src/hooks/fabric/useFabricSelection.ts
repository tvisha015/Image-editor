// Handles clicking, right-clicking, and active object state.
// src/hooks/fabric/useFabricState.ts

"use client";

import { useState, useEffect, useCallback } from "react";

export const useFabricSelection = (canvas: any) => {
  const [activeObject, setActiveObject] = useState<any | null>(null);
  const [contextMenuPosition, setContextMenuPosition] = useState<{ x: number; y: number } | null>(null);

  const closeContextMenu = useCallback(() => {
    setContextMenuPosition(null);
  }, []);

  useEffect(() => {
    if (!canvas) return;

    // Right Click Listener
    const handleMouseDown = (opt: any) => {
      if (opt.button === 3) { // 3 is Right Click
        if (opt.target) {
          canvas.setActiveObject(opt.target);
          canvas.renderAll();
          setActiveObject(opt.target);
          // Set menu position based on pointer
          setContextMenuPosition({ x: opt.e.clientX, y: opt.e.clientY });
        }
      } else {
        // Left click closes menu
        setContextMenuPosition(null);
      }
    };

    // Standard Selection Listeners
    const updateActive = (e: any) => setActiveObject(e.selected ? e.selected[0] : null);
    const clearActive = () => {
        setActiveObject(null);
        setContextMenuPosition(null);
    };

    canvas.on('mouse:down', handleMouseDown);
    canvas.on("selection:created", updateActive);
    canvas.on("selection:updated", updateActive);
    canvas.on("selection:cleared", clearActive);

    return () => {
      canvas.off('mouse:down', handleMouseDown);
      canvas.off("selection:created", updateActive);
      canvas.off("selection:updated", updateActive);
      canvas.off("selection:cleared", clearActive);
    };
  }, [canvas]);

  return { activeObject, contextMenuPosition, closeContextMenu };
};