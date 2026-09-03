package com.example.cranium.hash

import com.example.cranium.authority.AuthorityTransitionRequest

class AuthorityTransitionRequestEncoder : CanonicalEncoder<AuthorityTransitionRequest> {
    override fun encode(value: AuthorityTransitionRequest): String {
        return "REQ|${value.requestId}|${value.fromLevel}|${value.toLevel}|${value.source}|${value.scope.namespace}|${value.nonce}|${value.timestamp}"
    }
}
