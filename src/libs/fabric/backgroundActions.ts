// src/lib/fabric/backgroundActions.ts
"use client";

// Sets the solid background color of the canvas
export const setCanvasColor = (fabricCanvas: any, color: string) => {
  if (fabricCanvas) {
    fabricCanvas.setBackgroundColor(color, fabricCanvas.renderAll.bind(fabricCanvas));
  }
};

// Clears the background image
export const clearCanvasBgImage = (fabricCanvas: any) => {
  if (fabricCanvas) {
    fabricCanvas.setBackgroundImage(null, fabricCanvas.renderAll.bind(fabricCanvas));
  }
};

// Sets the background image from a static URL
export const setCanvasBgImageFromUrl = (fabricCanvas: any, imageUrl: string) => {
  if (!fabricCanvas || !window.fabric) return;

  requestAnimationFrame(() => {
    window.fabric.Image.fromURL(
      imageUrl,
      (img: any) => {
        const canvasWidth = fabricCanvas.getWidth();
        const canvasHeight = fabricCanvas.getHeight();
        const scaleX = canvasWidth / (img.width || 1);
        const scaleY = canvasHeight / (img.height || 1);
        const scale = Math.max(scaleX, scaleY);

        fabricCanvas.setBackgroundImage(img, fabricCanvas.renderAll.bind(fabricCanvas), {
          scaleX: scale,
          scaleY: scale,
          originX: "left",
          originY: "top",
          left: 0,
          top: 0,
        });
        fabricCanvas.renderAll();
      },
      { crossOrigin: "anonymous", noCache: false }
    );
  });
};

// Uploads and sets a new background image from a File
export const uploadCanvasBgImage = (fabricCanvas: any, file: File) => {
  if (!fabricCanvas || !window.fabric) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const dataUrl = e.target?.result as string;
    if (!dataUrl) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const fabricImg = new window.fabric.Image(img);
      const canvasWidth = fabricCanvas.getWidth();
      const canvasHeight = fabricCanvas.getHeight();
      const scaleX = canvasWidth / (fabricImg.width || 1);
      const scaleY = canvasHeight / (fabricImg.height || 1);
      const scale = Math.max(scaleX, scaleY);

      fabricCanvas.setBackgroundImage(fabricImg, fabricCanvas.renderAll.bind(fabricCanvas), {
        scaleX: scale,
        scaleY: scale,
        originX: "left",
        originY: "top",
        left: 0,
        top: 0,
      });
      fabricCanvas.renderAll();
    };
    img.onerror = (error) => console.error("Failed to load uploaded image:", error);
    img.src = dataUrl;
  };
  reader.onerror = (error) => console.error("Failed to read file:", error);
  reader.readAsDataURL(file);
};