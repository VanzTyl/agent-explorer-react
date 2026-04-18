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
  const [categories, setCategories] = useState<string[]>([]);
  const [categoryInput, setCategoryInput] = useState('');
  const [subCategories, setSubCategories] = useState<Record<string, string[]>>({});
  const [subCategoryInput, setSubCategoryInput] = useState('');
  const [selectedCategoryForSub, setSelectedCategoryForSub] = useState<string | null>(null);
  
  const [subPrompts, setSubPrompts] = useState<SubPrompt[]>([{ sub_prompt_name: '', sub_prompt_content: '' }]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name);
        
        // Parsing logic for existing agents (assuming comma-separated for now)
        const cats = initialData.categories || [];
        const subs = initialData.sub_categories || [];
        
        setCategories(cats);
        // Map sub-categories to the first category as a fallback for the UI state
        if (cats.length > 0) {
          setSubCategories({ [cats[0]]: subs });
          setSelectedCategoryForSub(cats[0]);
        }
        
        setSubPrompts(initialData.sub_prompts?.length ? initialData.sub_prompts : [{ sub_prompt_name: '', sub_prompt_content: '' }]);
      } else {
        setName('');
        setCategories([]);
        setCategoryInput('');
        setSubCategories({});
        setSubCategoryInput('');
        setSelectedCategoryForSub(null);
        setSubPrompts([{ sub_prompt_name: '', sub_prompt_content: '' }]);
      }
    }
  }, [isOpen, initialData]);

  const handleAddCategory = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && categoryInput.trim()) {
      e.preventDefault();
      const newCat = categoryInput.trim();
      if (!categories.includes(newCat)) {
        setCategories([...categories, newCat]);
        if (!selectedCategoryForSub) setSelectedCategoryForSub(newCat);
      }
      setCategoryInput('');
    }
  };

  const handleAddSubCategory = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && subCategoryInput.trim() && selectedCategoryForSub) {
      e.preventDefault();
      const newSub = subCategoryInput.trim();
      const currentSubs = subCategories[selectedCategoryForSub] || [];
      if (!currentSubs.includes(newSub)) {
        setSubCategories({
          ...subCategories,
          [selectedCategoryForSub]: [...currentSubs, newSub]
        });
      }
      setSubCategoryInput('');
    }
  };

  const removeCategory = (cat: string) => {
    setCategories(categories.filter(c => c !== cat));
    const newSubs = { ...subCategories };
    delete newSubs[cat];
    setSubCategories(newSubs);
    if (selectedCategoryForSub === cat) {
      setSelectedCategoryForSub(categories.find(c => c !== cat) || null);
    }
  };

  const removeSubCategory = (cat: string, sub: string) => {
    setSubCategories({
      ...subCategories,
      [cat]: subCategories[cat].filter(s => s !== sub)
    });
  };

  const handleAddPrompt = () => setSubPrompts([...subPrompts, { sub_prompt_name: '', sub_prompt_content: '' }]);
  const handleRemovePrompt = (index: number) => setSubPrompts(subPrompts.filter((_, i) => i !== index));
  const handlePromptChange = (index: number, field: keyof SubPrompt, value: string) => {
    const newPrompts = [...subPrompts];
    newPrompts[index][field] = value;
    setSubPrompts(newPrompts);
  };

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Duplicate name validation
    const isDuplicate = agents.some(
      (a) => a.name.toLowerCase() === name.toLowerCase() && a.folder_id === activeFolderId && a.id !== initialData?.id
    );

    if (isDuplicate) {
      setErrorMsg(`An agent named "${name}" already exists in this folder.`);
      return;
    }

    setIsSubmitting(true);
    
    try {
      const finalSubCategories = Object.values(subCategories).flat();

      await onSave({
        name,
        categories: categories.length > 0 ? categories : ['Uncategorized'],
        sub_categories: finalSubCategories.length > 0 ? finalSubCategories : ['General'],
        folder_id: activeFolderId,
        sub_prompts: subPrompts
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save agent. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const handleBackdropMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal_overlay fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onMouseDown={handleBackdropMouseDown}>
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
          {errorMsg && (
            <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400 text-sm animate-in fade-in slide-in-from-top-1">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {errorMsg}
            </div>
          )}
          <form id="agent-form" onSubmit={handleSubmit} className="agent_form space-y-6">
            
            <div className="form_grid space-y-4">
              <div className="input_group space-y-2">
                <label className="input_label text-sm font-medium text-gray-700 dark:text-gray-300 flex justify-between">
                  <span>Agent Name</span>
                  <span className="text-xs text-gray-400 font-normal">Required</span>
                </label>
                <input required type="text" value={name} onChange={e => setName(e.target.value)} className="text_input w-full p-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-transparent text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary shadow-sm" placeholder="e.g. Code Reviewer" />
              </div>

              {/* MULTI-TAG CATEGORIES */}
              <div className="categories_section space-y-3">
                <label className="input_label text-sm font-medium text-gray-700 dark:text-gray-300">
                  Categories <span className="text-xs text-gray-400 font-normal">(Press Enter to add)</span>
                </label>
                <div className="tag_container flex flex-wrap gap-2 min-h-[42px] p-2 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-gray-800/30">
                  {categories.map(cat => (
                    <span 
                      key={cat} 
                      onClick={() => setSelectedCategoryForSub(cat)}
                      className={`tag inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-medium cursor-pointer transition-all border-2 ${
                        selectedCategoryForSub === cat 
                        ? 'bg-primary/10 text-primary border-primary/40' 
                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      {cat}
                      <button type="button" onClick={(e) => { e.stopPropagation(); removeCategory(cat); }} className="hover:text-red-500">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </span>
                  ))}
                  <input 
                    type="text" 
                    value={categoryInput} 
                    onChange={e => setCategoryInput(e.target.value)}
                    onKeyDown={handleAddCategory}
                    className="flex-1 min-w-[120px] bg-transparent outline-none text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400"
                    placeholder={categories.length === 0 ? "e.g. Design, Coding..." : "Add more..."}
                  />
                </div>
              </div>

              {/* NESTED SUB-CATEGORIES */}
              <div className={`sub_categories_section space-y-3 transition-opacity duration-300 ${!selectedCategoryForSub ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                <label className="input_label text-sm font-medium text-gray-700 dark:text-gray-300">
                  Sub-Categories for <span className="text-primary font-bold">{selectedCategoryForSub || '...'}</span>
                </label>
                <div className="tag_container flex flex-wrap gap-2 min-h-[42px] p-2 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-gray-800/30">
                  {selectedCategoryForSub && (subCategories[selectedCategoryForSub] || []).map(sub => (
                    <span 
                      key={sub} 
                      className="tag inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-medium bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-100 border border-transparent transition-all"
                    >
                      {sub}
                      <button type="button" onClick={() => removeSubCategory(selectedCategoryForSub, sub)} className="hover:text-red-500">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </span>
                  ))}
                  <input 
                    type="text" 
                    disabled={!selectedCategoryForSub}
                    value={subCategoryInput} 
                    onChange={e => setSubCategoryInput(e.target.value)}
                    onKeyDown={handleAddSubCategory}
                    className="flex-1 min-w-[120px] bg-transparent outline-none text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 disabled:cursor-not-allowed"
                    placeholder={selectedCategoryForSub ? `Add sub-category to ${selectedCategoryForSub}...` : "Select a category tag first"}
                  />
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