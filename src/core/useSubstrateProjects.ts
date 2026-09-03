import { useState, useEffect, useCallback } from 'react';

export interface ProjectAxiom {
  id: string;
  domain: string;
  title: string;
  statement: string;
  tier: number;
  isImmutable: boolean;
  enforcement: 'HARD_BLOCK' | 'ESCALATE_WARNING' | 'DYNAMIC_REVIEW';
}

export interface ProjectCanonNode {
  id: string;
  type: string;
  title: string;
  content: string;
  tier: number;
  tags: string[];
}

export interface ProjectQuarantineItem {
  id: string;
  candidateText: string;
  timestamp: string;
  tier: number;
  lane1Score: number;
  lane2Verdict?: string;
  arbitrationVerdict: 'PASS' | 'QUARANTINE_REJECT';
  confidence: number;
  oppositionTokens: string[];
  reasoning: string;
  status: 'QUARANTINED' | 'PROMOTED' | 'PURGED';
}

export interface MerkleReceiptBlock {
  index: number;
  timestamp: string;
  action: string;
  preHash: string;
  postHash: string;
  operatorTier: number;
}

export interface SubstrateProject {
  id: string;
  name: string;
  genre: string;
  description: string;
  createdAt: string;
  constitution: ProjectAxiom[];
  canon: ProjectCanonNode[];
  quarantine: ProjectQuarantineItem[];
  merkleChain: MerkleReceiptBlock[];
}

export function useSubstrateProjects() {
  const [projects, setProjects] = useState<any[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string>("proj-aetherius");
  const [currentProject, setCurrentProject] = useState<SubstrateProject | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all projects summary
  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch("/api/substrate/projects");
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
      }
    } catch (e) {
      console.error("Failed to load substrate projects", e);
    }
  }, []);

  // Fetch active project full details
  const fetchActiveProject = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/substrate/projects/${id}`);
      if (res.ok) {
        const data = await res.json();
        setCurrentProject(data.project);
      }
    } catch (e) {
      console.error("Failed to load active project details", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    if (activeProjectId) {
      fetchActiveProject(activeProjectId);
    }
  }, [activeProjectId, fetchActiveProject]);

  // Create new project
  const createProject = async (name: string, genre: string, description: string, initialAxiom?: any) => {
    try {
      const res = await fetch("/api/substrate/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, genre, description, initialAxiom })
      });
      if (res.ok) {
        const data = await res.json();
        await fetchProjects();
        setActiveProjectId(data.project.id);
        return data.project;
      }
    } catch (e) {
      console.error("Failed to create project", e);
    }
    return null;
  };

  // Constitution Conflict Validator
  const validateAxiomConflict = async (candidateStatement: string) => {
    if (!activeProjectId) return { isValid: true, conflicts: [] };
    try {
      const res = await fetch(`/api/substrate/projects/${activeProjectId}/constitution`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "VALIDATE_CONFLICT", candidateStatement })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.error("Conflict validation error", e);
    }
    return { isValid: true, conflicts: [] };
  };

  // Add Axiom
  const addAxiom = async (axiom: Partial<ProjectAxiom>) => {
    if (!activeProjectId) return;
    try {
      const res = await fetch(`/api/substrate/projects/${activeProjectId}/constitution`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ADD", axiom })
      });
      if (res.ok) {
        await fetchActiveProject(activeProjectId);
        await fetchProjects();
      }
    } catch (e) {
      console.error("Failed to add axiom", e);
    }
  };

  // Delete Axiom
  const deleteAxiom = async (axiomId: string) => {
    if (!activeProjectId) return;
    try {
      const res = await fetch(`/api/substrate/projects/${activeProjectId}/constitution`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "DELETE", axiomId })
      });
      if (res.ok) {
        await fetchActiveProject(activeProjectId);
        await fetchProjects();
      }
    } catch (e) {
      console.error("Failed to delete axiom", e);
    }
  };

  // Add Canon Node
  const addCanonNode = async (type: string, title: string, content: string, tags: string[] = []) => {
    if (!activeProjectId) return;
    try {
      const res = await fetch(`/api/substrate/projects/${activeProjectId}/canon`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, title, content, tags })
      });
      if (res.ok) {
        await fetchActiveProject(activeProjectId);
        await fetchProjects();
      }
    } catch (e) {
      console.error("Failed to add canon node", e);
    }
  };

  // Quarantine Action (Promote or Purge)
  const handleQuarantineDecision = async (candidateId: string, decision: 'PROMOTE' | 'PURGE') => {
    if (!activeProjectId) return;
    try {
      const res = await fetch(`/api/substrate/projects/${activeProjectId}/quarantine/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId, decision })
      });
      if (res.ok) {
        await fetchActiveProject(activeProjectId);
        await fetchProjects();
      }
    } catch (e) {
      console.error("Failed to process quarantine decision", e);
    }
  };

  // Dual-Lane Arbitrate
  const arbitrateCandidate = async (premise: string, hypothesis: string, dynamicThreshold = 0.85, forceLLMJudge = false) => {
    try {
      const res = await fetch("/api/substrate/dual-lane-arbitrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          premise,
          hypothesis,
          projectId: activeProjectId,
          dynamicThreshold,
          forceLLMJudge
        })
      });
      if (res.ok) {
        const data = await res.json();
        // Refresh project data to reflect any quarantined additions
        if (activeProjectId) {
          fetchActiveProject(activeProjectId);
          fetchProjects();
        }
        return data;
      }
    } catch (e) {
      console.error("Dual-lane arbitration error", e);
    }
    return null;
  };

  // Export Diligence Package
  const exportDiligencePack = async () => {
    try {
      const res = await fetch("/api/substrate/export-diligence-pack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: activeProjectId })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.error("Failed to export diligence pack", e);
    }
    return null;
  };

  return {
    projects,
    activeProjectId,
    setActiveProjectId,
    currentProject,
    isLoading,
    fetchProjects,
    fetchActiveProject,
    createProject,
    validateAxiomConflict,
    addAxiom,
    deleteAxiom,
    addCanonNode,
    handleQuarantineDecision,
    arbitrateCandidate,
    exportDiligencePack
  };
}
