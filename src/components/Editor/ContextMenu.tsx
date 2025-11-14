"use client";

import React, { FC, useState, useRef, useLayoutEffect } from "react";

// --- Icons (Keep existing icons) ---
const DuplicateIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
);
const DeleteIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
);
const LayersIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
);
const ChevronRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
);
const UpIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15"></polyline></svg>;
const DownIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>;
const TopIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15"></polyline><line x1="12" y1="9" x2="12" y2="3"></line></svg>;
const BottomIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline><line x1="12" y1="15" x2="12" y2="21"></line></svg>;

interface ContextMenuProps {
  position: { x: number; y: number } | null;
  onClose: () => void;
  // Actions
  onDuplicate: () => void;
  onDelete: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
}

const ContextMenu: FC<ContextMenuProps> = ({
  position,
  onClose,
  onDuplicate,
  onDelete,
  onBringForward,
  onSendBackward,
  onBringToFront,
  onSendToBack,
}) => {
  const [showLayersSubmenu, setShowLayersSubmenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const submenuRef = useRef<HTMLDivElement>(null);

  // State to hold calculated positions
  const [menuCoords, setMenuCoords] = useState({ top: 0, left: 0 });
  const [submenuDirection, setSubmenuDirection] = useState<'right' | 'left'>('right');
  const [submenuVertical, setSubmenuVertical] = useState<'bottom' | 'top'>('bottom');

  // Calculate position before paint
  useLayoutEffect(() => {
    if (!position || !menuRef.current) return;

    const menu = menuRef.current;
    const rect = menu.getBoundingClientRect();
    
    let x = position.x;
    let y = position.y;

    // 1. Vertical Check (Bottom edge)
    // If menu goes off bottom, flip it upwards
    if (y + rect.height > window.innerHeight) {
      y = y - rect.height;
    }

    // 2. Horizontal Check (Right edge)
    // If menu goes off right, move it left
    if (x + rect.width > window.innerWidth) {
      x = x - rect.width;
    }

    setMenuCoords({ top: y, left: x });

    // 3. Submenu Logic
    // Default: Open to the right
    let subDir: 'right' | 'left' = 'right';
    // If not enough space on right, open to left
    if (x + rect.width + 200 > window.innerWidth) { 
      subDir = 'left';
    }
    setSubmenuDirection(subDir);

    // Vertical submenu check
    // If the menu was flipped up, the submenu usually aligns top-to-top
    // But if we are near bottom, we might want to align bottom-up
    if (y + 200 > window.innerHeight) {
        setSubmenuVertical('top');
    } else {
        setSubmenuVertical('bottom');
    }

  }, [position]);

  if (!position) return null;

  return (
    <>
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose} 
        onContextMenu={(e) => e.preventDefault()} 
      />

      <div
        ref={menuRef}
        className="fixed z-[9999] bg-white rounded-lg shadow-xl border border-gray-100 py-1 w-48 text-sm text-gray-700"
        style={{ top: menuCoords.top, left: menuCoords.left }}
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* Duplicate */}
        <button
          onClick={onDuplicate}
          className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 text-left"
        >
          <DuplicateIcon />
          Duplicate
        </button>

        {/* Delete */}
        <button
          onClick={onDelete}
          className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 text-left text-red-600"
        >
          <DeleteIcon />
          Delete
        </button>

        <div className="h-px bg-gray-200 my-1 mx-2" />

        {/* Layers Order (Has Submenu) */}
        <div
          className="relative"
          onMouseEnter={() => setShowLayersSubmenu(true)}
          onMouseLeave={() => setShowLayersSubmenu(false)}
        >
          <button className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-gray-50 text-left">
            <div className="flex items-center gap-3">
              <LayersIcon />
              Layers order
            </div>
            <ChevronRightIcon />
          </button>

          {/* Nested Submenu */}
          {showLayersSubmenu && (
            <div 
                ref={submenuRef}
                className={`absolute w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-1
                    ${submenuDirection === 'right' ? 'left-full ml-1' : 'right-full mr-1'}
                    ${submenuVertical === 'bottom' ? 'top-0' : 'bottom-0'}
                `}
            >
              <button onClick={onBringToFront} className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 text-left">
                <TopIcon /> Bring to Front
              </button>
              <button onClick={onBringForward} className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 text-left">
                <UpIcon /> Bring Forward
              </button>
              <button onClick={onSendBackward} className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 text-left">
                <DownIcon /> Send Backward
              </button>
              <button onClick={onSendToBack} className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 text-left">
                <BottomIcon /> Send to Back
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ContextMenu;