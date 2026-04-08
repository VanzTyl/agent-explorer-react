import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import ThemeSwitcher from '../components/ThemeSwitcher.tsx';
import FileTree from '../components/FileTree.tsx';
import ContextMenu from '../components/ContextMenu.tsx';
import { ContextMenuProvider, useContextMenu } from '../contexts/ContextMenuContext.tsx';
import AgentFormModal from '../components/AgentFormModal.tsx';
import { type Agent } from '../types/agent.ts';
import { useAgents } from '../hooks/useAgents.ts';

function RootLayoutInner() {
  const { openContextMenu, contextMenu, closeContextMenu } = useContextMenu();
  
  // Bring API functions to the top level
  const { agents, loading, createAgent, updateAgent, deleteAgent, refetch } = useAgents();

  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
  const [agentModalData, setAgentModalData] = useState<Agent | null>(null);
  const [defaultCategory, setDefaultCategory] = useState<string>('');
  const [defaultSubCategory, setDefaultSubCategory] = useState<string>('');

  const handleContextAction = (action: string) => {
    closeContextMenu();

    if (action === 'refresh_workspace') {
      refetch();
    }

    if (action === 'create_agent') {
      if (contextMenu.targetType === 'category') {
        setDefaultCategory(contextMenu.targetName || '');
        setDefaultSubCategory('');
      } else if (contextMenu.targetType === 'sub_category') {
        const [cat, subCat] = (contextMenu.targetId || '').split('-');
        setDefaultCategory(cat || '');
        setDefaultSubCategory(subCat || '');
      } else {
        setDefaultCategory('');
        setDefaultSubCategory('');
      }
      setAgentModalData(null); 
      setIsAgentModalOpen(true);
    } 
    
    if (action === 'edit_agent' && contextMenu.targetId) {
      // Find the real agent data from our state to populate the modal
      const agentToEdit = agents.find(a => a.id === contextMenu.targetId);
      if (agentToEdit) {
        setAgentModalData(agentToEdit);
        setIsAgentModalOpen(true);
      }
    }

    if (action === 'create_folder') {
      alert(`Feature coming soon: This will allow creating empty directories in the backend if supported.`);
    }

    if (action === 'delete_folder') {
      alert(`Feature coming soon: Bulk delete of Category: ${contextMenu.targetName}`);
    }

    if (action === 'delete_agent' && contextMenu.targetId) {
      if (window.confirm(`Are you sure you want to delete the agent: ${contextMenu.targetName}?`)) {
        deleteAgent(contextMenu.targetId);
      }
    }
  };

  const handleSaveAgent = async (data: Partial<Agent>) => {
    if (agentModalData && agentModalData.id) {
      // Editing existing
      await updateAgent(agentModalData.id, data);
    } else {
      // Creating new
      await createAgent(data);
    }
    setIsAgentModalOpen(false);
  };

  return (
    <div className="root_layout flex h-screen w-full bg-primary/5 dark:bg-gray-950 transition-colors duration-300">
      
      <aside className="sidebar_container hidden md:flex flex-col w-64 border-r border-primary/20 dark:border-primary/20 bg-white/50 dark:bg-primary/10 backdrop-blur-sm transition-colors duration-300">
        <div className="sidebar_header flex flex-col gap-4 p-4 border-b border-primary/20 dark:border-primary/20">
          <div className="brand_wrapper flex items-center justify-between w-full">
            <span className="brand_title font-bold text-lg text-primary transition-colors duration-300">
              Agent Explorer
            </span>
          </div>
          <div className="theme_switcher_wrapper w-full flex justify-center">
             <ThemeSwitcher />
          </div>
        </div>
        
        <nav 
          className="sidebar_navigation flex-1 overflow-y-auto p-2"
          onContextMenu={(e) => openContextMenu(e, 'workspace', null, 'Workspace')}
        >
          {/* Inject fetched data down to the UI */}
          <FileTree agents={agents} loading={loading} />
        </nav>
      </aside>

      <main className="main_content_area flex-1 flex flex-col relative overflow-hidden">
        <header className="mobile_header md:hidden flex items-center justify-between p-4 border-b border-primary/20 dark:border-primary/20 bg-white dark:bg-primary/10">
           <span className="brand_title_mobile font-bold text-primary transition-colors duration-300">
            Agent Explorer
          </span>
          <ThemeSwitcher />
        </header>
        
        <div 
          className="content_wrapper flex-1 flex flex-col relative overflow-hidden bg-white dark:bg-gray-900"
          onContextMenu={(e) => openContextMenu(e, 'workspace', null, 'Workspace')}
        >
          <Outlet context={{ agents, loading }} />
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

      <AgentFormModal 
        isOpen={isAgentModalOpen}
        onClose={() => setIsAgentModalOpen(false)}
        initialData={agentModalData}
        onSave={handleSaveAgent}
        defaultCategory={defaultCategory}
        defaultSubCategory={defaultSubCategory}
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