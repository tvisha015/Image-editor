"use client";

import { useState, useEffect, useCallback } from "react";

// FIX: Accept 'canvas' directly, not 'fabricCanvasRef'
export const useFabricSelection = (canvas: any) => {
  const [activeObject, setActiveObject] = useState<any | null>(null);
  const [contextMenuPosition, setContextMenuPosition] = useState<{ x: number; y: number } | null>(null);

  const closeContextMenu = useCallback(() => {
    setContextMenuPosition(null);
  }, []);

  useEffect(() => {
    // FIX: Check canvas directly
    if (!canvas) return;

    // --- 1. Handle Mouse Clicks (Control Menu Visibility) ---
    const handleMouseDown = (opt: any) => {
      // Button 3 is Right Click
      if (opt.button === 3) {
        // Prevent the browser's default context menu immediately
        if(opt.e) {
            opt.e.preventDefault();
            opt.e.stopPropagation();
        }

        if (opt.target) {
          // A. Select the object programmatically
          canvas.setActiveObject(opt.target);
          canvas.renderAll();
          
          // B. Update React State
          setActiveObject(opt.target);
          
          // C. Open Custom Menu at mouse coordinates
          setContextMenuPosition({ 
            x: opt.e.clientX, 
            y: opt.e.clientY 
          });
        } 
      } else {
        // Button 1 (Left Click) anywhere -> Close Menu
        setContextMenuPosition(null);
      }
    };

    // --- 2. Handle Selection Events (Control Active Object State) ---
    const updateActive = (e: any) => {
        setActiveObject(e.selected ? e.selected[0] : null);
    };

    const clearActive = () => {
        setActiveObject(null);
    };

    // Attach Listeners
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
  }, [canvas]); // Dependency is simply [canvas]

  return { activeObject, contextMenuPosition, closeContextMenu };
};