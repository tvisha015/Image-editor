// FILE: src/components/Editor/EditorCanvas.tsx
// --------------------------------------------
"use client";

import React, { FC, RefObject, useState, useEffect } from "react";
import { Tool } from "../../types/editor";

const checkerboardPattern = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Crect width='16' height='16' fill='%23ffffff'/%3E%3Crect width='8' height='8' fill='%23e2e8f0'/%3E%3Crect x='8' y='8' width='8' height='8' fill='%23e2e8f0'/%3E%3C/svg%3E`;

const EditorCanvas: FC<{
  canvasRef: RefObject<HTMLCanvasElement>;
  imageDimensions: { width: number; height: number };
  activeTool: Tool;
  brushSize: number;
}> = ({ canvasRef, imageDimensions, activeTool, brushSize }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMouseOverCanvas, setIsMouseOverCanvas] = useState(false);

  useEffect(() => {
    const canvasContainer = document.querySelector('.canvas-container');

    const handleMouseMove = (e: MouseEvent) => {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };
    const handleMouseEnter = () => setIsMouseOverCanvas(true);
    const handleMouseLeave = () => setIsMouseOverCanvas(false);
    
    canvasContainer?.addEventListener('mousemove', handleMouseMove as EventListener);
    canvasContainer?.addEventListener('mouseenter', handleMouseEnter);
    canvasContainer?.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      canvasContainer?.removeEventListener('mousemove', handleMouseMove as EventListener);
      canvasContainer?.removeEventListener('mouseenter', handleMouseEnter);
      canvasContainer?.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div className="flex-1 p-6 flex items-center justify-center bg-slate-200">
      <div className="relative flex items-center justify-center w-full h-full">
        <div
          className="absolute overflow-hidden border border-slate-300"
          style={{
            width: `${imageDimensions.width}px`,
            height: `${imageDimensions.height}px`,
            backgroundImage: `url("${checkerboardPattern}")`,
            backgroundRepeat: "repeat",
          }}
        ></div>
        <div
          className="canvas-container"
          style={{
            width: `${imageDimensions.width}px`,
            height: `${imageDimensions.height}px`,
            position: "absolute",
            zIndex: 1,
            // Hide default cursor when brush is active, show default otherwise
            cursor: activeTool === 'brush' ? 'none' : 'default',
          }}
        >
          <canvas ref={canvasRef} />
          
          {activeTool === "brush" && isMouseOverCanvas && brushSize > 0 && (
            <div
              className="absolute pointer-events-none border-2 border-slate-900/80 rounded-full"
              style={{
                left: `${mousePosition.x - brushSize / 2}px`,
                top: `${mousePosition.y - brushSize / 2}px`,
                width: `${brushSize}px`,
                height: `${brushSize}px`,
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default EditorCanvas;
