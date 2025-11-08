// src/utils/fabricUtils.ts
// (The Orchestrator): The main hook. It will manage state and compose the other functions.
"use client";

// Converts a Data URL to a File object
export const dataURLtoFile = (dataurl: string, filename: string): File => {
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

// Generates the black-and-white hard mask for the API
export const generateHardMaskDataURL = (
  fabricCanvas: any
): Promise<string | null> => {
  return new Promise((resolve) => {
    if (!fabricCanvas || !window.fabric) {
      resolve(null);
      return;
    }
    const paths = fabricCanvas
      .getObjects()
      .filter((obj: any) => obj.type === "path");
    if (paths.length === 0) {
      resolve(null);
      return;
    }

    const softMaskCanvas = new window.fabric.StaticCanvas(null, {
      width: fabricCanvas.getWidth(),
      height: fabricCanvas.getHeight(),
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
      tempCanvas.width = fabricCanvas.getWidth();
      tempCanvas.height = fabricCanvas.getHeight();
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