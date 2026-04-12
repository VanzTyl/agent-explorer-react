import { useState, useEffect } from 'react';
import { type Agent, type SubPrompt } from '../types/agent';

interface AgentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (agentData: Partial<Agent>) => Promise<void>;
  initialData?: Agent | null;
  activeFolderId: string | null;
  agents: Agent[]; // Passed down to derive existing categories
}

export default function AgentFormModal({ isOpen, onClose, onSave, initialData, activeFolderId, agents }: AgentFormModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [subPrompts, setSubPrompts] = useState<SubPrompt[]>([{ sub_prompt_name: '', sub_prompt_content: '' }]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Derive unique lists for the searchable dropdowns
  const uniqueCategories = Array.from(new Set(agents.map(a => a.category).filter(Boolean)));
  const uniqueSubCategories = Array.from(
    new Set(
      agents
        .filter(a => a.category.toLowerCase() === category.toLowerCase())
        .map(a => a.sub_category)
        .filter(Boolean)
    )
  );

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name);
        setCategory(initialData.category || '');
        setSubCategory(initialData.sub_category || '');
        setSubPrompts(initialData.sub_prompts?.length ? initialData.sub_prompts : [{ sub_prompt_name: '', sub_prompt_content: '' }]);
      } else {
        setName('');
        setCategory('');
        setSubCategory('');
        setSubPrompts([{ sub_prompt_name: '', sub_prompt_content: '' }]);
      }
    }
  }, [isOpen, initialData]);

  const handleAddPrompt = () => setSubPrompts([...subPrompts, { sub_prompt_name: '', sub_prompt_content: '' }]);
  const handleRemovePrompt = (index: number) => setSubPrompts(subPrompts.filter((_, i) => i !== index));
  const handlePromptChange = (index: number, field: keyof SubPrompt, value: string) => {
    const newPrompts = [...subPrompts];
    newPrompts[index][field] = value;
    setSubPrompts(newPrompts);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    await onSave({
      name,
      category: category.trim() || 'Uncategorized',
      sub_category: subCategory.trim() || 'General',
      folder_id: activeFolderId,
      sub_prompts: subPrompts
    });
    
    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal_overlay fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="modal_container w-full max-w-2xl bg-white dark:bg-gray-900 rounded-xl shadow-2xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        
        <div className="modal_header p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
          <h2 className="modal_title text-xl font-bold text-gray-900 dark:text-white">
            {initialData ? 'Edit Agent' : 'Create New Agent'}
          </h2>
          <button onClick={onClose} className="close_button text-gray-400 hover:text-gray-600 focus:outline-none">
             <svg className="icon_close w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="modal_body p-6 overflow-y-auto custom-scrollbar flex-1">
          <form id="agent-form" onSubmit={handleSubmit} className="agent_form space-y-6">
            
            <div className="form_grid grid grid-cols-1 gap-4">
              <div className="input_group space-y-1">
                <label className="input_label text-sm font-medium text-gray-700 dark:text-gray-300">Agent Name</label>
                <input required type="text" value={name} onChange={e => setName(e.target.value)} className="text_input w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary" placeholder="e.g. Code Reviewer" />
              </div>

              <div className="category_grid grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="input_group space-y-1">
                  <label className="input_label text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                  <input 
                    list="category-options" 
                    value={category} 
                    onChange={e => {
                      setCategory(e.target.value);
                      if (e.target.value === '') setSubCategory(''); // Reset sub on clear
                    }} 
                    className="text_input w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary" 
                    placeholder="Search or type new..." 
                  />
                  <datalist id="category-options">
                    {uniqueCategories.map((cat, idx) => (
                      <option key={idx} value={cat} />
                    ))}
                  </datalist>
                </div>

                <div className="input_group space-y-1">
                  <label className="input_label text-sm font-medium text-gray-700 dark:text-gray-300">Sub-Category</label>
                  <input 
                    list="subcategory-options" 
                    value={subCategory} 
                    onChange={e => setSubCategory(e.target.value)} 
                    disabled={!category}
                    className="text_input w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed" 
                    placeholder={category ? "Search or type new..." : "Select category first"} 
                  />
                  <datalist id="subcategory-options">
                    {uniqueSubCategories.map((subCat, idx) => (
                      <option key={idx} value={subCat} />
                    ))}
                  </datalist>
                </div>
              </div>
            </div>

            <hr className="divider_line border-gray-200 dark:border-gray-800" />

            <div className="sub_prompts_section space-y-4">
              <div className="sub_prompts_header flex justify-between items-center">
                <h3 className="section_title text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">Sub-Prompts</h3>
                <button type="button" onClick={handleAddPrompt} className="add_prompt_button text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1">
                  + Add Prompt
                </button>
              </div>

              {subPrompts.map((prompt, index) => (
                <div key={index} className="prompt_card p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 space-y-3 relative group">
                   {index > 0 && (
                    <button type="button" onClick={() => handleRemovePrompt(index)} className="remove_prompt_button absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="icon_trash w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  )}
                  
                  <input required type="text" value={prompt.sub_prompt_name} onChange={e => handlePromptChange(index, 'sub_prompt_name', e.target.value)} placeholder="Prompt Section Name (e.g. System Rules)" className="text_input w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-medium" />
                  
                  <textarea required value={prompt.sub_prompt_content} onChange={e => handlePromptChange(index, 'sub_prompt_content', e.target.value)} placeholder="Enter the detailed prompt instructions here..." rows={4} className="text_area w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 resize-y" />
                </div>
              ))}
            </div>

          </form>
        </div>

        <div className="modal_footer p-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3 bg-gray-50 dark:bg-gray-900">
          <button type="button" onClick={onClose} className="cancel_button px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            Cancel
          </button>
          <button type="submit" form="agent-form" disabled={isSubmitting} className="save_button px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50">
            {isSubmitting ? 'Saving...' : 'Save Agent'}
          </button>
        </div>
      </div>
    </div>
  );
}