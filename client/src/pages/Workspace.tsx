import { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { type Agent, type Folder } from '../types/agent';
import { useContextMenu } from '../contexts/ContextMenuContext';
import AgentModal from '../components/AgentModal';

interface WorkspaceContext {
  agents: Agent[];
  folders: Folder[];
  loading: boolean;
  onMoveItem?: (itemType: 'AGENT' | 'FOLDER', itemId: string, targetFolderId: string | null) => void;
}

export default function Workspace() {
  const { agents, folders = [], loading, onMoveItem } = useOutletContext<WorkspaceContext>();
  const { openContextMenu } = useContextMenu();
  
  const [path, setPath] = useState<{id: string, name: string}[]>([]);
  const [dragOverTarget, setDragOverTarget] = useState<string | null | undefined>(undefined);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  const currentFolderId = path.length > 0 ? path[path.length - 1].id : null;
  const currentFolderName = path.length > 0 ? path[path.length - 1].name : 'Workspace';

  const currentView = useMemo(() => {
    return {
      folders: folders.filter(f => f.parent_id === currentFolderId),
      agents: agents.filter(a => a.folder_id === currentFolderId)
    };
  }, [folders, agents, currentFolderId]);

  const handleNavigate = (folder: Folder) => {
    setPath(prev => [...prev, { id: folder.id, name: folder.name }]);
  };

  const handleBreadcrumbClick = (index: number) => {
    if (index === -1) setPath([]);
    else setPath(path.slice(0, index + 1));
  };

  // --- REBUILT DRAG AND DROP HANDLERS ---
  const handleDragStart = (e: React.DragEvent, type: 'AGENT' | 'FOLDER', id: string) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ type, id }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, targetId: string | null) => {
    e.preventDefault();
    e.stopPropagation(); // 2. Stop the flicker! Prevents parent container from stealing the hover state.
    e.dataTransfer.dropEffect = 'move';
    if (dragOverTarget !== targetId) setDragOverTarget(targetId);
  };

  const handleDrop = (e: React.DragEvent, targetFolderId: string | null) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverTarget(undefined); // 3. Reset to undefined, not null
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      if (onMoveItem) {
        onMoveItem(data.type, data.id, targetFolderId);
      }
    } catch (err) {
      console.error("Invalid drop data");
    }
  };

  if (loading) {
    return <div className="p-8 text-gray-500 flex items-center justify-center h-full">Loading workspace data...</div>;
  }

  return (
    <div 
      className="workspace_explorer min-h-full flex-1 flex flex-col p-4 md:p-6 bg-transparent relative"
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        openContextMenu(e, 'workspace', currentFolderId, currentFolderName);
      }}
      onDragOver={(e) => handleDragOver(e, currentFolderId)}
      onDrop={(e) => handleDrop(e, currentFolderId)}
      onDragLeave={() => setDragOverTarget(undefined)} // <-- CHANGE THIS LINE
    >
      
      {/* BREADCRUMBS */}
      <div className="directory_bar flex items-center gap-2 mb-6 px-4 py-3 bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm text-sm font-medium overflow-x-auto whitespace-nowrap">
        <button 
          onClick={() => handleBreadcrumbClick(-1)}
          onDragOver={(e) => handleDragOver(e, null)}
          onDrop={(e) => handleDrop(e, null)}
          className={`flex items-center gap-2 px-2 py-1 rounded transition-colors focus:outline-none ${dragOverTarget === null ? 'bg-primary/20 ring-2 ring-primary text-primary' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Workspace
        </button>
        
        {path.map((segment, index) => {
          const isTarget = dragOverTarget === segment.id;
          return (
            <div key={segment.id} className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <button 
                onClick={() => handleBreadcrumbClick(index)}
                onDragOver={(e) => handleDragOver(e, segment.id)}
                onDrop={(e) => handleDrop(e, segment.id)}
                className={`px-2 py-1 rounded transition-colors focus:outline-none ${isTarget ? 'bg-primary/20 ring-2 ring-primary text-primary' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                {segment.name}
              </button>
            </div>
          );
        })}
      </div>

      {/* GRID VIEW (Added padding to prevent outline clipping) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 overflow-y-auto pb-10 px-2 pt-2 custom-scrollbar flex-1 content-start">
        
        {/* FOLDERS */}
        {currentView.folders.map(folder => {
          const isDragTarget = dragOverTarget === folder.id;
          return (
            <div 
              key={folder.id}
              draggable
              onDragStart={(e) => handleDragStart(e, 'FOLDER', folder.id)}
              onDragOver={(e) => { e.stopPropagation(); handleDragOver(e, folder.id); }}
              onDrop={(e) => { e.stopPropagation(); handleDrop(e, folder.id); }}
              onClick={() => handleNavigate(folder)}
              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                openContextMenu(e, 'category', folder.id, folder.name);
              }}
              // FIX: Replaced border hacks with 'outline' so it doesn't clip or shift layout!
              className={`folder_card group flex flex-col items-center justify-center p-4 rounded-xl transition-all cursor-grab active:cursor-grabbing select-none relative ${isDragTarget ? 'bg-primary/10 outline-2 outline-primary outline-dashed outline-offset-2 scale-105 z-10' : 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            >
              <svg className={`w-16 h-16 mb-3 transition-all duration-200 ${isDragTarget ? 'text-primary' : 'text-gray-400 dark:text-gray-500 group-hover:text-primary dark:group-hover:text-primary/80 group-hover:scale-105'}`} fill="currentColor" viewBox="0 0 24 24">
                 <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
              </svg>
              <span className={`text-sm font-medium text-center w-full truncate px-1 ${isDragTarget ? 'text-primary' : 'text-gray-700 dark:text-gray-300'}`}>
                {folder.name}
              </span>
            </div>
          );
        })}

        {/* AGENTS */}
        {currentView.agents.map(agent => (
          <div 
            key={agent.id}
            draggable
            onDragStart={(e) => handleDragStart(e, 'AGENT', agent.id)}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
              openContextMenu(e, 'agent', agent.id, agent.name);
            }}
            onClick={() => setSelectedAgent(agent)}
            className="agent_card group flex flex-col items-center justify-center p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm transition-all cursor-pointer select-none bg-white dark:bg-gray-900/50"
          >
            <div className="w-14 h-14 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3 group-hover:scale-105 group-hover:border-primary/50 transition-all border border-gray-200 dark:border-gray-700">
              <svg className="w-8 h-8 text-gray-500 dark:text-gray-400 group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 14.25h.008v.008H8.25v-.008zm5.25 0h.008v.008h-.008v-.008zM19.5 7.125v1.5c0 .621-.504 1.125-1.125 1.125h-.375V15a2.25 2.25 0 01-2.25 2.25h-7.5A2.25 2.25 0 016 15V9.75h-.375A1.125 1.125 0 014.5 8.625v-1.5A1.125 1.125 0 015.625 7.5h12.75a1.125 1.125 0 011.125 1.125zM12 4.5v2.25" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center w-full line-clamp-2 px-1">
              {agent.name}
            </span>
          </div>
        ))}
      </div>

      {selectedAgent && (
        <AgentModal 
          agent={selectedAgent} 
          onClose={() => setSelectedAgent(null)} 
        />
      )}

    </div>
  );
}