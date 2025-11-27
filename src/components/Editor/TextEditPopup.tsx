// src/components/Editor/TextEditPopup.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";

interface TextEditPopupProps {
  initialText: string;
  position: { x: number; y: number } | null;
  onApply: (text: string) => void;
  onCancel: () => void;
}

const TextEditPopup: React.FC<TextEditPopupProps> = ({
  initialText,
  position,
  onApply,
  onCancel,
}) => {
  const [text, setText] = useState(initialText);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Focus input on open
  useEffect(() => {
    if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
    }
  }, []);

  // Handle clicking outside to cancel
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onCancel();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onCancel]);

  if (!position) return null;

  return (
    <div
      ref={containerRef}
      className="absolute z-50 bg-white rounded-xl shadow-xl border border-gray-200 p-3 w-72 animate-in fade-in zoom-in-95 duration-100"
      // Position slightly offset from the click point
      style={{ top: position.y - 20, left: position.x + 20 }} 
    >
      <h4 className="text-sm font-semibold text-gray-700 mb-2">Edit Text</h4>
      <textarea
        ref={inputRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-md text-gray-800 text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none mb-3"
        rows={3}
        onKeyDown={(e) => {
            // Allow Shift+Enter for new line, Enter to apply
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onApply(text);
            }
        }}
      />
      <div className="flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => onApply(text)}
          className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
        >
          Apply
        </button>
      </div>
    </div>
  );
};

export default TextEditPopup;