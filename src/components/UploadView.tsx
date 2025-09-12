// src/app/components/UploadView.tsx
"use client";

import React, { useState, FC } from "react";

// --- SVG Icon for UI ---
const UploadIcon: FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className || "h-12 w-12 text-slate-400"}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
    />
  </svg>
);

const UploadView: FC<{
  onImageUpload: (file: File) => Promise<void>;
  isLoading: boolean;
}> = ({ onImageUpload, isLoading }) => {
  const [isDragging, setIsDragging] = useState(false);

  const validateImageFile = (file: File): boolean => {
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file (JPEG, PNG, etc.)");
      return false;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert("Image size should be less than 10MB");
      return false;
    }

    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateImageFile(file)) {
        onImageUpload(file);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateImageFile(file)) {
        onImageUpload(file);
      }
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        <div className="p-10 text-center">
          <h1 className="text-4xl font-bold text-slate-800">
            Remove Background
          </h1>
          <p className="text-slate-500 mt-3 text-lg">
            Upload any image to get a transparent background.
          </p>
        </div>
        <div
          className="px-10 pb-10"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div
            className={`relative flex flex-col items-center justify-center w-full h-72 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300 transition-all duration-300
                    ${isDragging ? "border-purple-500 bg-purple-50" : ""}`}
          >
            {isLoading ? (
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-700 font-medium text-lg">
                  Removing background...
                </p>
                <p className="text-slate-500 text-sm">
                  This may take a few moments
                </p>
              </div>
            ) : (
              <>
                <div className="text-center">
                  <UploadIcon className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                  <p className="text-xl font-semibold text-slate-700">
                    Drag & Drop your image here
                  </p>
                  <p className="text-slate-400 mt-1">or</p>
                </div>
                <label
                  htmlFor="image-upload-main"
                  className="mt-4 z-10 bg-purple-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-purple-700 transition-all cursor-pointer text-lg"
                >
                  Select a File
                </label>
                <input
                  id="image-upload-main"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadView;
