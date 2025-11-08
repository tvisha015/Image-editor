"use client";

import React, { FC, RefObject, useState, useEffect, useRef, useCallback } from "react";
import { Tool } from "../../types/editor";

const checkerboardPattern = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Crect width='16' height='16' fill='%23ffffff'/%3E%3Crect width='8' height='8' fill='%23e2e8f0'/%3E%3Crect x='8' y='8' width='8' height='8' fill='%23e2e8f0'/%3E%3C/svg%3E`;

// --- UPDATED Preview Slider Component ---
interface PreviewSliderProps {
  originalImageUrl: string;
  width: number;
  height: number;
}

const PreviewSlider: FC<PreviewSliderProps> = ({
  originalImageUrl,
  width,
  height,
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;

    // Only move if dragging is active
    if (isDragging.current) {
      const rect = containerRef.current.getBoundingClientRect();
      let x = clientX - rect.left;
      let percentage = (x / rect.width) * 100;

      if (percentage < 0) percentage = 0;
      if (percentage > 100) percentage = 100;

      setSliderPosition(percentage);
    }
  }, []);

  const handleInteractionStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    isDragging.current = true;
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;

    // This logic allows clicking anywhere to move the slider
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      let x = clientX - rect.left;
      let percentage = (x / rect.width) * 100;
      if (percentage < 0) percentage = 0;
      if (percentage > 100) percentage = 100;
      setSliderPosition(percentage);
    }
  }, []);

  const handleInteractionEnd = useCallback(() => {
    isDragging.current = false;
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX);
    const handleTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("mouseup", handleInteractionEnd);
    window.addEventListener("touchend", handleInteractionEnd);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("mouseup", handleInteractionEnd);
      window.removeEventListener("touchend", handleInteractionEnd);
    };
  }, [handleMove, handleInteractionEnd]);

  return (
    <div
      ref={containerRef}
      onMouseDown={handleInteractionStart}
      onTouchStart={handleInteractionStart}
      style={{
        position: "absolute",
        width: `${width}px`,
        height: `${height}px`,
        zIndex: 10,
        userSelect: "none",
        overflow: "hidden",
        cursor: "pointer",
        borderRadius: "8px", // Match canvas
      }}
    >
      {/* Original "Before" Image (Left side) */}
      <img
        src={originalImageUrl}
        alt="Original"
        draggable="false"
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          objectFit: "contain",
          clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`, // Show left part
          zIndex: 1,
        }}
      />

      {/* Slider Line and Handle */}
      <div
        className="slider-line"
        style={{
          position: "absolute",
          top: 0,
          left: `${sliderPosition}%`,
          width: "2px",
          height: "100%",
          backgroundColor: "#fff",
          boxShadow: "0 0 8px rgba(0, 0, 0, 0.4)",
          transform: "translateX(-50%)",
          zIndex: 3,
          pointerEvents: "none",
        }}
      >
        <div
          className="slider-handle"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            backgroundColor: "#fff",
            boxShadow: "0 0 12px rgba(0, 0, 0, 0.6)",
            cursor: "ew-resize",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "auto",
            border: "2px solid rgba(0,0,0,0.1)",
          }}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10 8L6 12L10 16"
              stroke="#333"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M14 8L18 12L14 16"
              stroke="#333"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <line
              x1="12"
              y1="6"
              x2="12"
              y2="18"
              stroke="#333"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

// --- Main EditorCanvas Component ---
const EditorCanvas: FC<{
  canvasRef: RefObject<HTMLCanvasElement>;
  imageDimensions: { width: number; height: number };
  activeTool: Tool;
  brushSize: number;
  isPreviewing: boolean;
  originalImageUrl: string;
}> = ({
  canvasRef,
  imageDimensions,
  activeTool,
  brushSize,
  isPreviewing,
  originalImageUrl,
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMouseOverCanvas, setIsMouseOverCanvas] = useState(false);

  useEffect(() => {
    if (isPreviewing) {
      setIsMouseOverCanvas(false);
      return;
    }
    const canvasContainer = document.querySelector(".canvas-container");
    const handleMouseMove = (e: MouseEvent) => {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };
    const handleMouseEnter = () => setIsMouseOverCanvas(true);
    const handleMouseLeave = () => setIsMouseOverCanvas(false);
    canvasContainer?.addEventListener("mousemove", handleMouseMove as EventListener);
    canvasContainer?.addEventListener("mouseenter", handleMouseEnter);
    canvasContainer?.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      canvasContainer?.removeEventListener("mousemove", handleMouseMove as EventListener);
      canvasContainer?.removeEventListener("mouseenter", handleMouseEnter);
      canvasContainer?.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [isPreviewing]);

  return (
    // Updated background to bg-gray-100 (from Figma)
    <div className="flex-1 p-6 flex items-center justify-center bg-gray-100 overflow-auto">
      <div className="relative flex items-center justify-center w-full h-full">
        {/* The underlying Fabric.js canvas and its background */}
        <div
          className="canvas-container"
          style={{
            width: `${imageDimensions.width}px`,
            height: `${imageDimensions.height}px`,
            position: "absolute",
            zIndex: 1,
            cursor: activeTool === "brush" ? "none" : "default",
            pointerEvents: isPreviewing ? "none" : "auto",
            // Add a subtle border/shadow to define the canvas area
            boxShadow: "0 0 10px rgba(0,0,0,0.1)",
          }}
        >
          <div
            className="absolute top-0 left-0"
            style={{
              width: `${imageDimensions.width}px`,
              height: `${imageDimensions.height}px`,
              backgroundImage: `url("${checkerboardPattern}")`,
              backgroundRepeat: "repeat",
              borderRadius: "8px", // Rounded corners for the canvas
            }}
          ></div>
          {/* Apply rounded corners to the canvas element itself */}
          <canvas ref={canvasRef} style={{ borderRadius: "8px" }} />
          
          {activeTool === "brush" &&
            isMouseOverCanvas &&
            brushSize > 0 && (
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

        {/* The Preview Slider Overlay */}
        {isPreviewing && imageDimensions.width > 0 && originalImageUrl && (
          <PreviewSlider
            originalImageUrl={originalImageUrl}
            width={imageDimensions.width}
            height={imageDimensions.height}
          />
        )}
      </div>
    </div>
  );
};

export default EditorCanvas;