import { useState, useEffect, useCallback } from 'react';
import { type Agent } from '../types/agent.ts';

export function useAgents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAgents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://localhost:8080/api/agents');
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      const data: Agent[] = await response.json();
      setAgents(data || []);
    } catch (err: any) {
      setError(err.message || 'Error fetching agents.');
      // FIXED: Added folder_id: null to satisfy the Agent type
      setAgents([
        { id: 'dev-1', name: 'Research Assistant', category: 'Productivity', sub_category: 'Research', sub_prompts: [], folder_id: null },
        { id: 'dev-2', name: 'Code Reviewer', category: 'Development', sub_category: 'Code Quality', sub_prompts: [], folder_id: null }
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
      const response = await fetch('http://localhost:8080/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agentData),
      });
      if (!response.ok) throw new Error('Failed to create agent');
      await fetchAgents();
    } catch (err) {
      console.warn("API Error, using local fallback for Create.");
      setAgents(prev => [{ ...agentData, id: `local-${Date.now()}` } as Agent, ...prev]);
    }
  };

  const updateAgent = async (id: string, agentData: Partial<Agent>) => {
    try {
      const response = await fetch(`http://localhost:8080/api/agents/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agentData),
      });
      if (!response.ok) throw new Error('Failed to update agent');
      await fetchAgents();
    } catch (err) {
      console.warn("API Error, using local fallback for Update.");
      setAgents(prev => prev.map(a => a.id === id ? { ...a, ...agentData } : a));
    }
  };

  const deleteAgent = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:8080/api/agents/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete agent');
      await fetchAgents();
    } catch (err) {
      console.warn("API Error, using local fallback for Delete.");
      setAgents(prev => prev.filter(a => a.id !== id));
    }
  };

  const moveAgent = async (id: string, folderId: string | null) => {
    try {
      const response = await fetch(`http://localhost:8080/api/agents/${id}/move`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder_id: folderId })
      });
      if (!response.ok) throw new Error('Failed to move agent');
      await fetchAgents();
    } catch (err) {
      console.warn("API Error, using local fallback for Move.");
      setAgents(prev => prev.map(a => a.id === id ? { ...a, folder_id: folderId } : a));
    }
  };

  return { agents, loading, error, refetch: fetchAgents, createAgent, updateAgent, deleteAgent, moveAgent };
}