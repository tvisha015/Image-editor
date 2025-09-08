"use client";

import React, { useState, useRef, useEffect, FC } from 'react';
import fabric from 'fabric';

// TypeScript declarations for global Fabric.js instance from CDN
declare global {
    interface Window {
        fabric: typeof fabric;
    }
}

// --- SVG Icons for UI ---
const UploadIcon: FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-12 w-12 text-slate-500"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
);

// --- 1. UPLOAD VIEW COMPONENT ---
// New theme: Sophisticated Dark Mode with Purple Accent
const UploadView: FC<{ onImageUpload: (file: File) => void; isLoading: boolean }> = ({ onImageUpload, isLoading }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageUpload(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onImageUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-700">
        <div className="p-10 text-center">
            <h1 className="text-4xl font-bold text-white">Remove Background</h1>
            <p className="text-slate-400 mt-3 text-lg">Upload any image to get a transparent background.</p>
        </div>
        <div 
            className="px-10 pb-10"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <div className={`relative flex flex-col items-center justify-center w-full h-72 bg-slate-900/50 rounded-xl border-2 border-dashed border-slate-600 transition-all duration-300
                ${isDragging ? 'border-purple-500 bg-slate-900' : ''}`}>
                
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-slate-300 font-medium text-lg">Processing image...</p>
                    </div>
                ) : (
                    <>
                        <div className="text-center">
                            <UploadIcon className="h-16 w-16 text-slate-500 mx-auto mb-4" />
                            <p className="text-xl font-semibold text-slate-300">Drag & Drop your image here</p>
                            <p className="text-slate-500 mt-1">or</p>
                        </div>
                        <label
                            htmlFor="image-upload-main"
                            className="mt-4 z-10 bg-purple-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-purple-700 transition-all cursor-pointer text-lg"
                        >
                            Select a File
                        </label>
                        <input id="image-upload-main" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                    </>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};


// --- 2. EDITOR VIEW COMPONENT ---
// Dark theme editor with a checkerboard background for transparency
const EditorView: FC<{ imageUrl: string, onStartNew: () => void }> = ({ imageUrl, onStartNew }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);

  const checkerboardPattern = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Crect width='16' height='16' fill='%232d3748'/%3E%3Crect width='8' height='8' fill='%234a5568'/%3E%3Crect x='8' y='8' width='8' height='8' fill='%234a5568'/%3E%3C/svg%3E`;

  useEffect(() => {
    const fabricInstance = window.fabric;
    if (!fabricInstance || !canvasRef.current || !imageUrl) return;

    const container = canvasRef.current.parentElement;
    const containerWidth = container ? container.offsetWidth : 800;
    const containerHeight = container ? container.offsetHeight : 600;

    const canvas = new fabricInstance.Canvas(canvasRef.current, {
        width: containerWidth,
        height: containerHeight,
        backgroundColor: 'transparent',
    });
    fabricCanvasRef.current = canvas;
    
    // The second argument is the callback, and the third is an options object.
    // Adding the options object helps TypeScript resolve the correct function overload.
    fabricInstance.Image.fromURL(imageUrl, (img) => {
        const padding = 80;
        const scale = Math.min(
            (canvas.getWidth() - padding) / (img.width || 1),
            (canvas.getHeight() - padding) / (img.height || 1)
        );
        img.scale(scale);
        canvas.add(img);
        canvas.centerObject(img);
        canvas.renderAll();
    }, { crossOrigin: 'anonymous' }); // Added options object to resolve ambiguity

    return () => { canvas.dispose(); };
  }, [imageUrl]);

  return (
    <div className="w-full max-w-screen-2xl h-[90vh] bg-slate-800 rounded-2xl shadow-2xl flex overflow-hidden border border-slate-700">
        {/* Left Sidebar for Tools */}
        <aside className="w-20 bg-slate-900/50 p-4 flex flex-col items-center space-y-6">
            <div className="w-12 h-12 bg-purple-600 rounded-xl text-white flex items-center justify-center font-bold text-2xl">R</div>
            {/* Placeholder icons for future tools */}
            <div className="p-3 rounded-xl bg-purple-500/30 text-purple-400 cursor-pointer transition-transform hover:scale-110"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg></div>
            <div className="p-3 rounded-xl hover:bg-slate-700 text-slate-400 cursor-pointer transition-transform hover:scale-110"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>
        </aside>
        
        {/* Main Content Area */}
        <main className="flex-1 flex flex-col">
            <header className="flex justify-between items-center p-4 border-b border-slate-700">
                <h1 className="text-xl font-semibold text-white">Editor</h1>
                <div className="flex items-center gap-4">
                    <button onClick={onStartNew} className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Start New</button>
                    <button className="bg-purple-600 text-white font-bold py-2 px-6 rounded-lg shadow-lg hover:bg-purple-700 transition-all transform hover:scale-105">Download</button>
                </div>
            </header>
            <div className="flex-1 p-6 flex items-center justify-center" style={{ backgroundImage: `url("${checkerboardPattern}")`, backgroundRepeat: 'repeat' }}>
                 <div className="canvas-container w-full h-full">
                    <canvas ref={canvasRef} />
                </div>
            </div>
        </main>
    </div>
  );
};

// --- 3. MAIN WORKFLOW COMPONENT ---
const ImageWorkflow: FC = () => {
  const [currentView, setCurrentView] = useState<'upload' | 'editor'>('upload');
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (document.querySelector('script[src="https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.1/fabric.min.js"]')) return;
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.1/fabric.min.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);
  
  const handleImageUpload = (file: File) => {
    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = (event: ProgressEvent<FileReader>) => {
      const imageUrl = event.target?.result as string;
      if (!imageUrl) { setIsLoading(false); return; }
      
      console.log("Simulating background removal API call...");
      setTimeout(() => {
        setProcessedImageUrl(imageUrl);
        setCurrentView('editor');
        setIsLoading(false);
      }, 2000);
    };
    reader.readAsDataURL(file);
  };
  
  const handleStartNew = () => {
      setCurrentView('upload');
      setProcessedImageUrl(null);
  }

  return (
    <div className="bg-slate-900 min-h-screen w-full flex items-center justify-center p-4 font-sans">
      {currentView === 'upload' ? (
        <UploadView onImageUpload={handleImageUpload} isLoading={isLoading} />
      ) : (
        processedImageUrl && <EditorView imageUrl={processedImageUrl} onStartNew={handleStartNew} />
      )}
    </div>
  );
};

export default ImageWorkflow;

