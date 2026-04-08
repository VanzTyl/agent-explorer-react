import { useState, useEffect, useCallback } from 'react';

export type ContextTargetType = 'agent' | 'category' | 'sub_category' | null;

interface ContextMenuState {
  isOpen: boolean;
  x: number;
  y: number;
  targetType: ContextTargetType;
  targetId: string | null;
  targetName: string | null;
}

export function useContextMenu() {
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    isOpen: false,
    x: 0,
    y: 0,
    targetType: null,
    targetId: null,
    targetName: null,
  });

  const openContextMenu = useCallback(
    (e: React.MouseEvent, type: ContextTargetType, id: string, name: string) => {
      e.preventDefault(); // Prevent the default browser context menu
      e.stopPropagation();
      
      setContextMenu({
        isOpen: true,
        x: e.clientX,
        y: e.clientY,
        targetType: type,
        targetId: id,
        targetName: name,
      });
    },
    []
  );

  const closeContextMenu = useCallback(() => {
    setContextMenu((prev) => (prev.isOpen ? { ...prev, isOpen: false } : prev));
  }, []);

  // Close the menu if the user clicks anywhere else or scrolls the page
  useEffect(() => {
    if (contextMenu.isOpen) {
      document.addEventListener('click', closeContextMenu);
      document.addEventListener('scroll', closeContextMenu, true);
    }
    return () => {
      document.removeEventListener('click', closeContextMenu);
      document.removeEventListener('scroll', closeContextMenu, true);
    };
  }, [contextMenu.isOpen, closeContextMenu]);

  return { contextMenu, openContextMenu, closeContextMenu };
}