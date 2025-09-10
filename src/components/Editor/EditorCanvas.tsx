"use client";

import React, { FC, RefObject, useState, useEffect } from "react";
import { Tool } from "../../types/editor";

const checkerboardPattern = `data:image/svg+xml,%3Csvg xmlns='http://www.w.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Crect width='16' height='16' fill='%232d3748'/%3E%3Crect width='8' height='8' fill='%234a5568'/%3E%3Crect x='8' y='8' width='8' height='8' fill='%234a5568'/%3E%3C/svg%3E`;

const EditorCanvas: FC<{
  canvasRef: RefObject<HTMLCanvasElement>;
  imageDimensions: { width: number; height: number };
  activeTool: Tool;
  brushSize: number;
}> = ({ canvasRef, imageDimensions, activeTool, brushSize }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMouseOverCanvas, setIsMouseOverCanvas] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: Event) => {
      const mouseEvent = e as MouseEvent;
      const canvasContainer = document.querySelector('.canvas-container') as HTMLElement;
      if (canvasContainer) {
        const rect = canvasContainer.getBoundingClientRect();
        const x = mouseEvent.clientX - rect.left;
        const y = mouseEvent.clientY - rect.top;
        setMousePosition({ x, y });
      }
    };

    const handleMouseEnter = () => setIsMouseOverCanvas(true);
    const handleMouseLeave = () => setIsMouseOverCanvas(false);

    const canvasContainer = document.querySelector('.canvas-container');
    if (canvasContainer) {
      canvasContainer.addEventListener('mousemove', handleMouseMove);
      canvasContainer.addEventListener('mouseenter', handleMouseEnter);
      canvasContainer.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (canvasContainer) {
        canvasContainer.removeEventListener('mousemove', handleMouseMove);
        canvasContainer.removeEventListener('mouseenter', handleMouseEnter);
        canvasContainer.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);

  return (
  <div className="flex-1 p-6 flex items-center justify-center bg-slate-900">
    <div className="relative flex items-center justify-center w-full h-full">
      {/* Checkerboard background */}
      <div
        className="absolute overflow-hidden border border-slate-600"
        style={{
          width: `${imageDimensions.width}px`,
          height: `${imageDimensions.height}px`,
          backgroundImage: `url("${checkerboardPattern}")`,
          backgroundRepeat: "repeat",
          // transform: "scale(1.3)", // <-- This line was removed
        }}
      ></div>
      {/* Canvas container */}
      <div
        className="canvas-container"
        style={{
          width: `${imageDimensions.width}px`,
          height: `${imageDimensions.height}px`,
          position: "absolute",
          zIndex: 1,
          // transform: "scale(1.3)", // <-- This line was removed
        }}
      >
        <canvas ref={canvasRef} />
        
        {/* Brush size cursor circle */}
        {activeTool === "brush" && isMouseOverCanvas && brushSize > 0 && (
          <div
            className="absolute pointer-events-none border-2 border-white/80 rounded-full transition-all duration-100 ease-out"
            style={{
              left: `${mousePosition.x - brushSize / 2}px`,
              top: `${mousePosition.y - brushSize / 2}px`,
              width: `${brushSize}px`,
              height: `${brushSize}px`,
              zIndex: 10,
              boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.3)',
            }}
          />
        )}
      </div>
    </div>
  </div>
  );
};

export default EditorCanvas;