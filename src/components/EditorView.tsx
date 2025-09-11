// FILE: src/components/EditorView.tsx
// -----------------------------------

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

    const { canvasRef, imageDimensions, handleDownload } = useFabric(imageUrl, activeTool, brushSize);

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
                    handleDownload={handleDownload}
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