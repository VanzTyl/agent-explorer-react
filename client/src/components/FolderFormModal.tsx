import { useState, useEffect } from 'react';
import { type Folder } from '../types/agent';

interface FolderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (folderData: Partial<Folder>) => Promise<void>;
  parentId?: string | null; 
  initialData?: { id: string; name: string } | null; 
  folders?: Folder[]; // NEW: We pass the folder list here to calculate dynamic levels
}

export default function FolderFormModal({ isOpen, onClose, onSave, parentId, initialData, folders = [] }: FolderFormModalProps) {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(initialData ? initialData.name : '');
    }
  }, [isOpen, initialData]);

 const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // --- NEW: DUPLICATE NAME CHECK ---
    const targetParentId = initialData 
      ? folders.find(f => f.id === initialData.id)?.parent_id || null // If renaming, check its current location
      : parentId || null; // If creating, check the target location

    const isDuplicate = folders.some(f => 
      f.parent_id === targetParentId && 
      f.name.toLowerCase() === name.trim().toLowerCase() && 
      f.id !== initialData?.id // Ignore itself if we are just renaming it
    );

    if (isDuplicate) {
      alert("A folder with this name already exists in this location.");
      return; // Stop the submission!
    }
    
    setIsSubmitting(true);
    
    if (initialData) {
      // Renaming: just send the new name
      await onSave({ name: name.trim() });
    } else {
      
      // --- DYNAMIC LEVEL CALCULATION ---
      let newLevel = 0; // Default to Root (0)
      
      if (parentId) {
        // If creating inside a folder, find that folder and add 1 to its level
        const parentFolder = folders.find(f => f.id === parentId);
        if (parentFolder && parentFolder.level !== undefined) {
          newLevel = parentFolder.level + 1;
        } else {
          newLevel = 1; // Fallback just in case
        }
      }

      // Creating: Strictly map to the backend's expected parameters
      await onSave({
        name: name.trim(),
        level: newLevel, 
        parent_id: parentId ? parentId : null 
      });
    }
    
    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal_overlay fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="modal_container w-full max-w-md bg-white dark:bg-gray-900 rounded-xl shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
        
        <div className="modal_header p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
          <h2 className="modal_title text-xl font-bold text-gray-900 dark:text-white">
            {initialData ? 'Rename Folder' : 'Create Folder'}
          </h2>
          <button onClick={onClose} className="close_button text-gray-400 hover:text-gray-600 focus:outline-none">
             <svg className="icon_close w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="modal_body p-6">
          <form id="folder-form" onSubmit={handleSubmit}>
            <div className="input_group space-y-1">
              <label className="input_label text-sm font-medium text-gray-700 dark:text-gray-300">Folder Name</label>
              <input 
                required 
                autoFocus
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                className="text_input w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary outline-none" 
                placeholder="e.g. Marketing" 
              />
            </div>
          </form>
        </div>

        <div className="modal_footer p-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3 bg-gray-50 dark:bg-gray-900">
          <button type="button" onClick={onClose} className="cancel_button px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            Cancel
          </button>
          <button type="submit" form="folder-form" disabled={isSubmitting} className="save_button px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50">
            {isSubmitting ? 'Saving...' : (initialData ? 'Rename' : 'Create')}
          </button>
        </div>
      </div>
    </div>
  );
}