"use client";

import React, { useState, FC } from "react";
import { useFabric } from "../hooks/useFabric";
import { Tool } from "../types/editor";
import EditorToolbar from "./Editor/EditorToolbar";
import EditorHeader from "./Editor/EditorHeader";
import EditorCanvas from "./Editor/EditorCanvas";

const EditorView: FC<{ imageUrl: string; onStartNew: () => void }> = ({ imageUrl, onStartNew }) => {
    // The active image URL, which can be updated after processing
    const [currentImageUrl, setCurrentImageUrl] = useState(imageUrl);
    const [activeTool, setActiveTool] = useState<Tool>("cursor");
    const [brushSize, setBrushSize] = useState(30);
    
    // This function will be called by the hook on success
    const handleComplete = (newUrl: string) => {
        // Update the image in the canvas for further editing
        setCurrentImageUrl(newUrl); 
        // Reset tool to cursor after an object is removed
        setActiveTool("cursor"); 
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
            />
            <main className="flex-1 flex flex-col">
                <EditorHeader
                    brushSize={brushSize}
                    setBrushSize={setBrushSize}
                    activeTool={activeTool}
                    onStartNew={onStartNew}
                    handleRemoveObject={handleRemoveObject}
                    handleDownloadImage={handleDownloadImage} // Pass the download handler
                />
                <EditorCanvas
                    canvasRef={canvasRef as React.RefObject<HTMLCanvasElement>}
                    imageDimensions={imageDimensions}
                    activeTool={activeTool}
                    brushSize={brushSize}
                />
            </main>
        </div>
    );
};

export default EditorView;