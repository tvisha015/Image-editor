// src/lib/fabric/interactionEffects.ts
"use client";

import { useEffect, RefObject } from "react";
import { Tool } from "@/types/editor";

// Custom hook to manage zoom interactions
export const useFabricZoom = (
  fabricCanvasRef: RefObject<any>,
  activeTool: Tool,
  isBgPanelOpen: boolean // This prop is no longer used but kept for signature
) => {
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const maxZoom = 3;

    const handleMouseWheel = (opt: any) => {
      if ((activeTool === "brush" || activeTool === "cursor") && !opt.e.ctrlKey) {
        return;
      }
      
      opt.e.preventDefault();
      opt.e.stopPropagation();

      const delta = opt.e.deltaY;
      let zoom = canvas.getZoom();
      zoom *= 0.999 ** delta;
      if (zoom > maxZoom) zoom = maxZoom;
      if (zoom < 1) zoom = 1;

      canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
    };

    if (activeTool === "brush" || activeTool === "cursor") {
      canvas.on("mouse:wheel", handleMouseWheel);
    }

    return () => {
      canvas.off("mouse:wheel", handleMouseWheel);
    };
  }, [fabricCanvasRef, activeTool]);
};