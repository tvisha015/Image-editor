"use client";

import React, { FC, RefObject } from "react";

const checkerboardPattern = `data:image/svg+xml,%3Csvg xmlns='http://www.w.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Crect width='16' height='16' fill='%232d3748'/%3E%3Crect width='8' height='8' fill='%234a5568'/%3E%3Crect x='8' y='8' width='8' height='8' fill='%234a5568'/%3E%3C/svg%3E`;

const EditorCanvas: FC<{
  canvasRef: RefObject<HTMLCanvasElement>;
  imageDimensions: { width: number; height: number };
}> = ({ canvasRef, imageDimensions }) => (
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
      </div>
    </div>
  </div>
);

export default EditorCanvas;