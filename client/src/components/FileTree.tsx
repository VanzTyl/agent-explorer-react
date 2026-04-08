import { useState, useMemo } from 'react';
import { type Agent } from '../types/agent.ts';
import { useContextMenu } from '../contexts/ContextMenuContext.tsx';

interface FileTreeProps {
  agents: Agent[];
  loading: boolean;
}

type GroupedAgents = Record<string, Record<string, Agent[]>>;

export default function FileTree({ agents, loading }: FileTreeProps) {
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const { openContextMenu } = useContextMenu();

  const groupedData = useMemo(() => {
    return agents.reduce((acc: GroupedAgents, agent) => {
      if (!acc[agent.category]) acc[agent.category] = {};
      if (!acc[agent.category][agent.sub_category]) acc[agent.category][agent.sub_category] = [];
      acc[agent.category][agent.sub_category].push(agent);
      return acc;
    }, {});
  }, [agents]);

  const toggleFolder = (folderKey: string) => {
    setExpandedFolders(prev => ({ ...prev, [folderKey]: !prev[folderKey] }));
  };

  if (loading) {
    return <div className="loading_indicator p-4 text-sm text-gray-500">Loading workspace...</div>;
  }

  return (
    <div className="file_tree_container flex flex-col gap-1 w-full text-sm text-gray-700 dark:text-gray-300 relative">
      {Object.entries(groupedData).map(([category, subCategories]) => (
        <div key={category} className="category_group flex flex-col">
          <button 
            onClick={() => toggleFolder(category)}
            onContextMenu={(e) => openContextMenu(e, 'category', category, category)}
            className="folder_toggle_btn flex items-center gap-2 p-2 rounded-md hover:bg-primary/10 transition-colors w-full text-left focus:outline-none"
          >
            <svg className={`chevron_icon w-4 h-4 transition-transform ${expandedFolders[category] ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <svg className="folder_icon w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <span className="folder_name font-medium truncate">{category}</span>
          </button>

          {expandedFolders[category] && (
            <div className="sub_category_container flex flex-col pl-4">
              {Object.entries(subCategories).map(([subCategory, agentList]) => {
                const subCategoryKey = `${category}-${subCategory}`;
                return (
                  <div key={subCategoryKey} className="sub_category_group flex flex-col">
                     <button 
                        onClick={() => toggleFolder(subCategoryKey)}
                        onContextMenu={(e) => openContextMenu(e, 'sub_category', subCategoryKey, subCategory)}
                        className="sub_folder_toggle_btn flex items-center gap-2 p-2 rounded-md hover:bg-primary/10 transition-colors w-full text-left focus:outline-none"
                      >
                        <svg className={`chevron_icon w-4 h-4 transition-transform ${expandedFolders[subCategoryKey] ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <svg className="folder_icon_sm w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                        <span className="sub_folder_name truncate">{subCategory}</span>
                      </button>

                      {expandedFolders[subCategoryKey] && (
                        <div className="agent_file_container flex flex-col pl-6 pr-2">
                          {agentList.map(agent => (
                            <button 
                              key={agent.id}
                              onContextMenu={(e) => openContextMenu(e, 'agent', agent.id, agent.name)}
                              className="agent_file_btn flex items-center gap-2 p-2 rounded-md hover:bg-primary/10 transition-colors w-full text-left focus:outline-none"
                            >
                              {/* --- NEW BOT ICON FOR AGENTS --- */}
                              <svg className="agent_icon w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 14.25h.008v.008H8.25v-.008zm5.25 0h.008v.008h-.008v-.008zM19.5 7.125v1.5c0 .621-.504 1.125-1.125 1.125h-.375V15a2.25 2.25 0 01-2.25 2.25h-7.5A2.25 2.25 0 016 15V9.75h-.375A1.125 1.125 0 014.5 8.625v-1.5A1.125 1.125 0 015.625 7.5h12.75a1.125 1.125 0 011.125 1.125zM12 4.5v2.25" />
                              </svg>
                              <span className="agent_name truncate">{agent.name}</span>
                            </button>
                          ))}
                        </div>
                      )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}