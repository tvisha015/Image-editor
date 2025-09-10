// src/components/Editor/ToolButton.tsx
"use client";

import React, { FC } from "react";

const ToolButton: FC<{
  onClick: () => void;
  isActive: boolean;
  children: React.ReactNode;
  title: string;
}> = ({ onClick, isActive, children, title }) => (
  <button
    onClick={onClick}
    title={title}
    className={`p-3 rounded-xl transition-colors ${
      isActive
        ? "bg-purple-500/30 text-purple-400"
        : "hover:bg-slate-700 text-slate-400"
    }`}
  >
    {children}
  </button>
);

export default ToolButton;