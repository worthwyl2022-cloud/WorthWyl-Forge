package com.example.cranium.receipt

import java.util.concurrent.CopyOnWriteArrayList

class InMemoryReceiptChain : ReceiptChain {
    private val chain = CopyOnWriteArrayList<AuthorityReceipt>()

    override fun appendReceipt(receipt: AuthorityReceipt): Boolean {
        if (chain.isNotEmpty()) {
            val last = chain.last()
            if (receipt.preStateHash != last.postStateHash) {
                return false // Hash chain mismatch
            }
        }
        chain.add(receipt)
        return true
    }

    override fun verifyChainIntegrity(): Boolean {
        for (i in 1 until chain.size) {
            if (chain[i].preStateHash != chain[i - 1].postStateHash) {
                return false
            }
        }
        return true
    }

    override fun getReceipts(): List<AuthorityReceipt> = chain.toList()
}
