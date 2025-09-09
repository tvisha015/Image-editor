// components/EditorView.tsx
"use client";

import React, { useState, useRef, useEffect, FC } from "react";

// TypeScript declarations for global Fabric.js instance from CDN
declare global {
  interface Window {
    fabric: any;
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

// --- Moved this constant outside the component ---
const checkerboardPattern = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Crect width='16' height='16' fill='%232d3748'/%3E%3Crect width='8' height='8' fill='%234a5568'/%3E%3Crect x='8' y='8' width='8' height='8' fill='%234a5568'/%3E%3C/svg%3E`;

const EditorView: FC<{ imageUrl: string; onStartNew: () => void }> = ({
  imageUrl,
  onStartNew,
}) => {
  // --- State and Refs ---
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<any | null>(null);
  const imageRef = useRef<any | null>(null);
  const patternSourceRef = useRef<HTMLImageElement | null>(null);

  const [activeTool, setActiveTool] = useState<Tool>("pan");
  const [brushSize, setBrushSize] = useState(30);

  // --- Main useEffect for ALL Canvas Logic ---
  useEffect(() => {
    if (!imageUrl || !canvasRef.current || !window.fabric) {
      return;
    }

    const fabricInstance = window.fabric;
    const container = canvasRef.current.parentElement;
    
    let canvas: any;

    const imgElement = new Image();
    imgElement.crossOrigin = "anonymous";
    imgElement.src = imageUrl;

    imgElement.onload = () => {
      patternSourceRef.current = imgElement;

      // 1. Calculate the best canvas size to fit the container with padding
      const padding = 80;
      const maxWidth = (container ? container.offsetWidth : 800) - padding;
      const maxHeight = (container ? container.offsetHeight : 600) - padding;

      const imageAspectRatio = imgElement.width / imgElement.height;
      let canvasWidth = maxWidth;
      let canvasHeight = maxWidth / imageAspectRatio;

      if (canvasHeight > maxHeight) {
        canvasHeight = maxHeight;
        canvasWidth = maxHeight * imageAspectRatio;
      }

      // 2. Initialize the canvas with the checkerboard background
      canvas = new fabricInstance.Canvas(canvasRef.current, {
        width: canvasWidth,
        height: canvasHeight,
        backgroundColor: `url("${checkerboardPattern}") repeat`,
      });
      fabricCanvasRef.current = canvas;

      // 3. Add the image to the canvas
      fabricInstance.Image.fromURL(
        imageUrl,
        (img: any) => {
          img.scaleToWidth(canvas.width);
          img.set({
             left: canvas.width / 2,
             top: canvas.height / 2,
             originX: 'center',
             originY: 'center',
             selectable: true,
             evented: true,
          });
          
          imageRef.current = img;
          canvas.add(img);
          canvas.renderAll();
        },
        { crossOrigin: "anonymous" }
      );
      
      // 4. Set up containment logic based on the canvas itself
      const enforceContainment = (options: { target: any }) => {
        const obj = options.target;
        if (!obj || obj !== imageRef.current) return;
        obj.setCoords();

        const objWidth = obj.getScaledWidth();
        const objHeight = obj.getScaledHeight();
        const cWidth = canvas.getWidth();
        const cHeight = canvas.getHeight();

        // Calculate boundaries for the image's center
        const minX = objWidth / 2;
        const maxX = cWidth - objWidth / 2;
        const minY = objHeight / 2;
        const maxY = cHeight - objHeight / 2;
        
        // Enforce boundaries
        if (obj.left < minX) obj.left = minX;
        if (obj.left > maxX) obj.left = maxX;
        if (obj.top < minY) obj.top = minY;
        if (obj.top > maxY) obj.top = maxY;
      };
      
      canvas.on('object:moving', enforceContainment);
      canvas.on('object:scaling', enforceContainment);
    };

    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.off('object:moving');
        fabricCanvasRef.current.off('object:scaling');
        fabricCanvasRef.current.dispose();
      }
    };
  }, [imageUrl]);


  // --- useEffect for tool switching ---
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;

    if (activeTool === "pan") {
      canvas.isDrawingMode = false;
      image.selectable = true;
      image.evented = true;
    } else {
      canvas.isDrawingMode = true;
      image.selectable = false;
      image.evented = false;
      
      if (activeTool === "erase") {
        const eraserBrush = new window.fabric.PencilBrush(canvas);
        eraserBrush.globalCompositeOperation = 'destination-out';
        eraserBrush.width = brushSize;
        canvas.freeDrawingBrush = eraserBrush;
      } else if (activeTool === "restore" && patternSourceRef.current) {
        const restoreBrush = new window.fabric.PatternBrush(canvas);
        restoreBrush.width = brushSize;
        restoreBrush.source = patternSourceRef.current as CanvasImageSource;
        canvas.freeDrawingBrush = restoreBrush;
      }
    }
    canvas.renderAll(); 
  }, [activeTool, brushSize]);

  
  const handleDownload = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const dataURL = canvas.toDataURL({ format: "png", quality: 1.0, multiplier: 1 });
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
        <div className="w-12 h-12 bg-purple-600 rounded-xl text-white flex items-center justify-center font-bold text-2xl shrink-0">R</div>
        <ToolButton title="Pan Tool" onClick={() => setActiveTool("pan")} isActive={activeTool === "pan"}><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 Rerender the canvas to apply the changes112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></ToolButton>
        <ToolButton title="Erase Tool" onClick={() => setActiveTool("erase")} isActive={activeTool === "erase"}><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></ToolButton>
        <ToolButton title="Restore Tool" onClick={() => setActiveTool("restore")} isActive={activeTool === "restore"}><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9H0v5h4.582m15.356 2a8.001 8.001 0 01-15.356-2H24v-5h-4.582z" /></svg></ToolButton>
      </aside>
      <main className="flex-1 flex flex-col">
        <header className="flex justify-between items-center p-4 border-b border-slate-700">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-white mr-4 hidden sm:block">Editor</h1>
            <div className="flex items-center gap-3 text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>
              <input type="range" min="5" max="100" value={brushSize} onChange={(e) => setBrushSize(Number(e.target.value))} className="w-32 cursor-pointer accent-purple-600" disabled={activeTool === "pan"} />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={onStartNew} className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Start New</button>
            <button onClick={handleDownload} className="bg-purple-600 text-white font-bold py-2 px-6 rounded-lg shadow-lg hover:bg-purple-700 transition-all transform hover:scale-105">Download</button>
          </div>
        </header>
        {/* The canvas container is now just a simple flexbox for centering */}
        <div className="flex-1 p-6 flex items-center justify-center">
          <div className="canvas-wrapper shadow-2xl">
            <canvas ref={canvasRef} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default EditorView;