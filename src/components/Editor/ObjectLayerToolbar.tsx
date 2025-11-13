"use client";

import React, { FC } from "react";

// --- Icons ---
const UpIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="18 15 12 9 6 15"></polyline>
  </svg>
);
const DownIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);
const TopIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="18 15 12 9 6 15"></polyline>
    <line x1="12" y1="9" x2="12" y2="3"></line>
  </svg>
);
const BottomIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"></polyline>
    <line x1="12" y1="15" x2="12" y2="21"></line>
  </svg>
);

interface ObjectLayerToolbarProps {
  onBringForward: () => void;
  onSendBackward: () => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
}

const ObjectLayerToolbar: FC<ObjectLayerToolbarProps> = ({
  onBringForward,
  onSendBackward,
  onBringToFront,
  onSendToBack,
}) => {
  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-lg border border-gray-200 flex items-center gap-2 z-50 animate-fade-in">
      <span className="text-xs font-semibold text-gray-500 mr-2 uppercase tracking-wider">Layer</span>
      
      <button onClick={onBringToFront} className="p-2 hover:bg-gray-100 rounded text-gray-700" title="Bring to Front">
        <TopIcon />
      </button>
      
      <button onClick={onBringForward} className="p-2 hover:bg-gray-100 rounded text-gray-700" title="Bring Forward">
        <UpIcon />
      </button>
      
      <div className="w-px h-6 bg-gray-300 mx-1"></div>
      
      <button onClick={onSendBackward} className="p-2 hover:bg-gray-100 rounded text-gray-700" title="Send Backward">
        <DownIcon />
      </button>
      
      <button onClick={onSendToBack} className="p-2 hover:bg-gray-100 rounded text-gray-700" title="Send to Back">
        <BottomIcon />
      </button>
    </div>
  );
};

export default ObjectLayerToolbar;