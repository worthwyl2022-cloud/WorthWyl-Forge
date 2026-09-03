package com.example.cranium.receipt

interface ReceiptChain {
    fun appendReceipt(receipt: AuthorityReceipt): Boolean
    fun verifyChainIntegrity(): Boolean
    fun getReceipts(): List<AuthorityReceipt>
}
