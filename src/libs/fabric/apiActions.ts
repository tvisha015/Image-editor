// src/lib/fabric/apiActions.ts
"use client";

import { dataURLtoFile, generateHardMaskDataURL } from "@/utils/fabricUtils"; // Update path if needed

// Triggers a browser download of the canvas content
export const exportCanvasImage = (fabricCanvas: any) => {
  if (!fabricCanvas) return;
  const dataURL = fabricCanvas.toDataURL({ format: "png" });
  const link = document.createElement("a");
  link.download = "edited-image.png";
  link.href = dataURL;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Handles the "Remove Object" API call
export const removeObjectApiCall = async (
  fabricCanvas: any,
  imageRef: any,
  onComplete: (url: string) => void
) => {
  if (!fabricCanvas || !imageRef) {
    alert("Image not found on canvas. Please wait for it to load fully.");
    return;
  }

  const maskDataURL = await generateHardMaskDataURL(fabricCanvas);

  if (!maskDataURL) {
    alert("Please draw on the image to select an area to remove.");
    return;
  }

  const imageDataURL = fabricCanvas.toDataURL({
    format: "png",
    without: ["path"],
  });

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
      const paths = fabricCanvas
        .getObjects()
        .filter((obj: any) => obj.type === "path");
      paths.forEach((path: any) => fabricCanvas.remove(path));
      fabricCanvas.renderAll();
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
};