package com.example.core.product

import com.example.core.substrate.CognitiveAtom
import com.example.core.substrate.CanonLane
import java.util.concurrent.ConcurrentHashMap

/**
 * Enterprise Product Store interface for Cranium Substrate.
 * Manages multi-tenant workspaces, persistent project boards, and cross-session memory trees.
 */
class ProjectStore {
    data class ProjectWorkspace(
        val projectId: String,
        val organizationId: String,
        val projectName: String,
        val activeAxioms: MutableList<CognitiveAtom> = mutableListOf(),
        val workingHistory: MutableList<String> = mutableListOf(),
        val createdAt: Long = System.currentTimeMillis()
    )

    private val workspaceRegistry = ConcurrentHashMap<String, ProjectWorkspace>()

    fun createWorkspace(projectId: String, orgId: String, name: String): ProjectWorkspace {
        val ws = ProjectWorkspace(projectId = projectId, organizationId = orgId, projectName = name)
        workspaceRegistry[projectId] = ws
        return ws
    }

    fun getWorkspace(projectId: String): ProjectWorkspace? = workspaceRegistry[projectId]

    fun addAxiomToWorkspace(projectId: String, rule: String): Boolean {
        val ws = workspaceRegistry[projectId] ?: return false
        val atom = CognitiveAtom(
            proposition = rule,
            lane = CanonLane.ENTERPRISE_POLICY,
            provenance = CognitiveAtom.Provenance.AXIOMATIC
        )
        ws.activeAxioms.add(atom)
        return true
    }

    fun listWorkspacesForOrg(orgId: String): List<ProjectWorkspace> {
        return workspaceRegistry.values.filter { it.organizationId == orgId }
    }
}
