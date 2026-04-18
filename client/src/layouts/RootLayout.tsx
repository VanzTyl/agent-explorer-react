import { useState, useMemo } from 'react';
import { Outlet } from 'react-router-dom';
import ThemeSwitcher from '../components/ThemeSwitcher.tsx';
import FileTree from '../components/FileTree.tsx';
import ContextMenu from '../components/ContextMenu.tsx';
import { ContextMenuProvider, useContextMenu } from '../contexts/ContextMenuContext.tsx';
import FolderFormModal from '../components/FolderFormModal.tsx';
import AgentFormModal from '../components/AgentFormModal.tsx';
import { type Agent, type Folder } from '../types/agent.ts';
import { useAgents } from '../hooks/useAgents.ts';
import { useFolders } from '../hooks/useFolders.ts';
import ConfirmationModal from '../components/ConfirmationModal.tsx';

function RootLayoutInner() {
  const { openContextMenu, contextMenu, closeContextMenu } = useContextMenu();
  
  const { agents, loading: agentsLoading, createAgent, updateAgent, deleteAgent, moveAgent, refetch: refetchAgents } = useAgents();
  const { folders, loading: foldersLoading, createFolder, updateFolder, deleteFolder, refetchFolders, moveFolder } = useFolders();

  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [folderParentId, setFolderParentId] = useState<string | null>(null);
  const [folderModalData, setFolderModalData] = useState<{ id: string; name: string } | null>(null);

  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
  const [agentModalData, setAgentModalData] = useState<Agent | null>(null);
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);

  // Global Search State
  const [searchQuery, setSearchQuery] = useState('');

  // NEW: State for the unified confirmation and error modals
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string | React.ReactNode;
    confirmLabel?: string;
    type: 'danger' | 'info' | 'error';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: () => {}
  });

  const closeConfirmModal = () => setConfirmModal(prev => ({ ...prev, isOpen: false }));

  const showErrorModal = (message: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Operation Failed',
      message,
      type: 'error',
      confirmLabel: 'Understood',
      onConfirm: closeConfirmModal
    });
  };

  // Deep filter agents based on search query
  const filteredAgents = useMemo(() => {
    if (!searchQuery.trim()) return agents;
    const query = searchQuery.toLowerCase();
    
    return agents.filter(agent => 
      agent.name.toLowerCase().includes(query) ||
      agent.categories?.some(c => c.toLowerCase().includes(query)) ||
      agent.sub_categories?.some(s => s.toLowerCase().includes(query)) ||
      agent.sub_prompts?.some(prompt => 
        prompt.sub_prompt_name.toLowerCase().includes(query) ||
        prompt.sub_prompt_content.toLowerCase().includes(query)
      )
    );
  }, [agents, searchQuery]);

  const handleContextAction = (action: string) => {
    closeContextMenu();

    if (action === 'create_folder') {
      setFolderModalData(null);
      // FIX: Trust the targetId passed from the context menu, regardless of type!
      setFolderParentId(contextMenu.targetId || null);
      setIsFolderModalOpen(true);
    }

    if (action === 'rename_folder' && contextMenu.targetId && contextMenu.targetName) {
      setFolderModalData({ id: contextMenu.targetId, name: contextMenu.targetName });
      setIsFolderModalOpen(true);
    }

    if (action === 'refresh_workspace') {
      refetchAgents();
      refetchFolders();
    }

    if (action === 'create_agent') {
      setAgentModalData(null); 
      // FIX: Trust the targetId passed from the context menu here too!
      setActiveFolderId(contextMenu.targetId || null);
      setIsAgentModalOpen(true);
    } 
    
    if (action === 'edit_agent' && contextMenu.targetId) {
      const agentToEdit = agents.find(a => a.id === contextMenu.targetId);
      if (agentToEdit) {
        setAgentModalData(agentToEdit);
        setActiveFolderId(agentToEdit.folder_id || null);
        setIsAgentModalOpen(true);
      }
    }

    if (action === 'delete_folder' && contextMenu.targetId) {
      setConfirmModal({
        isOpen: true,
        title: 'Delete Folder?',
        message: `Are you sure you want to delete "${contextMenu.targetName}"? This will permanently remove all agents and sub-folders inside it.`,
        confirmLabel: 'Delete Everything',
        type: 'danger',
        onConfirm: () => {
          deleteFolder(contextMenu.targetId!).then(() => {
            refetchFolders();
            refetchAgents();
            closeConfirmModal();
          });
        }
      });
    }

    if (action === 'delete_agent' && contextMenu.targetId) {
      setConfirmModal({
        isOpen: true,
        title: 'Delete Agent?',
        message: `Are you sure you want to delete the agent "${contextMenu.targetName}"?`,
        confirmLabel: 'Delete Agent',
        type: 'danger',
        onConfirm: () => {
          deleteAgent(contextMenu.targetId!).then(() => {
            refetchAgents();
            closeConfirmModal();
          });
        }
      });
    }
  };

  const handleSaveFolder = async (data: Partial<Folder>) => {
    try {
      if (folderModalData && data.name) {
        // FIX: Passed the whole data object instead of just data.name to match the new hook signature and contract
        await updateFolder(folderModalData.id, data);
      } else {
        await createFolder(data);
      }
    } catch (err) {
      console.error("Failed to save folder", err);
    }
  };

  const handleSaveAgent = async (data: Partial<Agent>) => {
    if (agentModalData && agentModalData.id) {
      await updateAgent(agentModalData.id, data);
    } else {
      await createAgent(data);
    }
    await refetchAgents(); 
    setIsAgentModalOpen(false);
  };

    const handleMoveItem = async (itemType: 'AGENT' | 'FOLDER', itemId: string, targetFolderId: string | null) => {
    if (itemType === 'AGENT') {
      try {
        console.log(`📡 [RootLayout] Orchestrating Agent Move: ${itemId} -> ${targetFolderId}`);
        await moveAgent(itemId, targetFolderId);
        // We refetch to ensure the UI perfectly reflects the backend state
        await refetchAgents();
      } catch (error) {
        console.error("Failed to move agent.", error);
        showErrorModal("Failed to move agent. Please check your connection or database status.");
      }
    } else if (itemType === 'FOLDER') {
      try {
        if (itemId === targetFolderId) return; // Prevent putting a folder inside itself
        await moveFolder(itemId, targetFolderId);
        await refetchFolders();
      } catch (error) {
        console.error("Failed to move folder.", error);
        showErrorModal("Failed to move folder. It may have a name conflict or circular dependency.");
      }
    }
  };


  const isGlobalLoading = agentsLoading || foldersLoading;

  return (
    <div className="root_layout flex h-screen w-full bg-primary/5 dark:bg-gray-950 transition-colors duration-300">
      
      {/* SIDEBAR */}
      <aside className="sidebar_container hidden md:flex flex-col w-64 border-r border-primary/20 dark:border-primary/20 bg-white/50 dark:bg-primary/10 backdrop-blur-sm transition-colors duration-300">
        <div className="sidebar_header flex flex-col p-4 border-b border-primary/20 dark:border-primary/20 h-18.25 justify-center">
          <span className="brand_title font-bold text-lg text-primary transition-colors duration-300">
            Agent Explorer
          </span>
        </div>
        
        <nav 
          className="sidebar_navigation flex-1 overflow-y-auto p-2 custom-scrollbar"
          onContextMenu={(e) => openContextMenu(e, 'workspace', null, 'Workspace')}
        >
          {/* NEW: Passed folders and handleMoveItem! */}
          <FileTree agents={filteredAgents} folders={folders} loading={isGlobalLoading} onMoveItem={handleMoveItem} />
        </nav>
      </aside>

      <main className="main_content_area flex-1 flex flex-col relative overflow-hidden">
        
        {/* WORKSPACE HEADER */}
        <header className="workspace_header flex items-center justify-between p-4 border-b border-primary/20 dark:border-primary/20 bg-white/50 dark:bg-primary/10 backdrop-blur-sm h-18.25">
           <span className="brand_title_mobile md:hidden font-bold text-primary transition-colors duration-300 whitespace-nowrap mr-4">
            Agent Explorer
          </span>

          <div className="search_bar_wrapper flex-1 max-w-2xl mx-auto relative group">
            <svg className="icon_search absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name, category, or prompt text..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search_input w-full pl-10 pr-4 py-2 bg-gray-100/80 dark:bg-gray-800/80 border border-transparent focus:border-primary/50 focus:bg-white dark:focus:bg-gray-900 rounded-lg text-sm outline-none transition-all text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:shadow-sm"
            />
          </div>

          <div className="header_controls flex items-center ml-4">
             <ThemeSwitcher />
          </div>
        </header>
        
        {/* WORKSPACE AREA */}
        <div className="content_wrapper flex-1 flex flex-col relative overflow-hidden bg-white dark:bg-gray-900">
          <Outlet context={{ agents: filteredAgents, folders, loading: isGlobalLoading, onMoveItem: handleMoveItem }} />
        </div>
      </main>

      <ContextMenu 
        isOpen={contextMenu.isOpen}
        x={contextMenu.x}
        y={contextMenu.y}
        targetType={contextMenu.targetType}
        targetName={contextMenu.targetName}
        onAction={handleContextAction}
      />

      <FolderFormModal 
        isOpen={isFolderModalOpen}
        onClose={() => setIsFolderModalOpen(false)}
        onSave={handleSaveFolder}
        parentId={folderParentId} 
        initialData={folderModalData}
        folders={folders}
      />
      
      <AgentFormModal 
        isOpen={isAgentModalOpen}
        onClose={() => setIsAgentModalOpen(false)}
        initialData={agentModalData}
        onSave={handleSaveAgent}
        activeFolderId={activeFolderId}
        agents={agents}
      />

      <ConfirmationModal 
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmLabel={confirmModal.confirmLabel}
        type={confirmModal.type}
        onConfirm={confirmModal.onConfirm}
        onCancel={closeConfirmModal}
      />

    </div>
  );
}

export default function RootLayout() {
  return (
    <ContextMenuProvider>
      <RootLayoutInner />
    </ContextMenuProvider>
  );
}