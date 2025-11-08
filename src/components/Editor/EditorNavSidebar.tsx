"use client";

import React from "react";
import { EditorTab } from "./index";

// --- SVG Icons (Placeholders based on Figma) ---
// You can replace these with your actual icon components if you have them

const BackgroundIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M21 19V5C21 3.9 20.1 3 19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19ZM8.5 13.5L11 16.51L14.5 12L19 18H5L8.5 13.5Z"
      fill="currentColor"
    />
  </svg>
);

const CutoutIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M17.63 7H14.28L19.95 12.67L17.63 7ZM7.05 12.69L11.72 8H8.37L7.05 12.69ZM12 17.69L9.93 13.6L7 13.04V14.04L9.9 14.58L12 18.69L14.1 14.58L17 14.04V13.04L14.07 13.6L12 17.69ZM18.4 4L22 4V6H19.98L18.4 4ZM19.98 18H22V20L18.4 20L19.98 18ZM4 4H5.6L4 6H2V4ZM4 20H2V18H4.02L5.6 20H4Z"
      fill="currentColor"
    />
  </svg>
);

const EffectIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 2.25C12.41 2.25 12.75 2.59 12.75 3V5.25C12.75 5.66 12.41 6 12 6C11.59 6 11.25 5.66 11.25 5.25V3C11.25 2.59 11.59 2.25 12 2.25ZM18.75 11.25H21C21.41 11.25 21.75 11.59 21.75 12C21.75 12.41 21.41 12.75 21 12.75H18.75C18.34 12.75 18 12.41 18 12C18 11.59 18.34 11.25 18.75 11.25ZM11.25 18.75H12.75C12.75 18.34 12.41 18 12 18C11.59 18 11.25 18.34 11.25 18.75V21C11.25 21.41 11.59 21.75 12 21.75C12.41 21.75 12.75 21.41 12.75 21V18.75ZM5.25 11.25H3C2.59 11.25 2.25 11.59 2.25 12C2.25 12.41 2.59 12.75 3 12.75H5.25C5.66 12.75 6 12.41 6 12C6 11.59 5.66 11.25 5.25 11.25ZM18 12C18 8.69 15.31 6 12 6C8.69 6 6 8.69 6 12C6 15.31 8.69 18 12 18C15.31 18 18 15.31 18 12Z"
      fill="currentColor"
    />
  </svg>
);

const AdjustIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3 17V19H9V17H3ZM3 5V7H13V5H3ZM13 21V19H21V17H13V15H11V21H13ZM7 9V11H3V13H7V15H9V9H7ZM21 13V11H11V13H21ZM15 9H17V7H21V5H17V3H15V9Z"
      fill="currentColor"
    />
  </svg>
);

const DesignIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 2H2V12H12V2ZM10 10H4V4H10V10ZM12 14H2V22H12V14ZM10 20H4V16H10V20ZM22 2H14V12H22V2ZM20 10H16V4H20V10ZM22 14H14V22H22V14ZM20 20H16V16H20V20Z"
      fill="currentColor"
    />
  </svg>
);

// --- Reusable NavButton Component ---
interface NavButtonProps {
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}

const NavButton: React.FC<NavButtonProps> = ({
  label,
  icon,
  isActive,
  onClick,
}) => (
  <button
    onClick={onClick}
    title={label}
    className={`flex flex-col items-center justify-center gap-1 w-full h-20 transition-colors
      ${
        isActive
          ? "text-blue-600 bg-blue-50 border-r-2 border-blue-600"
          : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
      }`}
  >
    <div className="w-6 h-6">{icon}</div>
    <span className="text-xs font-semibold">{label}</span>
  </button>
);

// --- Main Sidebar Component ---
interface EditorNavSidebarProps {
  activeTab: EditorTab;
  onTabChange: (tab: EditorTab) => void;
}

const navItems = [
  { id: "backgrounds", label: "Backgrounds", icon: <BackgroundIcon /> },
  { id: "cutout", label: "Cutout", icon: <CutoutIcon /> },
  { id: "effect", label: "Effect", icon: <EffectIcon /> },
  { id: "adjust", label: "Adjust", icon: <AdjustIcon /> },
  { id: "design", label: "Design", icon: <DesignIcon /> },
] as const;

const EditorNavSidebar: React.FC<EditorNavSidebarProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <aside className="w-24 bg-white flex-shrink-0 border-r border-gray-200 flex flex-col items-center py-4">
      {navItems.map((item) => (
        <NavButton
          key={item.id}
          label={item.label}
          icon={item.icon}
          isActive={activeTab === item.id}
          onClick={() => onTabChange(item.id)}
        />
      ))}
    </aside>
  );
};

export default EditorNavSidebar;