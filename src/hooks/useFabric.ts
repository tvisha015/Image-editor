// src/hooks/useFabric.ts
"use client";

import { useRef, useEffect, useState, useCallback, RefObject } from "react";
import { Tool } from "../types/editor";

import { initFabricCanvas, updateMainImage } from "@/libs/fabric/canvasSetup";
import { clearCanvasDrawings, useFabricBrush } from "@/libs/fabric/drawingActions";
import { useFabricZoom } from "@/libs/fabric/interactionEffects";
import { clearCanvasBgImage, setCanvasBgImageFromUrl, setCanvasColor, uploadCanvasBgImage } from "@/libs/fabric/backgroundActions";
import { exportCanvasImage, removeObjectApiCall } from "@/libs/fabric/apiActions";


export const useFabric = (
  imageUrl: string,
  activeTool: Tool,
  brushSize: number,
  onComplete: (url: string) => void,
  backgroundColor: string,
  onBgImageUpload: (file: File) => void, // This prop is unused in the new structure
  isBgPanelOpen: boolean
) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<any | null>(null);
  const imageRef = useRef<any | null>(null);
  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  });

  // 1. Initialize Canvas
  useEffect(() => {
    const canvas = initFabricCanvas(canvasRef);
    fabricCanvasRef.current = canvas;
    return () => {
      fabricCanvasRef.current?.dispose();
    };
  }, []);

  // 2. Load Main Image
  useEffect(() => {
    updateMainImage(
      fabricCanvasRef.current,
      imageRef as RefObject<any>,
      imageUrl,
      activeTool,
      setImageDimensions
    );
  }, [imageUrl, activeTool]); // Run when image or tool (for selectability) changes

  // 3. Setup Brush Effect
  useFabricBrush(fabricCanvasRef, activeTool, brushSize);

  // 4. Setup Zoom Effect
  useFabricZoom(fabricCanvasRef, activeTool, isBgPanelOpen);

  // 5. Wrap Actions in useCallback
  const setBackgroundColor = useCallback((color: string) => {
    setCanvasColor(fabricCanvasRef.current, color);
  }, []);

  const handleBackgroundImageUpload = useCallback((file: File) => {
    uploadCanvasBgImage(fabricCanvasRef.current, file);
  }, []);

  const clearBackgroundImage = useCallback(() => {
    clearCanvasBgImage(fabricCanvasRef.current);
  }, []);

  const setBackgroundImageFromUrl = useCallback((imageUrl: string) => {
    setCanvasBgImageFromUrl(fabricCanvasRef.current, imageUrl);
  }, []);

  const handleDownloadImage = useCallback(() => {
    exportCanvasImage(fabricCanvasRef.current);
  }, []);

  const handleRemoveObject = useCallback(async () => {
    await removeObjectApiCall(
      fabricCanvasRef.current,
      imageRef.current,
      onComplete
    );
  }, [onComplete]);

  const clearDrawings = useCallback(() => {
    clearCanvasDrawings(fabricCanvasRef.current);
  }, []);

  // Return the same interface as before
  return {
    canvasRef,
    imageDimensions,
    handleRemoveObject,
    handleDownloadImage,
    clearDrawings,
    handleBackgroundImageUpload,
    clearBackgroundImage,
    setBackgroundImageFromUrl,
    setBackgroundColor,
  };
};