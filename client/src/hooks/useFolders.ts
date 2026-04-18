import { useState, useEffect, useCallback } from 'react';
import { type Folder } from '../types/agent.ts';

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'}/folders`;

export function useFolders() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFolders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(API_BASE_URL);
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Server returned ${res.status}: ${errorText}`);
      }

      const data = await res.json();
      setFolders(data || []);
      
    } catch (error) {
      console.error("🔥 FOLDERS FETCH ERROR:", error);
      // Dummy data fallback for development
      setFolders([
        { id: 'folder-1', name: 'Productivity', level: 0, parent_id: null },
        { id: 'folder-2', name: 'Development', level: 0, parent_id: null }
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  const createFolder = async (folderData: Partial<Folder>) => {
    try {
      const res = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(folderData)
      });
      if (!res.ok) throw new Error('Failed to create folder');
      await fetchFolders();
    } catch (err) {
      console.warn("API Error, using local fallback for Create Folder.");
      setFolders(prev => [...prev, { ...folderData, id: `local-folder-${Date.now()}` } as Folder]);
    }
  };

  /**
   * Updated to support polymorphic updates (name, parent_id, level)
   * to align with the move functionality.
   */
  const updateFolder = async (id: string, folderData: Partial<Folder>) => {
    const targetUrl = `${API_BASE_URL}/${id}`;
    console.log(`📡 [useFolders] Updating Folder at: ${targetUrl}`, folderData);

    try {
      const res = await fetch(targetUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(folderData)
      });
      
      if (!res.ok) {
        const errorMsg = await res.text();
        throw new Error(`Update failed: ${res.status} - ${errorMsg}`);
      }
      
      // OPTIMIZATION: Use the updated object returned by the API to avoid a full refetch/flicker
      const updatedFolder: Folder = await res.json();
      setFolders(prev => prev.map(f => f.id === id ? updatedFolder : f));
    } catch (err) {
      console.warn("API Error, using local fallback for Update Folder.");
      setFolders(prev => prev.map(f => f.id === id ? { ...f, ...folderData } : f));
    }
  };

  const deleteFolder = async (id: string) => {
    const targetUrl = `${API_BASE_URL}/${id}`;
    console.log(`📡 [useFolders] Deleting Folder at: ${targetUrl}`);

    try {
      const res = await fetch(targetUrl, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete folder');
      await fetchFolders();
    } catch (err) {
      console.warn("API Error, using local fallback for Delete Folder.");
      setFolders(prev => prev.filter(f => f.id !== id));
    }
  };

  const moveFolder = async (id: string, parentId: string | null) => {
    // 1. Find the current folder to get its name
    const currentFolder = folders.find(f => f.id === id);
    if (!currentFolder) return;
    // 2. Calculate the new level
    let newLevel = 1; // Default for Root
    if (parentId) {
      const parentFolder = folders.find(f => f.id === parentId);
      if (parentFolder) {
        newLevel = parentFolder.level + 1;
      }
    }
    // 3. Send the full payload required by the backend validation
    const movePayload = {
      name: currentFolder.name,
      parent_id: parentId,
      level: newLevel
    };
    console.log(`📡 [useFolders] Moving Folder ${id} to parent ${parentId} at level ${newLevel}`);
    await updateFolder(id, movePayload);
  };

  return { 
    folders, 
    loading, 
    refetchFolders: fetchFolders,
    createFolder,
    updateFolder,
    deleteFolder,
    moveFolder
  };
}
