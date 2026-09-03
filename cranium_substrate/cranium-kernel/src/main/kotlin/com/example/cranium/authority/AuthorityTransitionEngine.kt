package com.example.cranium.authority

interface AuthorityTransitionEngine {
    fun processTransition(request: AuthorityTransitionRequest): AuthorityTransition
}
