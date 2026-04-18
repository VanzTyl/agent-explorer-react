import { useState, useEffect, useCallback } from 'react';
import { type Agent } from '../types/agent';

const API_BASE_URL = 'http://localhost:8080/api/agents';

export function useAgents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAgents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(API_BASE_URL);
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      const data: Agent[] = await response.json();
      setAgents(data || []);
    } catch (err: any) {
      console.error("🔥 AGENTS FETCH ERROR:", err);
      setError(err.message || 'Error fetching agents.');
      // Fallback for development
      setAgents([
        { id: 'dev-1', name: 'Research Assistant', categories: ['Productivity'], sub_categories: ['Research'], sub_prompts: [], folder_id: null },
        { id: 'dev-2', name: 'Code Reviewer', categories: ['Development'], sub_categories: ['Code Quality'], sub_prompts: [], folder_id: null }
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const createAgent = async (agentData: Partial<Agent>) => {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agentData),
      });
      if (!response.ok) throw new Error('Failed to create agent');
      await fetchAgents();
    } catch (err) {
      console.error("API Error creating agent:", err);
      throw err;
    }
  };

  const updateAgent = async (id: string, agentData: Partial<Agent>) => {
    const targetUrl = `${API_BASE_URL}/${id}`;
    console.log(`📡 [useAgents] Updating Agent at: ${targetUrl}`, agentData);

    try {
      const response = await fetch(targetUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agentData),
      });
      
      if (!response.ok) {
        const errorMsg = await response.text();
        throw new Error(`Update failed: ${response.status} - ${errorMsg}`);
      }
      
      // OPTIMIZATION: Update local state with the returned object to prevent loading flicker
      const updatedAgent: Agent = await response.json();
      setAgents(prev => prev.map(a => a.id === id ? updatedAgent : a));
    } catch (err) {
      console.error("API Error updating agent:", err);
      throw err;
    }
  };

  const deleteAgent = async (id: string) => {
    const targetUrl = `${API_BASE_URL}/${id}`;
    console.log(`📡 [useAgents] Deleting Agent at: ${targetUrl}`);

    try {
      const response = await fetch(targetUrl, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete agent');
      await fetchAgents();
    } catch (err) {
      console.error("API Error deleting agent:", err);
      throw err;
    }
  };

  const moveAgent = async (id: string, folderId: string | null) => {
    const targetUrl = `${API_BASE_URL}/${id}/move`;
    console.log(`📡 [useAgents] Moving Agent at: ${targetUrl}`, { folder_id: folderId });

    try {
      const response = await fetch(targetUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder_id: folderId })
      });
      if (!response.ok) throw new Error('Failed to move agent');
      
      // OPTIMIZATION: Update local state immediately with returned object
      const updatedAgent: Agent = await response.json();
      setAgents(prev => prev.map(a => a.id === id ? updatedAgent : a));
    } catch (err) {
      console.error("API Error moving agent:", err);
      throw err;
    }
  };

  return { agents, loading, error, refetch: fetchAgents, createAgent, updateAgent, deleteAgent, moveAgent };
}
