package com.example.cranium.authority

enum class AuthorityLevel(val rank: Int) {
    UNTRUSTED_EXTERNAL(0),
    PROVISIONAL_EPHEMERAL(1),
    DELIBERATIVE_GATE(2),
    DIRECTIVE_AUTHORITY(3),
    SYSTEM_CORE(4);

    fun canElevateTo(target: AuthorityLevel): Boolean = target.rank <= this.rank + 1
}
