// src/lib/fabric/backgroundActions.ts
"use client";

// Sets the solid background color of the canvas
export const setCanvasColor = (fabricCanvas: any, color: string) => {
  if (fabricCanvas) {
    fabricCanvas.setBackgroundColor(
      color,
      fabricCanvas.renderAll.bind(fabricCanvas)
    );
  }
};

export const clearCanvasBgImage = (fabricCanvas: any) => {
  if (fabricCanvas) {
    fabricCanvas.setBackgroundImage(
      null,
      fabricCanvas.renderAll.bind(fabricCanvas)
    );
  }
};

export const setCanvasBgImageFromUrl = (
  fabricCanvas: any,
  imageUrl: string,
  onComplete?: () => void // Callback
) => {
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

        fabricCanvas.setBackgroundImage(
          img,
          () => {
            fabricCanvas.renderAll();
            if (onComplete) onComplete(); // Trigger
          },
          {
            scaleX: scale,
            scaleY: scale,
            originX: "left",
            originY: "top",
            left: 0,
            top: 0,
          }
        );
      },
      { crossOrigin: "anonymous", noCache: false }
    );
  });
};

export const uploadCanvasBgImage = (
  fabricCanvas: any,
  file: File,
  onComplete?: () => void // Callback
) => {
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

      fabricCanvas.setBackgroundImage(
        fabricImg,
        () => {
          fabricCanvas.renderAll();
          if (onComplete) onComplete(); // Trigger
        },
        {
          scaleX: scale,
          scaleY: scale,
          originX: "left",
          originY: "top",
          left: 0,
          top: 0,
        }
      );
    };
    img.src = dataUrl;
  };
  reader.readAsDataURL(file);
};
