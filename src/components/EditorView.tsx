// components/EditorView.tsx
"use client";

import React, { useState, useRef, useEffect, FC } from "react";
// import fabric from "fabric"; // <--- THIS LINE IS NOW REMOVED

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

  useEffect(() => {
    if (!imageUrl || !canvasRef.current || !window.fabric) {
      return;
    }

    const fabricInstance = window.fabric;
    const container = canvasRef.current.parentElement;
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

      fabricInstance.Image.fromURL(
        imageUrl,
        (img: any) => {
          const padding = 80;
          const scale = Math.min(
            (canvas.getWidth() - padding) / (img.width || 1),
            (canvas.getHeight() - padding) / (img.height || 1)
          );
          img.scale(scale);
          img.selectable = false;
          img.evented = false;

          canvas.add(img);
          canvas.centerObject(img);
          imageRef.current = img;
          canvas.renderAll();
        },
        { crossOrigin: "anonymous" }
      );
    };

    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
      }
    };
  }, [imageUrl]);

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !window.fabric) return;

    if (activeTool === "pan") {
      canvas.isDrawingMode = false;
    } else {
      canvas.isDrawingMode = true;
      if (activeTool === "erase") {
        // const eraserBrush = new window.fabric.EraserBrush(canvas);
        // 1. Create a standard PencilBrush
        const eraserBrush = new window.fabric.PencilBrush(canvas);
        // 2. Set the property that turns it into an eraser
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
        <div
          className="flex-1 p-6 flex items-center justify-center"
          style={{
            backgroundImage: `url("${checkerboardPattern}")`,
            backgroundRepeat: "repeat",
          }}
        >
          <div className="canvas-container w-full h-full">
            <canvas ref={canvasRef} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default EditorView;
