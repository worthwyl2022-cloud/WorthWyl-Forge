package com.example.cranium.kernel

import com.example.cranium.authority.AuthorityLevel

class AuthorityMonotonicityInvariant : KernelInvariant {
    override val name: String = "AuthorityMonotonicity"
    override fun validate(state: KernelState): InvariantResult {
        val valid = state.currentAuthority.rank <= AuthorityLevel.DIRECTIVE_AUTHORITY.rank
        return InvariantResult(name, valid, if (valid) "Authority within allowed operational threshold" else "Authority escalation exceeded allowed bounds")
    }
}
