"use client";

import React, { useState, FC, useEffect } from "react";
import { useFabric } from "../hooks/useFabric";
import { Tool } from "../types/editor";
import EditorToolbar from "./Editor/EditorToolbar";
import EditorHeader from "./Editor/EditorHeader";
import EditorCanvas from "./Editor/EditorCanvas";

interface EditorViewProps {
  initialImageUrl: string;
  originalImageUrl: string; // The untouched original image
  onStartNew: () => void;
}

const EditorView: FC<EditorViewProps> = ({ initialImageUrl, originalImageUrl, onStartNew }) => {
    const [currentImageUrl, setCurrentImageUrl] = useState(initialImageUrl);
    const [activeTool, setActiveTool] = useState<Tool>("cursor");
    const [brushSize, setBrushSize] = useState(30);
    const [isPreviewing, setIsPreviewing] = useState(false);
    const [hasBeenEdited, setHasBeenEdited] = useState(false);

    useEffect(() => {
        if (sessionStorage.getItem('bgRemoved') === 'true') {
            setHasBeenEdited(true);
        }
    }, []);

    const handleComplete = (newUrl: string) => {
        setCurrentImageUrl(newUrl); 
        setActiveTool("cursor"); 
        setHasBeenEdited(true);
    };

    const { canvasRef, imageDimensions, handleRemoveObject, handleDownloadImage } = useFabric(
        currentImageUrl, 
        activeTool, 
        brushSize,
        handleComplete
    );
    
    return (
        <div className="w-full max-w-screen-2xl h-[90vh] bg-white rounded-2xl shadow-xl flex overflow-hidden border border-slate-200">
            <EditorToolbar 
                activeTool={activeTool} 
                setActiveTool={setActiveTool}
                isPreviewing={isPreviewing}
            />
            <main className="flex-1 flex flex-col">
                <EditorHeader
                    brushSize={brushSize}
                    setBrushSize={setBrushSize}
                    activeTool={activeTool}
                    onStartNew={onStartNew}
                    handleRemoveObject={handleRemoveObject}
                    handleDownloadImage={handleDownloadImage}
                    hasBeenEdited={hasBeenEdited}
                    isPreviewing={isPreviewing}
                    onTogglePreview={() => setIsPreviewing(!isPreviewing)}
                />
                <EditorCanvas
                    canvasRef={canvasRef as React.RefObject<HTMLCanvasElement>}
                    imageDimensions={imageDimensions}
                    activeTool={activeTool}
                    brushSize={brushSize}
                    isPreviewing={isPreviewing}
                    originalImageUrl={originalImageUrl}
                    afterImageUrl={currentImageUrl}
                />
            </main>
        </div>
    );
};

export default EditorView;