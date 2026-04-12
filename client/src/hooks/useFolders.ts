import { useState, useEffect, useCallback } from 'react';
import { type Folder } from '../types/agent.ts';

export function useFolders() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFolders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8080/api/folders');
      
      if (!res.ok) {
        // This will capture if the server sends back a 404, 500, etc.
        const errorText = await res.text();
        throw new Error(`Server returned ${res.status}: ${errorText}`);
      }

      const data = await res.json();
      setFolders(data || []);
      
    } catch (error) {
      // 👇 THIS WILL REVEAL THE EXACT PROBLEM IN YOUR CONSOLE 👇
      console.error("🔥 ACTUAL FETCH ERROR:", error);
      console.warn("API Error, using local fallback for Folders.");
      
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
      const res = await fetch('http://localhost:8080/api/folders', {
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

  const updateFolder = async (id: string, name: string) => {
    try {
      const res = await fetch(`http://localhost:8080/api/folders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      if (!res.ok) throw new Error('Failed to update folder');
      await fetchFolders();
    } catch (err) {
      console.warn("API Error, using local fallback for Update Folder.");
      setFolders(prev => prev.map(f => f.id === id ? { ...f, name } : f));
    }
  };

  const deleteFolder = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:8080/api/folders/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete folder');
      await fetchFolders();
    } catch (err) {
      console.warn("API Error, using local fallback for Delete Folder.");
      setFolders(prev => prev.filter(f => f.id !== id));
    }
  };

  const moveFolder = async (id: string, parentId: string | null) => {
    try {
      const res = await fetch(`http://localhost:8080/api/folders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parent_id: parentId })
      });
      if (!res.ok) throw new Error('Failed to move folder');
      await fetchFolders();
    } catch (err) {
      console.warn("API Error, using local fallback for Move Folder.");
      setFolders(prev => prev.map(f => f.id === id ? { ...f, parent_id: parentId } : f));
    }
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