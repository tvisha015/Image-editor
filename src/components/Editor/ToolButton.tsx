// FILE: src/components/Editor/ToolButton.tsx
// ------------------------------------------

"use client";

import React, { FC } from "react";

const ToolButton: FC<{
  onClick: () => void;
  isActive: boolean;
  children: React.ReactNode;
  title: string;
  disabled?: boolean;
}> = ({ onClick, isActive, children, title }) => (
  <button
    onClick={onClick}
    title={title}
    className={`p-3 rounded-xl transition-colors ${
      isActive
        ? "bg-purple-100 text-purple-600"
        : "hover:bg-slate-200 text-slate-500"
    }`}
  >
    {children}
  </button>
);

export default ToolButton;