"use client";

import React, {
  FC,
  RefObject,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { Tool } from "@/types/editor";

const checkerboardPattern = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Crect width='16' height='16' fill='%23ffffff'/%3E%3Crect width='8' height='8' fill='%23e2e8f0'/%3E%3Crect x='8' y='8' width='8' height='8' fill='%23e2e8f0'/%3E%3C/svg%3E`;

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
    if (isDragging.current) {
      const rect = containerRef.current.getBoundingClientRect();
      let x = clientX - rect.left;
      let percentage = (x / rect.width) * 100;
      if (percentage < 0) percentage = 0;
      if (percentage > 100) percentage = 100;
      setSliderPosition(percentage);
    }
  }, []);

  const handleInteractionStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      isDragging.current = true;
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        let x = clientX - rect.left;
        let percentage = (x / rect.width) * 100;
        if (percentage < 0) percentage = 0;
        if (percentage > 100) percentage = 100;
        setSliderPosition(percentage);
      }
    },
    []
  );

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
        borderRadius: "8px",
      }}
    >
      <img
        src={originalImageUrl}
        alt="Original"
        draggable="false"
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          objectFit: "contain",
          clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
          zIndex: 1,
        }}
      />
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

  // --- Refs and State for Zoom-to-Fit ---
  const containerRef = useRef<HTMLDivElement>(null); // Ref for the grey area
  const [scale, setScale] = useState(1);

  // --- Zoom-to-Fit Logic ---
  useEffect(() => {
    const calculateScale = () => {
      if (
        !containerRef.current ||
        !imageDimensions.width ||
        !imageDimensions.height
      ) {
        return;
      }

      const container = containerRef.current;
      const availableWidth = container.clientWidth;
      const availableHeight = container.clientHeight;

      const padding = 80; // 40px padding on each side
      const maxWidth = availableWidth - padding;
      const maxHeight = availableHeight - padding;

      const scaleX = maxWidth / imageDimensions.width;
      const scaleY = maxHeight / imageDimensions.height;

      // Use the smaller scale factor to fit both dimensions
      // Clamp at 1 so we don't enlarge small images
      const newScale = Math.min(scaleX, scaleY, 1);

      setScale(newScale);
    };

    // Calculate on mount and when image dimensions change
    calculateScale();

    // Recalculate when the window (or container) resizes
    const observer = new ResizeObserver(calculateScale);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, [imageDimensions]);

  // --- UPDATED: Mouse Tracking for Brush Cursor ---
  useEffect(() => {
    if (isPreviewing) {
      setIsMouseOverCanvas(false);
      return;
    }

    const canvasContainer = document.querySelector(
      ".canvas-container-outer-wrapper"
    );
    if (!canvasContainer) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      // Store position relative to the scaled container
      setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    const handleMouseEnter = () => setIsMouseOverCanvas(true);
    const handleMouseLeave = () => setIsMouseOverCanvas(false);

    canvasContainer.addEventListener(
      "mousemove",
      handleMouseMove as EventListener
    );
    canvasContainer.addEventListener("mouseenter", handleMouseEnter);
    canvasContainer.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      canvasContainer.removeEventListener(
        "mousemove",
        handleMouseMove as EventListener
      );
      canvasContainer.removeEventListener("mouseenter", handleMouseEnter);
      canvasContainer.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [isPreviewing, scale]); // Re-run if scale changes

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    return false;
  };

  // Calculate scaled dimensions
  const scaledWidth = imageDimensions.width * scale;
  const scaledHeight = imageDimensions.height * scale;

  return (
    // 1. The Grey Container (measures available space)
    <div
      ref={containerRef}
      className="flex-1 p-6 flex items-center justify-center bg-gray-100 overflow-hidden"
      onContextMenu={handleContextMenu}
    >
      {/* 2. The Scaled Layout Box (this holds the place in the layout) */}
      <div
        className="relative shadow-2xl canvas-container-outer-wrapper"
        style={{
          width: scaledWidth,
          height: scaledHeight,
        }}
      >
        {/* 3. The Full-Resolution Canvas (scaled down with transform) */}
        <div
          className="canvas-container-inner-wrapper"
          style={{
            width: imageDimensions.width,
            height: imageDimensions.height,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            position: "absolute",
            top: 0,
            left: 0,
          }}
        >
          {/* Fabric canvas and checkerboard */}
          <div
            className="canvas-container" // This class is used by Fabric
            style={{
              width: "100%",
              height: "100%",
              position: "absolute",
              zIndex: 1,
              cursor: activeTool === "brush" ? "none" : "default",
              pointerEvents: isPreviewing ? "none" : "auto",
            }}
          >
            <div
              className="absolute top-0 left-0"
              style={{
                width: "100%",
                height: "100%",
                backgroundImage: `url("${checkerboardPattern}")`,
                backgroundRepeat: "repeat",
                borderRadius: "8px",
              }}
            ></div>
            <canvas ref={canvasRef} style={{ borderRadius: "8px" }} />
          </div>

          {/* Preview Slider (also scaled down) */}
          {isPreviewing && imageDimensions.width > 0 && originalImageUrl && (
            <PreviewSlider
              originalImageUrl={originalImageUrl}
              width={imageDimensions.width}
              height={imageDimensions.height}
            />
          )}
        </div>

        {/* 4. Brush Cursor (lives in the scaled layout box) */}
        {activeTool === "brush" &&
          isMouseOverCanvas &&
          !isPreviewing &&
          brushSize > 0 && (
            <div
              className="absolute pointer-events-none border-2 border-slate-900/80 rounded-full"
              style={{
                // mousePosition is relative to the scaled box, so this is correct
                left: `${mousePosition.x - (brushSize * scale) / 2}px`,
                top: `${mousePosition.y - (brushSize * scale) / 2}px`,
                // Scale the brush size itself
                width: `${brushSize * scale}px`,
                height: `${brushSize * scale}px`,
                zIndex: 20, // Ensure it's on top
              }}
            />
          )}
      </div>
    </div>
  );
};

export default EditorCanvas;
