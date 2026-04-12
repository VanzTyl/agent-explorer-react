import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

// Added 'workspace' as a global target type
export type ContextTargetType = 'workspace' | 'agent' | 'folder' | 'category' | 'sub_category' | null;

interface ContextMenuState {
  isOpen: boolean;
  x: number;
  y: number;
  targetType: ContextTargetType;
  targetId: string | null;
  targetName: string | null;
}

interface ContextMenuContextType {
  contextMenu: ContextMenuState;
  openContextMenu: (e: React.MouseEvent, type: ContextTargetType, id?: string | null, name?: string | null) => void;
  closeContextMenu: () => void;
}

const ContextMenuContext = createContext<ContextMenuContextType | undefined>(undefined);

export function ContextMenuProvider({ children }: { children: ReactNode }) {
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    isOpen: false,
    x: 0,
    y: 0,
    targetType: null,
    targetId: null,
    targetName: null,
  });

  const openContextMenu = useCallback(
    (e: React.MouseEvent, type: ContextTargetType, id: string | null = null, name: string | null = null) => {
      e.preventDefault();
      e.stopPropagation(); // Prevents clicks on agents from bubbling up to the workspace
      setContextMenu({ isOpen: true, x: e.clientX, y: e.clientY, targetType: type, targetId: id, targetName: name });
    },
    []
  );

  const closeContextMenu = useCallback(() => {
    setContextMenu((prev) => (prev.isOpen ? { ...prev, isOpen: false } : prev));
  }, []);

  useEffect(() => {
    if (contextMenu.isOpen) {
      document.addEventListener('click', closeContextMenu);
      document.addEventListener('contextmenu', closeContextMenu); // Closes menu if you right-click the header
      document.addEventListener('scroll', closeContextMenu, true);
    }
    return () => {
      document.removeEventListener('click', closeContextMenu);
      document.removeEventListener('contextmenu', closeContextMenu);
      document.removeEventListener('scroll', closeContextMenu, true);
    };
  }, [contextMenu.isOpen, closeContextMenu]);

  return (
    <ContextMenuContext.Provider value={{ contextMenu, openContextMenu, closeContextMenu }}>
      {children}
    </ContextMenuContext.Provider>
  );
}

export function useContextMenu() {
  const context = useContext(ContextMenuContext);
  if (context === undefined) throw new Error('useContextMenu must be used within a ContextMenuProvider');
  return context;
}