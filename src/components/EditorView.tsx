// components/EditorView.tsx
"use client";

import React, { useState, useRef, useEffect, FC } from "react";

// TypeScript declarations for global Fabric.js instance from CDN
declare global {
  interface Window {
    fabric: any; // Using 'any' here is a pragmatic way to avoid type conflicts with the global script
  }
}

// --- Helper component for tool buttons ---
type Tool = "pan" | "erase" | "restore";
const ToolButton: FC<{
  onClick: () => void;
  isActive: boolean;
  children: React.ReactNode;
  title: string;
}> = ({ onClick, isActive, children, title }) => (
  <button
    onClick={onClick}
    title={title}
    className={`p-3 rounded-xl transition-colors ${
      isActive
        ? "bg-purple-500/30 text-purple-400"
        : "hover:bg-slate-700 text-slate-400"
    }`}
  >
    {children}
  </button>
);

const EditorView: FC<{ imageUrl: string; onStartNew: () => void }> = ({
  imageUrl,
  onStartNew,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<any | null>(null);
  const imageRef = useRef<any | null>(null);
  const patternSourceRef = useRef<HTMLImageElement | null>(null);

  const [activeTool, setActiveTool] = useState<Tool>("erase");
  const [brushSize, setBrushSize] = useState(30);

  const checkerboardPattern = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Crect width='16' height='16' fill='%232d3748'/%3E%3Crect width='8' height='8' fill='%234a5568'/%3E%3Crect x='8' y='8' width='8' height='8' fill='%234a5568'/%3E%3C/svg%3E`;

  // Function to constrain object movement within boundaries
  const constrainObjectMovement = (
    obj: any,
    boundingBox: { width: number; height: number }
  ) => {
    // Get object's current dimensions including scale
    const objWidth = obj.getScaledWidth();
    const objHeight = obj.getScaledHeight();

    // Calculate boundaries
    const maxX = boundingBox.width / 2 - objWidth / 2;
    const maxY = boundingBox.height / 2 - objHeight / 2;
    const minX = -maxX;
    const minY = -maxY;

    // Constrain position
    if (obj.left < minX) obj.left = minX;
    if (obj.left > maxX) obj.left = maxX;
    if (obj.top < minY) obj.top = minY;
    if (obj.top > maxY) obj.top = maxY;
  };

  useEffect(() => {
    if (!imageUrl || !canvasRef.current || !window.fabric) {
      return;
    }

    const fabricInstance = window.fabric;
    const container = canvasRef.current.parentElement;

    // Initialize with temporary dimensions
    const canvas = new fabricInstance.Canvas(canvasRef.current, {
      width: container ? container.offsetWidth : 800,
      height: container ? container.offsetHeight : 600,
      backgroundColor: "transparent",
    });
    fabricCanvasRef.current = canvas;

    const imgElement = new Image();
    imgElement.crossOrigin = "anonymous";
    imgElement.src = imageUrl;
    imgElement.onload = () => {
      patternSourceRef.current = imgElement;

      // Store the original image dimensions
      const originalWidth = imgElement.width;
      const originalHeight = imgElement.height;

      fabricInstance.Image.fromURL(
        imageUrl,
        (img: any) => {
          const padding = 15; // Increased padding to make image smaller
          const scale =
            Math.min(
              (canvas.getWidth() - padding) / (img.width || 1),
              (canvas.getHeight() - padding) / (img.height || 1)
            ) * 1.5; // Reduced scale factor to make image smaller
          img.scale(scale);

          // Calculate the scaled dimensions for the checkerboard
          const scaledWidth = Math.round(originalWidth * scale);
          const scaledHeight = Math.round(originalHeight * scale);
          setImageDimensions({ width: scaledWidth, height: scaledHeight });

          // Update canvas dimensions to match the image dimensions
          canvas.setWidth(scaledWidth);
          canvas.setHeight(scaledHeight);
          canvas.calcOffset();

          // Set image properties to prevent scaling
          img.lockUniScaling = true; // Keep aspect ratio when scaling
          img.lockScalingX = true; // Prevent horizontal scaling
          img.lockScalingY = true; // Prevent vertical scaling
          img.setControlsVisibility({
            mt: false,
            mb: false,
            ml: false,
            mr: false,
            bl: false,
            br: false,
            tl: false,
            tr: false,
            mtr: true, // Only allow rotation
          });
          img.set({
            hoverCursor: "pointer",
          });
          // Add the image to canvas
          canvas.add(img);
          canvas.centerObject(img);
          imageRef.current = img;

          // Add event listener to constrain movement only (scaling disabled)
          img.on("moving", () => {
            constrainObjectMovement(img, {
              width: scaledWidth,
              height: scaledHeight,
            });
            canvas.renderAll();
          });

          canvas.renderAll();
        },
        { crossOrigin: "anonymous" }
      );
    };

    return () => {
      // Clean up event listeners and canvas when component unmounts
      if (fabricCanvasRef.current) {
        const img = imageRef.current;
        if (img) {
          img.off("moving");
          img.off("scaling");
        }
        fabricCanvasRef.current.dispose();
      }
    };
  }, [imageUrl]);

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    const image = imageRef.current; // Get the image object from our ref

    if (!canvas || !image) return; // Wait until both are ready

    if (activeTool === "pan") {
      canvas.isDrawingMode = false;
      image.selectable = true; // MAKE image selectable
      image.evented = true; // ALLOW image to receive mouse events
    } else {
      // For "erase" or "restore" tools
      canvas.isDrawingMode = true;
      image.selectable = false; // MAKE image NOT selectable
      image.evented = false; // PREVENT image from receiving mouse events

      // The rest of the brush setup logic remains the same
      if (activeTool === "erase") {
        const eraserBrush = new window.fabric.PencilBrush(canvas);
        eraserBrush.globalCompositeOperation = "destination-out";
        eraserBrush.width = brushSize;
        canvas.freeDrawingBrush = eraserBrush;
      } else if (activeTool === "restore" && patternSourceRef.current) {
        const restoreBrush = new window.fabric.PatternBrush(canvas);
        restoreBrush.width = brushSize;
        restoreBrush.source = patternSourceRef.current as CanvasImageSource;
        canvas.freeDrawingBrush = restoreBrush;
      }
    }
    // Rerender the canvas to apply the changes
    canvas.renderAll();
  }, [activeTool, brushSize]);

  const handleDownload = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const dataURL = canvas.toDataURL({
      format: "png",
      quality: 1.0,
      multiplier: 1,
    });

    const link = document.createElement("a");
    link.download = "edited-image.png";
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // State to track image dimensions for the checkerboard pattern
  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  });

  return (
    <div className="w-full max-w-screen-2xl h-[90vh] bg-slate-800 rounded-2xl shadow-2xl flex overflow-hidden border border-slate-700">
      <aside className="w-20 bg-slate-900/50 p-4 flex flex-col items-center space-y-4">
        <div className="w-12 h-12 bg-purple-600 rounded-xl text-white flex items-center justify-center font-bold text-2xl shrink-0">
          R
        </div>
        <ToolButton
          title="Pan Tool"
          onClick={() => setActiveTool("pan")}
          isActive={activeTool === "pan"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        </ToolButton>
        <ToolButton
          title="Erase Tool"
          onClick={() => setActiveTool("erase")}
          isActive={activeTool === "erase"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </ToolButton>
        <ToolButton
          title="Restore Tool"
          onClick={() => setActiveTool("restore")}
          isActive={activeTool === "restore"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9H0v5h4.582m15.356 2a8.001 8.001 0 01-15.356-2H24v-5h-4.582z"
            />
          </svg>
        </ToolButton>
      </aside>
      <main className="flex-1 flex flex-col">
        <header className="flex justify-between items-center p-4 border-b border-slate-700">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-white mr-4 hidden sm:block">
              Editor
            </h1>
            <div className="flex items-center gap-3 text-slate-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"
                />
              </svg>
              <input
                type="range"
                min="5"
                max="100"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-32 cursor-pointer accent-purple-600"
                disabled={activeTool === "pan"}
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={onStartNew}
              className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              Start New
            </button>
            <button
              onClick={handleDownload}
              className="bg-purple-600 text-white font-bold py-2 px-6 rounded-lg shadow-lg hover:bg-purple-700 transition-all transform hover:scale-105"
            >
              Download
            </button>
          </div>
        </header>
        <div className="flex-1 p-6 flex items-center justify-center bg-slate-900">
          {/* Centered checkerboard pattern with exact image dimensions */}
          <div className="relative flex items-center justify-center w-full h-full">
            {/* Checkerboard background with exact image dimensions */}
            <div
              className="absolute overflow-hidden border border-slate-600"
              style={{
                width: `${imageDimensions.width}px`,
                height: `${imageDimensions.height}px`,
                backgroundImage: `url("${checkerboardPattern}")`,
                backgroundRepeat: "repeat",
                transform: "scale(1.3)", // Make the checkerboard slightly smaller
              }}
            ></div>
            <div
              className="canvas-container"
              style={{
                width: `${imageDimensions.width}px`,
                height: `${imageDimensions.height}px`,
                position: "absolute",
                zIndex: 1,
                transform: "scale(1.3)", // Make the canvas match the checkerboard size
              }}
            >
              <canvas ref={canvasRef} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EditorView;
