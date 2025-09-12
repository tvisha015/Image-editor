"use client";

import React, { useState, FC } from "react";
import { useFabric } from "../hooks/useFabric";
import { Tool } from "../types/editor";
import EditorToolbar from "./Editor/EditorToolbar";
import EditorHeader from "./Editor/EditorHeader";
import EditorCanvas from "./Editor/EditorCanvas";

const EditorView: FC<{ imageUrl: string; onStartNew: () => void }> = ({ imageUrl, onStartNew }) => {
    const [activeTool, setActiveTool] = useState<Tool>("none");
    const [brushSize, setBrushSize] = useState(30);
    
    // State to hold the final, processed image URL
    const [finalImage, setFinalImage] = useState<string | null>(null);

    // This function will be called by the hook on success
    const handleComplete = (url: string) => {
        setFinalImage(url);
    };

    const { canvasRef, imageDimensions, handleDownloadMask, handleRemoveObject } = useFabric(
        imageUrl, 
        activeTool, 
        brushSize,
        handleComplete // <-- Pass the completion handler to the hook
    );

    // If we have a final image, show the result view
    if (finalImage) {
        return (
            <div className="w-full max-w-screen-2xl h-[90vh] bg-white rounded-2xl shadow-xl flex flex-col p-8 items-center justify-center border border-slate-200">
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Object Removed Successfully!</h2>
                <img 
                    src={finalImage} 
                    alt="Processed result" 
                    className="max-w-full max-h-[60vh] rounded-lg shadow-lg mb-6"
                />
                <button 
                    onClick={() => {
                        setFinalImage(null); // Clear the final image
                        onStartNew();       // Go back to the upload screen
                    }}
                    className="bg-purple-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-purple-700 transition-all"
                >
                    Start New Project
                </button>
            </div>
        );
    }
    
    // Otherwise, show the editor
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
                    handleDownloadMask={handleDownloadMask}
                    handleRemoveObject={handleRemoveObject}
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