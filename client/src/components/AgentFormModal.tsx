import { useState, useEffect } from 'react';
import Modal from './Modal.tsx';
import { type Agent, type SubPrompt } from '../types/agent.ts';

interface AgentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  // If editing, we pass the existing agent. If null, we are creating a new one.
  initialData?: Agent | null; 
  // We will wire up the actual API saving in the next step
  onSave: (data: Partial<Agent>) => void; 
  // Pre-fill category if the user right-clicked a specific folder
  defaultCategory?: string;
  defaultSubCategory?: string;
}

export default function AgentFormModal({ isOpen, onClose, initialData, onSave, defaultCategory, defaultSubCategory }: AgentFormModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [subPrompts, setSubPrompts] = useState<SubPrompt[]>([]);

  // Reset or populate form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name);
        setCategory(initialData.category);
        setSubCategory(initialData.sub_category);
        setSubPrompts(initialData.sub_prompts || []);
      } else {
        setName('');
        setCategory(defaultCategory || '');
        setSubCategory(defaultSubCategory || '');
        setSubPrompts([{ sub_prompt_name: '', sub_prompt_content: '' }]); // Start with one empty prompt
      }
    }
  }, [isOpen, initialData, defaultCategory, defaultSubCategory]);

  const handleAddSubPrompt = () => {
    setSubPrompts([...subPrompts, { sub_prompt_name: '', sub_prompt_content: '' }]);
  };

  const handleRemoveSubPrompt = (index: number) => {
    setSubPrompts(subPrompts.filter((_, i) => i !== index));
  };

  const handleSubPromptChange = (index: number, field: keyof SubPrompt, value: string) => {
    const newPrompts = [...subPrompts];
    newPrompts[index][field] = value;
    setSubPrompts(newPrompts);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, category, sub_category: subCategory, sub_prompts: subPrompts });
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={initialData ? 'Edit Agent' : 'Create New Agent'}
    >
      <form onSubmit={handleSubmit} className="agent_form flex flex-col gap-4 text-sm">
        
        <div className="form_group flex flex-col gap-1">
          <label className="input_label font-medium text-gray-700 dark:text-gray-300">Agent Name</label>
          <input 
            required
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Code Reviewer"
            className="text_input w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-transparent text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
          />
        </div>

        <div className="form_row flex flex-col sm:flex-row gap-4">
          <div className="form_group flex flex-col gap-1 flex-1">
            <label className="input_label font-medium text-gray-700 dark:text-gray-300">Category</label>
            <input 
              required
              type="text" 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Development"
              className="text_input w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-transparent text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>
          <div className="form_group flex flex-col gap-1 flex-1">
            <label className="input_label font-medium text-gray-700 dark:text-gray-300">Sub-Category</label>
            <input 
              required
              type="text" 
              value={subCategory}
              onChange={(e) => setSubCategory(e.target.value)}
              placeholder="e.g. Code Quality"
              className="text_input w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-transparent text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>
        </div>

        <div className="divider h-px bg-gray-200 dark:bg-gray-800 my-2"></div>

        <div className="sub_prompts_section flex flex-col gap-3">
          <div className="sub_prompts_header flex items-center justify-between">
            <label className="input_label font-medium text-gray-700 dark:text-gray-300">Sub-Prompts</label>
            <button 
              type="button" 
              onClick={handleAddSubPrompt}
              className="add_prompt_btn flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors focus:outline-none"
            >
              <svg className="add_icon w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Prompt
            </button>
          </div>

          {subPrompts.map((prompt, index) => (
            <div key={index} className="sub_prompt_card flex flex-col gap-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 relative group">
              <button 
                type="button"
                onClick={() => handleRemoveSubPrompt(index)}
                className="remove_prompt_btn absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors focus:outline-none opacity-0 group-hover:opacity-100"
                title="Remove Sub-Prompt"
              >
                 <svg className="trash_icon w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
              
              <input 
                required
                type="text" 
                value={prompt.sub_prompt_name}
                onChange={(e) => handleSubPromptChange(index, 'sub_prompt_name', e.target.value)}
                placeholder="Prompt Name (e.g. Summarize)"
                className="text_input w-full px-2 py-1.5 border-b border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-gray-100 focus:outline-none focus:border-primary transition-colors text-xs font-medium"
              />
              <textarea 
                required
                value={prompt.sub_prompt_content}
                onChange={(e) => handleSubPromptChange(index, 'sub_prompt_content', e.target.value)}
                placeholder="Enter prompt instructions..."
                rows={2}
                className="textarea_input w-full px-2 py-1.5 bg-transparent text-gray-900 dark:text-gray-100 focus:outline-none resize-none text-xs"
              />
            </div>
          ))}
          {subPrompts.length === 0 && (
            <p className="empty_state_text text-xs text-gray-500 italic text-center py-2">No sub-prompts added.</p>
          )}
        </div>

        <div className="form_actions flex items-center justify-end gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
          <button 
            type="button" 
            onClick={onClose}
            className="cancel_btn px-4 py-2 rounded-md font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="save_btn px-4 py-2 rounded-md font-medium text-white bg-primary hover:bg-primary/90 transition-colors shadow-sm focus:outline-none"
          >
            {initialData ? 'Save Changes' : 'Create Agent'}
          </button>
        </div>
      </form>
    </Modal>
  );
}