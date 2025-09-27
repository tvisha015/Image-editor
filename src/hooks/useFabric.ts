// src/hooks/useFabric.ts
"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { Tool } from "../types/editor";

declare global {
  interface Window {
    fabric: any;
  }
}

const dataURLtoFile = (dataurl: string, filename: string): File => {
  const arr = dataurl.split(",");
  const mimeMatch = arr[0].match(/:(.*?);/);
  if (!mimeMatch) throw new Error("Invalid Data URL");
  const mime = mimeMatch[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);
  return new File([u8arr], filename, { type: mime });
};

export const useFabric = (
  imageUrl: string,
  activeTool: Tool,
  brushSize: number,
  onComplete: (url: string) => void,
  backgroundColor: string,
  backgroundImage: string,
  onBgImageLoaded: () => void,
  isBgPanelOpen: boolean
) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<any | null>(null);
  const imageRef = useRef<any | null>(null); // Ref to store the main image object
  const isPanning = useRef(false);
  const lastPosition = useRef({ x: 0, y: 0 });
  const bgImageCache = useRef<Map<string, any>>(new Map());
  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  });

  const updateCanvasImage = useCallback((url: string) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas || !window.fabric || !url) return;
    canvas.clear();
    imageRef.current = null; // Clear previous image ref

    window.fabric.Image.fromURL(
      url,
      (img: any) => {
        const padding = 15;
        const scale =
          Math.min(
            (800 - padding) / (img.width || 1),
            (600 - padding) / (img.height || 1)
          ) * 0.5;

        img.scale(scale);
        const scaledWidth = Math.round((img.width || 0) * scale);
        const scaledHeight = Math.round((img.height || 0) * scale);
        setImageDimensions({ width: scaledWidth, height: scaledHeight });

        canvas.setWidth(scaledWidth);
        canvas.setHeight(scaledHeight);
        img.set({
          selectable: activeTool === 'cursor',
          evented: activeTool === 'cursor',
          crossOrigin: "anonymous",
        });

        imageRef.current = img; // Store the new image object in our ref

        canvas.add(img);
        canvas.centerObject(img);
        canvas.renderAll();
      },
      { crossOrigin: "anonymous" }
    );
  }, [activeTool]);

  useEffect(() => {
    if (!canvasRef.current || !window.fabric) return;
    const canvas = new window.fabric.Canvas(canvasRef.current);
    fabricCanvasRef.current = canvas;
    return () => {
      fabricCanvasRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    updateCanvasImage(imageUrl);
  }, [imageUrl, updateCanvasImage]);

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (canvas) {
      canvas.setBackgroundColor(backgroundColor, canvas.renderAll.bind(canvas));
    }
  }, [backgroundColor]);

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    if (activeTool === "brush") {
      canvas.isDrawingMode = true;
      const brush = new window.fabric.PencilBrush(canvas);
      brush.width = brushSize;
      brush.color = "rgba(255, 255, 255, 1)";
      canvas.freeDrawingBrush = brush;
    } else {
      canvas.isDrawingMode = false;
    }
    canvas.renderAll();
  }, [activeTool, brushSize]);

  // useEffect(() => {
  //   const canvas = fabricCanvasRef.current;
  //   if (!canvas) return;

  //   if (backgroundImage) {
  //     window.fabric.Image.fromURL(
  //       backgroundImage,
  //       (img: any) => {
  //         canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
  //           // Scale the image to cover the entire canvas
  //           scaleX: canvas.width / (img.width || 1),
  //           scaleY: canvas.height / (img.height || 1),
  //           originX: "left",
  //           originY: "top",
  //         });
  //         onBgImageLoaded();
  //       },
  //       { crossOrigin: "anonymous" }
  //     );
  //   } else {
  //     // Clear the background image if the URL is empty
  //     canvas.setBackgroundImage(null, canvas.renderAll.bind(canvas));
  //   }
  // }, [backgroundImage, onBgImageLoaded]);

  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const setBackgroundImage = (img: any) => {
        canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
            scaleX: canvas.width / (img.width || 1),
            scaleY: canvas.height / (img.height || 1),
            originX: "left",
            originY: "top",
        });
        onBgImageLoaded();
    };

    if (backgroundImage) {
      // 1. Check if the image is already in our cache
      if (bgImageCache.current.has(backgroundImage)) {
        const cachedImg = bgImageCache.current.get(backgroundImage);
        setBackgroundImage(cachedImg); // Use cached image instantly
        return;
      }

      // 2. If not cached, load it from the URL
      window.fabric.Image.fromURL(
        backgroundImage,
        (img: any) => {
          // 3. Save the newly loaded image to the cache
          bgImageCache.current.set(backgroundImage, img);
          setBackgroundImage(img);
        },
        { crossOrigin: "anonymous" }
      );
    } else {
      canvas.setBackgroundImage(null, canvas.renderAll.bind(canvas));
    }
  }, [backgroundImage, onBgImageLoaded]);
 useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const maxZoom = 3;
    const zoomStep = 1;

    // --- Zoom Event Handlers ---
    const handleMouseWheel = (opt: any) => {
      // MODIFIED: Require Ctrl key for both brush and cursor tools
      if ((activeTool === 'brush' || activeTool === 'cursor') && !opt.e.ctrlKey) {
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

    const handleMouseClick = (opt: any) => {
      let currentZoom = canvas.getZoom();
      currentZoom += zoomStep;
      if (currentZoom > maxZoom) {
        currentZoom = 1;
      }
      canvas.zoomToPoint({ x: opt.pointer.x, y: opt.pointer.y }, currentZoom);
    };

    if (activeTool === 'brush' || activeTool === 'cursor' ) {
      canvas.on('mouse:wheel', handleMouseWheel);
    }
    // if (isBgPanelOpen) {
    //   canvas.on('mouse:up', handleMouseClick);
    //   canvas.defaultCursor = 'zoom-in';
    //   canvas.setCursor('zoom-in');
    // }

    // Cleanup function
    return () => {
      canvas.off('mouse:wheel', handleMouseWheel);
      canvas.off('mouse:up', handleMouseClick);
      if (isBgPanelOpen) {
        canvas.defaultCursor = 'default';
        canvas.setCursor('default');
      }
    };
  }, [activeTool, isBgPanelOpen]);
  const generateHardMaskDataURL = (): Promise<string | null> => {
    return new Promise((resolve) => {
      const canvas = fabricCanvasRef.current;
      if (!canvas) {
        resolve(null);
        return;
      }
      const paths = canvas
        .getObjects()
        .filter((obj: any) => obj.type === "path");
      if (paths.length === 0) {
        resolve(null);
        return;
      }

      const softMaskCanvas = new window.fabric.StaticCanvas(null, {
        width: canvas.getWidth(),
        height: canvas.getHeight(),
        backgroundColor: "black",
      });
      paths.forEach((path: any) => softMaskCanvas.add(path));
      softMaskCanvas.renderAll();
      const softMaskDataURL = softMaskCanvas.toDataURL({ format: "png" });

      const tempImg = new Image();
      tempImg.crossOrigin = "anonymous";
      tempImg.onload = () => {
        const tempCanvas = document.createElement("canvas");
        const tempCtx = tempCanvas.getContext("2d");
        if (!tempCtx) {
          resolve(null);
          return;
        }
        tempCanvas.width = canvas.getWidth();
        tempCanvas.height = canvas.getHeight();
        tempCtx.drawImage(tempImg, 0, 0);

        const imageData = tempCtx.getImageData(
          0,
          0,
          tempCanvas.width,
          tempCanvas.height
        );
        const pixels = imageData.data;

        for (let i = 0; i < pixels.length; i += 4) {
          if (pixels[i] > 0) {
            pixels[i] = 255;
            pixels[i + 1] = 255;
            pixels[i + 2] = 255;
            pixels[i + 3] = 255;
          }
        }
        tempCtx.putImageData(imageData, 0, 0);

        resolve(tempCanvas.toDataURL("image/png"));
      };
      tempImg.src = softMaskDataURL;
    });
  };

  const handleDownloadImage = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const dataURL = canvas.toDataURL({ format: "png" });
    const link = document.createElement("a");
    link.download = "edited-image.png";
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRemoveObject = async () => {
    const canvas = fabricCanvasRef.current;
    const imageObject = imageRef.current; // Use the reference

    if (!canvas || !imageObject) {
      alert("Image not found on canvas. Please wait for it to load fully.");
      return;
    }

    const maskDataURL = await generateHardMaskDataURL();

    if (!maskDataURL) {
      alert("Please draw on the image to select an area to remove.");
      return;
    }

    // // 1. Store the original background color
    // const originalBackgroundColor = canvas.backgroundColor;

    // // 2. Set background to transparent to export a clean image
    // canvas.setBackgroundColor('transparent', () => {
    //   canvas.renderAll();

    //   // 3. Export the image with a transparent background
    //   const scaledImageDataURL = canvas.toDataURL({ format: 'png', without: ['path'] });

    //   // 4. Immediately restore the original background color in the UI
    //   canvas.setBackgroundColor(originalBackgroundColor, canvas.renderAll.bind(canvas));

    // 5. Proceed with the API call using the transparent image

    const imageDataURL = imageObject.toDataURL({ format: "png" });

    // (async () => {
    try {
      const imageFile = dataURLtoFile(imageDataURL, "image.png");
      const maskImageFile = dataURLtoFile(maskDataURL, "mask_image.png");
      const formData = new FormData();
      formData.append("background_removed_image", imageFile);
      formData.append("mask_image", maskImageFile);

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      if (!baseUrl) {
        throw new Error("Configuration error: API base URL is not defined.");
      }
      const apiEndpoint = `${baseUrl}remove-object/`;
      const response = await fetch(apiEndpoint, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Server Error: ${response.status}. Response: ${errorText}`
        );
      }

      const result = await response.json();

      if (result.url) {
        const paths = canvas
          .getObjects()
          .filter((obj: any) => obj.type === "path");
        paths.forEach((path: any) => canvas.remove(path));
        canvas.renderAll();
        onComplete(result.url);
      } else {
        throw new Error("API response did not contain a URL.");
      }
    } catch (error) {
      console.error("Failed to remove object:", error);
      alert(
        `An error occurred: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
    // })();
  };

  const clearDrawings = useCallback(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    const paths = canvas.getObjects().filter((obj: any) => obj.type === "path");
    paths.forEach((path: any) => canvas.remove(path));
    canvas.renderAll();
  }, []);

  return {
    canvasRef,
    imageDimensions,
    handleRemoveObject,
    handleDownloadImage,
    clearDrawings,
  };
};
