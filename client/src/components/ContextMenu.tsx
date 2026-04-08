import { useEffect, useRef, useState } from 'react';
import { type ContextTargetType } from '../contexts/ContextMenuContext.tsx';

interface ContextMenuProps {
  isOpen: boolean;
  x: number;
  y: number;
  targetType: ContextTargetType;
  targetName: string | null;
  onAction: (action: string) => void;
}

export default function ContextMenu({ isOpen, x, y, targetType, targetName, onAction }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: y, left: x });

  useEffect(() => {
    if (isOpen && menuRef.current) {
      const { innerWidth, innerHeight } = window;
      const { offsetWidth, offsetHeight } = menuRef.current;
      const adjustedX = x + offsetWidth > innerWidth ? innerWidth - offsetWidth - 8 : x;
      const adjustedY = y + offsetHeight > innerHeight ? innerHeight - offsetHeight - 8 : y;
      setPosition({ top: adjustedY, left: adjustedX });
    }
  }, [isOpen, x, y]);

  if (!isOpen) return null;

  const handleAction = (e: React.MouseEvent, action: string) => {
    e.stopPropagation();
    onAction(action);
  };

  return (
    <div
      ref={menuRef}
      className="context_menu_container fixed z-50 min-w-48 py-1 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-200"
      style={{ top: position.top, left: position.left }}
    >
      {targetName && (
        <div className="context_header px-3 py-2 border-b border-gray-100 dark:border-gray-700 text-xs font-semibold text-gray-400 uppercase tracking-wider truncate">
          {targetName}
        </div>
      )}

      <div className="context_actions_group flex flex-col py-1">
        
        {/* Workspace Actions */}
        {targetType === 'workspace' && (
          <>
            <button onClick={(e) => handleAction(e, 'create_agent')} className="context_action_btn flex items-center w-full px-3 py-1.5 hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white transition-colors text-left focus:outline-none">
              New Agent...
            </button>
            <button onClick={(e) => handleAction(e, 'create_folder')} className="context_action_btn flex items-center w-full px-3 py-1.5 hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white transition-colors text-left focus:outline-none">
              Create Folder...
            </button>
            <div className="context_divider h-px bg-gray-200 dark:bg-gray-700 my-1"></div>
            <button onClick={(e) => handleAction(e, 'refresh_workspace')} className="context_action_btn flex items-center w-full px-3 py-1.5 hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white transition-colors text-left focus:outline-none">
              Refresh Workspace
            </button>
          </>
        )}

        {/* Folder Specific Actions (Under the hood, these are still the category groupings) */}
        {(targetType === 'category' || targetType === 'sub_category') && (
          <>
            <button onClick={(e) => handleAction(e, 'create_agent')} className="context_action_btn flex items-center w-full px-3 py-1.5 hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white transition-colors text-left focus:outline-none">
              New Agent...
            </button>
            <button onClick={(e) => handleAction(e, 'create_folder')} className="context_action_btn flex items-center w-full px-3 py-1.5 hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white transition-colors text-left focus:outline-none">
              Create Folder...
            </button>
            <div className="context_divider h-px bg-gray-200 dark:bg-gray-700 my-1"></div>
            <button onClick={(e) => handleAction(e, 'delete_folder')} className="context_action_btn flex items-center w-full px-3 py-1.5 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white transition-colors text-left focus:outline-none">
              Delete Folder
            </button>
          </>
        )}

        {/* Agent Specific Actions */}
        {targetType === 'agent' && (
          <>
            <button onClick={(e) => handleAction(e, 'edit_agent')} className="context_action_btn flex items-center w-full px-3 py-1.5 hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white transition-colors text-left focus:outline-none">
              Edit Agent Settings
            </button>
            <div className="context_divider h-px bg-gray-200 dark:bg-gray-700 my-1"></div>
            <button onClick={(e) => handleAction(e, 'delete_agent')} className="context_action_btn flex items-center w-full px-3 py-1.5 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white transition-colors text-left focus:outline-none">
              Delete Agent
            </button>
          </>
        )}
      </div>
    </div>
  );
}