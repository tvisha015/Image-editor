// Handles the logic for Blur, Adjustments, and Effects.
// src/hooks/fabric/useFabricFilters.ts

"use client";

import { useEffect, MutableRefObject } from "react";
import { BlurType, FilterType } from "@/types/editor";

interface FilterProps {
  isBlurEnabled: boolean;
  blurType: BlurType;
  effectBlurValue: number;
  isFilterEnabled: boolean;
  filterType: FilterType;
  brightness: number;
  contrast: number;
  highlight: number;
  sharpen: number;
  shadow: number;
  opacity: number;
  adjustBlur: number;
}

export const useFabricFilters = (
  fabricCanvasRef: MutableRefObject<any>,
  imageRef: MutableRefObject<any>,
  isHistoryLocked: MutableRefObject<boolean>,
  saveState: () => void,
  props: FilterProps
) => {
  const {
    isBlurEnabled, blurType, effectBlurValue, isFilterEnabled, filterType,
    brightness, contrast, highlight, sharpen, shadow, opacity, adjustBlur
  } = props;

  useEffect(() => {
    if (isHistoryLocked.current) return;

    const canvas = fabricCanvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image || !window.fabric || !window.fabric.Image.filters) return;

    const newFilters: any[] = [];

    // Adjustments
    if (brightness !== 0) newFilters.push(new window.fabric.Image.filters.Brightness({ brightness }));
    if (contrast !== 0) newFilters.push(new window.fabric.Image.filters.Contrast({ contrast }));
    const gammaValue = 1.0 + highlight;
    if (highlight > 0) newFilters.push(new window.fabric.Image.filters.Gamma({ gamma: [gammaValue, gammaValue, gammaValue] }));
    if (sharpen > 0) {
      const s = sharpen * 1.5;
      newFilters.push(new window.fabric.Image.filters.Convolute({ matrix: [ 0, -s, 0, -s, 1 + 4*s, -s, 0, -s, 0 ] }));
    }
    if (adjustBlur > 0) newFilters.push(new window.fabric.Image.filters.Blur({ blur: adjustBlur }));

    // Effects
    if (isBlurEnabled) {
      const blurIntensity = effectBlurValue / 100;
      switch (blurType) {
        case "gaussian": newFilters.push(new window.fabric.Image.filters.Blur({ blur: blurIntensity })); break;
        case "pixelate": 
        case "square": 
            const blockSize = Math.max(2, Math.round((effectBlurValue / 100) * 20));
            newFilters.push(new window.fabric.Image.filters.Pixelate({ blocksize: blockSize })); break;
        case "motion":
            let matrixSize = 3; if (effectBlurValue > 33) matrixSize = 5; if (effectBlurValue > 66) matrixSize = 7;
            const val = 1 / matrixSize;
            const motionMatrix = new Array(matrixSize * matrixSize).fill(0);
            for(let i=0; i<matrixSize; i++) motionMatrix[Math.floor(matrixSize/2) * matrixSize + i] = val; 
            newFilters.push(new window.fabric.Image.filters.Convolute({ matrix: motionMatrix })); break;
      }
    }

    if (isFilterEnabled) {
      switch (filterType) {
        case "noir": newFilters.push(new window.fabric.Image.filters.Grayscale()); newFilters.push(new window.fabric.Image.filters.Contrast({ contrast: 0.2 })); break;
        case "sepia": newFilters.push(new window.fabric.Image.filters.Sepia()); break;
        case "mono": newFilters.push(new window.fabric.Image.filters.Grayscale()); break;
        case "fade": newFilters.push(new window.fabric.Image.filters.Saturation({ saturation: -0.3 })); newFilters.push(new window.fabric.Image.filters.Brightness({ brightness: 0.1 })); break;
        case "process": newFilters.push(new window.fabric.Image.filters.ColorMatrix({ matrix: [ 1.0, 0.2, 0.0, 0, 0.05, 0.0, 1.0, 0.0, 0, 0.05, 0.2, 0.0, 1.0, 0, 0.05, 0, 0, 0, 1, 0] })); break;
        case "tonal": newFilters.push(new window.fabric.Image.filters.ColorMatrix({ matrix: [ 0.7, 0, 0, 0, 0.1, 0, 1.0, 0, 0, 0, 0, 0, 1.3, 0, 0.1, 0, 0, 0, 1, 0] })); break;
      }
    }

    // Properties
    image.set('opacity', opacity);
    if (shadow > 0) {
      image.set('shadow', new window.fabric.Shadow({ color: 'rgba(0,0,0,0.7)', blur: shadow * 20, offsetX: shadow * 5, offsetY: shadow * 5 }));
    } else {
      image.set('shadow', null);
    }

    image.filters = newFilters;
    image.applyFilters();
    canvas.renderAll();
    
    saveState(); 

  }, [
    isBlurEnabled, blurType, effectBlurValue, isFilterEnabled, filterType,
    brightness, contrast, highlight, sharpen, shadow, opacity, adjustBlur,
    saveState, fabricCanvasRef, imageRef, isHistoryLocked
  ]);
};