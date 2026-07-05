package com.example.data

import android.content.Context
import androidx.room.Room
import androidx.test.core.app.ApplicationProvider
import org.junit.After
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config
import kotlinx.coroutines.runBlocking
import java.io.IOException

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34])
class TransactionDatabaseTest {

    private lateinit var transactionDao: TransactionDao
    private lateinit var db: AppDatabase

    @Before
    fun createDb() {
        val context = ApplicationProvider.getApplicationContext<Context>()
        // Initialize an in-memory database instance (unencrypted for JVM test compatibility)
        db = Room.inMemoryDatabaseBuilder(context, AppDatabase::class.java)
            .allowMainThreadQueries()
            .build()
        transactionDao = db.transactionDao()
    }

    @After
    @Throws(IOException::class)
    fun closeDb() {
        db.close()
    }

    @Test
    fun testInsertAndRetrieveLatestNonce() = runBlocking {
        // Initially latest nonce should be null or 0
        var latestNonce = transactionDao.getLatestNonce()
        assertNull("Initial latest nonce should be null", latestNonce)

        // Insert some transactions with nonces
        val tx1 = TransactionEntity(
            title = "Vendor A",
            category = "food",
            timestamp = System.currentTimeMillis(),
            amount = 150.0,
            isDebit = true,
            syncStatus = "Pending",
            nonce = 101
        )
        transactionDao.insertTransaction(tx1)

        latestNonce = transactionDao.getLatestNonce()
        assertEquals(101, latestNonce)

        val tx2 = TransactionEntity(
            title = "Vendor B",
            category = "food",
            timestamp = System.currentTimeMillis(),
            amount = 200.0,
            isDebit = true,
            syncStatus = "Pending",
            nonce = 105 // Highest nonce
        )
        transactionDao.insertTransaction(tx2)

        latestNonce = transactionDao.getLatestNonce()
        assertEquals(105, latestNonce)
    }

    @Test
    fun testDetectDuplicateNonce() = runBlocking {
        val nonceValue = 47291
        
        // Ensure no transaction has this nonce initially
        var existingTx = transactionDao.getTransactionByNonce(nonceValue)
        assertNull(existingTx)

        // Insert a transaction with the nonce
        val tx = TransactionEntity(
            title = "Vendor C",
            category = "food",
            timestamp = System.currentTimeMillis(),
            amount = 500.0,
            isDebit = true,
            syncStatus = "Pending",
            nonce = nonceValue
        )
        transactionDao.insertTransaction(tx)

        // Now lookup should return the transaction
        existingTx = transactionDao.getTransactionByNonce(nonceValue)
        assertNotNull(existingTx)
        assertEquals("Vendor C", existingTx?.title)
        assertEquals(nonceValue, existingTx?.nonce)
    }
}
