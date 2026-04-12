import { useState, useMemo } from 'react';
import { type Agent, type Folder } from '../types/agent';
import { useContextMenu } from '../contexts/ContextMenuContext';

interface FileTreeProps {
  agents: Agent[];
  folders?: Folder[];
  loading: boolean;
  onMoveItem?: (itemType: 'AGENT' | 'FOLDER', itemId: string, targetFolderId: string | null) => void;
}

// Custom type to handle infinite nesting depth
type TreeNodeType = {
  type: 'FOLDER' | 'AGENT';
  id: string;
  name: string;
  data: Folder | Agent;
  children: TreeNodeType[];
};

export default function FileTree({ agents = [], folders = [], loading, onMoveItem }: FileTreeProps) {
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [dragOverTarget, setDragOverTarget] = useState<string | null | undefined>(undefined);
  const { openContextMenu } = useContextMenu();

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => ({ ...prev, [folderId]: !prev[folderId] }));
  };

  // --- DRAG AND DROP HANDLERS (Matches Workspace logic) ---
  const handleDragStart = (e: React.DragEvent, type: 'AGENT' | 'FOLDER', id: string) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ type, id }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, targetId: string | null) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverTarget !== targetId) setDragOverTarget(targetId);
  };

  const handleDrop = (e: React.DragEvent, targetFolderId: string | null) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverTarget(undefined);
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      if (onMoveItem) {
        onMoveItem(data.type, data.id, targetFolderId);
      }
    } catch (err) {
      console.error("Invalid drop data");
    }
  };

  // --- RECURSIVELY BUILD THE TREE DATA ---
  const treeData = useMemo(() => {
    const buildTree = (parentId: string | null): TreeNodeType[] => {
      const nodes: TreeNodeType[] = [];

      // 1. Find all folders at this exact depth
      const childFolders = folders.filter(f => f.parent_id === parentId);
      childFolders.sort((a, b) => a.name.localeCompare(b.name)); // Alphabetical
      
      childFolders.forEach(f => {
        nodes.push({
          type: 'FOLDER',
          id: f.id,
          name: f.name,
          data: f,
          children: buildTree(f.id) // Recursively find sub-folders/agents
        });
      });

      // 2. Find all agents at this exact depth
      const childAgents = agents.filter(a => a.folder_id === parentId);
      childAgents.sort((a, b) => a.name.localeCompare(b.name));
      
      childAgents.forEach(a => {
        nodes.push({
          type: 'AGENT',
          id: a.id,
          name: a.name,
          data: a,
          children: []
        });
      });

      return nodes;
    };

    return buildTree(null);
  }, [folders, agents]);

  if (loading) {
    return <div className="loading_indicator p-4 text-sm text-gray-500">Loading sidebar...</div>;
  }

  // --- RECURSIVELY RENDER THE TREE UI ---
  const renderTree = (nodes: TreeNodeType[], depth: number = 0) => {
    return nodes.map(node => {
      if (node.type === 'FOLDER') {
        const isExpanded = expandedFolders[node.id];
        const isTarget = dragOverTarget === node.id;

        return (
          <div key={`folder-${node.id}`} className="flex flex-col w-full">
            <button
              onClick={() => toggleFolder(node.id)}
              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                openContextMenu(e, 'category', node.id, node.name);
              }}
              draggable
              onDragStart={(e) => handleDragStart(e, 'FOLDER', node.id)}
              onDragOver={(e) => handleDragOver(e, node.id)}
              onDrop={(e) => handleDrop(e, node.id)}
              onDragLeave={() => setDragOverTarget(undefined)}
              className={`folder_btn flex items-center justify-between w-full py-1.5 pr-2 rounded-md transition-colors focus:outline-none ${isTarget ? 'bg-primary/20 ring-1 ring-primary' : 'hover:bg-primary/10'}`}
              style={{ paddingLeft: `${depth * 1 + 0.5}rem` }} // Dynamic indenting!
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <svg className="folder_icon w-4 h-4 text-primary shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
                </svg>
                <span className="truncate text-gray-700 dark:text-gray-300 font-medium">{node.name}</span>
              </div>
              <svg 
                className={`w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0 ${isExpanded ? 'rotate-90' : ''}`} 
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            
            {/* Render nested children if expanded */}
            {isExpanded && node.children.length > 0 && (
              <div className="flex flex-col w-full mt-1 gap-1">
                {renderTree(node.children, depth + 1)}
              </div>
            )}
          </div>
        );
      } else {
        // RENDER AGENT
        return (
          <button
            key={`agent-${node.id}`}
            draggable
            onDragStart={(e) => handleDragStart(e, 'AGENT', node.id)}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
              openContextMenu(e, 'agent', node.id, node.name);
            }}
            className="agent_file_btn flex items-center gap-2 py-1.5 pr-2 rounded-md hover:bg-primary/10 transition-colors w-full text-left focus:outline-none"
            style={{ paddingLeft: `${depth * 1 + 0.5}rem` }}
          >
            <svg className="agent_icon w-4 h-4 text-gray-500 dark:text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 14.25h.008v.008H8.25v-.008zm5.25 0h.008v.008h-.008v-.008zM19.5 7.125v1.5c0 .621-.504 1.125-1.125 1.125h-.375V15a2.25 2.25 0 01-2.25 2.25h-7.5A2.25 2.25 0 016 15V9.75h-.375A1.125 1.125 0 014.5 8.625v-1.5A1.125 1.125 0 015.625 7.5h12.75a1.125 1.125 0 011.125 1.125zM12 4.5v2.25" />
            </svg>
            <span className="truncate text-gray-600 dark:text-gray-400 font-medium">{node.name}</span>
          </button>
        );
      }
    });
  };

  const isRootTarget = dragOverTarget === null;

  return (
    <div 
      // The entire container acts as a droppable area for the Root workspace
      className={`file_tree_container flex flex-col gap-1 w-full text-sm min-h-full pb-10 transition-colors ${isRootTarget ? 'bg-primary/5 ring-1 ring-primary/30 rounded-lg' : ''}`}
      onDragOver={(e) => handleDragOver(e, null)}
      onDrop={(e) => handleDrop(e, null)}
      onDragLeave={() => setDragOverTarget(undefined)}
    >
      {renderTree(treeData)}
      
      {treeData.length === 0 && (
        <div className="px-4 py-6 text-center text-gray-400 dark:text-gray-500 italic">
          Workspace is empty
        </div>
      )}
    </div>
  );
}