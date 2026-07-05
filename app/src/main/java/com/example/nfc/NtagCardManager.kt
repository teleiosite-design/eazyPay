package com.example.nfc

import android.app.Activity
import android.nfc.NfcAdapter
import android.nfc.Tag
import android.nfc.tech.NfcA
import android.os.Bundle
import android.util.Log
import java.io.IOException
import java.nio.charset.StandardCharsets

object NtagCardManager {
    private const val TAG = "NtagCardManager"
    
    // NTAG213 command bytes
    private const val CMD_READ: Int = 0x30
    private const val CMD_WRITE: Int = 0xA2
    private const val CMD_PWD_AUTH: Int = 0x1B

    // NTAG213 memory boundaries
    private const val USER_START_PAGE = 4
    private const val USER_END_PAGE = 39 // 36 user pages = 144 bytes
    private const val CFG_PAGE_ACCESS = 42 // CFG1
    private const val CFG_PAGE_PWD = 43    // PWD
    private const val CFG_PAGE_PACK = 44   // PACK

    data class CardData(
        val customerId: String,
        val publicKeyBase64: String
    )

    /**
     * Enables NFC Reader mode on the active activity.
     */
    fun enableReaderMode(activity: Activity, nfcAdapter: NfcAdapter, onTagDiscovered: (Tag) -> Unit) {
        val options = Bundle().apply {
            // Delay sound for a smoother tap experience
            putInt(NfcAdapter.EXTRA_READER_PRESENCE_CHECK_DELAY, 250)
        }
        nfcAdapter.enableReaderMode(
            activity,
            { tag -> onTagDiscovered(tag) },
            NfcAdapter.FLAG_READER_NFC_A or NfcAdapter.FLAG_READER_SKIP_NDEF_CHECK,
            options
        )
        Log.d(TAG, "NFC Reader Mode Enabled")
    }

    /**
     * Disables NFC Reader mode on the active activity.
     */
    fun disableReaderMode(activity: Activity, nfcAdapter: NfcAdapter) {
        nfcAdapter.disableReaderMode(activity)
        Log.d(TAG, "NFC Reader Mode Disabled")
    }

    /**
     * Authenticates with a 32-bit password before performing operations (if locked).
     */
    fun authenticate(nfcA: NfcA, passwordBytes: ByteArray): Boolean {
        if (passwordBytes.size != 4) {
            Log.e(TAG, "Password must be exactly 4 bytes")
            return false
        }
        return try {
            val cmd = ByteArray(5)
            cmd[0] = CMD_PWD_AUTH.toByte()
            System.arraycopy(passwordBytes, 0, cmd, 1, 4)
            val response = nfcA.transceive(cmd)
            // If transceive completes without exception and returns PACK (2 bytes), success.
            response != null && response.size == 2
        } catch (e: IOException) {
            Log.w(TAG, "Authentication failed or not required: ${e.message}")
            false
        }
    }

    /**
     * Encodes customer credentials onto NTAG213, sets 32-bit password, and locks pages.
     * Write access is blocked under password protection, while read access remains free.
     */
    fun writeAndLockCard(
        tag: Tag,
        customerId: String,
        publicKeyBase64: String,
        passwordBytes: ByteArray
    ): Boolean {
        val nfcA = NfcA.get(tag) ?: return false
        
        try {
            nfcA.connect()
            
            // 1. Prepare Payload: "customerId|publicKeyBase64"
            val payloadString = "$customerId|$publicKeyBase64"
            val payloadBytes = payloadString.toByteArray(StandardCharsets.UTF_8)
            
            // NTAG213 holds max 144 user bytes
            if (payloadBytes.size > 144) {
                Log.e(TAG, "Payload size exceeds NTAG213 capacity: ${payloadBytes.size} bytes")
                return false
            }

            // Pad payload to fill out 4-byte pages
            val paddingNeeded = 4 - (payloadBytes.size % 4)
            val paddedBytes = if (paddingNeeded < 4) {
                payloadBytes + ByteArray(paddingNeeded)
            } else {
                payloadBytes
            }

            // 2. Write Payload Page by Page
            val totalPages = paddedBytes.size / 4
            for (i in 0 until totalPages) {
                val pageIndex = USER_START_PAGE + i
                if (pageIndex > USER_END_PAGE) break

                val writeCmd = ByteArray(6)
                writeCmd[0] = CMD_WRITE.toByte()
                writeCmd[1] = pageIndex.toByte()
                System.arraycopy(paddedBytes, i * 4, writeCmd, 2, 4)
                
                nfcA.transceive(writeCmd)
            }
            Log.d(TAG, "Payload successfully written to user memory pages")

            // 3. Write 32-bit Password (Page 43)
            val pwdWriteCmd = ByteArray(6)
            pwdWriteCmd[0] = CMD_WRITE.toByte()
            pwdWriteCmd[1] = CFG_PAGE_PWD.toByte()
            System.arraycopy(passwordBytes, 0, pwdWriteCmd, 2, 4)
            nfcA.transceive(pwdWriteCmd)

            // 4. Write PACK bytes (Page 44) - Acknowledge code defaults to 0x0000
            val packWriteCmd = ByteArray(6)
            packWriteCmd[0] = CMD_WRITE.toByte()
            packWriteCmd[1] = CFG_PAGE_PACK.toByte()
            packWriteCmd[2] = 0x00.toByte() // PACK 0
            packWriteCmd[3] = 0x00.toByte() // PACK 1
            packWriteCmd[4] = 0x00.toByte() // RFU
            packWriteCmd[5] = 0x00.toByte() // RFU
            nfcA.transceive(packWriteCmd)

            // 5. Configure Protection in CFG1 (Page 42)
            // Byte 0: PROT=0 (write protected, read open), AUTHLIM=3 (3 invalid attempts lock tag) -> 0x03
            // Byte 1: AUTH0=4 (protection starts from Page 4) -> 0x04
            val cfgWriteCmd = ByteArray(6)
            cfgWriteCmd[0] = CMD_WRITE.toByte()
            cfgWriteCmd[1] = CFG_PAGE_ACCESS.toByte()
            cfgWriteCmd[2] = 0x03.toByte() // PROT = 0, AUTHLIM = 3
            cfgWriteCmd[3] = USER_START_PAGE.toByte() // AUTH0 = 4
            cfgWriteCmd[4] = 0x00.toByte()
            cfgWriteCmd[5] = 0x00.toByte()
            nfcA.transceive(cfgWriteCmd)

            Log.i(TAG, "NTAG213 successfully password-locked for write operations starting at Page 4")
            return true
            
        } catch (e: Exception) {
            Log.e(TAG, "Error writing and locking tag: ${e.message}")
            return false
        } finally {
            try {
                nfcA.close()
            } catch (e: IOException) {
                // Ignore
            }
        }
    }

    /**
     * Reads customer credentials from NTAG213 user memory.
     * Accessible offline.
     */
    fun readCard(tag: Tag): CardData? {
        val nfcA = NfcA.get(tag) ?: return null
        
        try {
            nfcA.connect()
            
            val accumulatedBytes = ByteArray(144) // Max user memory read size
            var bytesRead = 0

            // READ command (0x30) reads 16 bytes (4 pages) starting from page index.
            // Loop in increments of 4 pages (16 bytes).
            var pageIndex = USER_START_PAGE
            while (pageIndex <= USER_END_PAGE) {
                val readCmd = byteArrayOf(CMD_READ.toByte(), pageIndex.toByte())
                val response = nfcA.transceive(readCmd) ?: break
                
                // Copy read bytes
                val bytesToCopy = minOf(16, 144 - bytesRead)
                System.arraycopy(response, 0, accumulatedBytes, bytesRead, bytesToCopy)
                bytesRead += bytesToCopy
                
                pageIndex += 4
                if (bytesRead >= 144) break
            }

            // Convert read bytes to string and split payload
            val fullString = String(accumulatedBytes, 0, bytesRead, StandardCharsets.UTF_8).trim { it <= ' ' || it == '\u0000' }
            val delimiterIndex = fullString.indexOf('|')
            
            if (delimiterIndex == -1) {
                Log.w(TAG, "Invalid card payload: delimiter '|' not found")
                return null
            }

            val customerId = fullString.substring(0, delimiterIndex)
            val publicKeyBase64 = fullString.substring(delimiterIndex + 1)

            if (customerId.isBlank() || publicKeyBase64.isBlank()) {
                Log.w(TAG, "Invalid card payload: empty fields")
                return null
            }

            return CardData(customerId, publicKeyBase64)
            
        } catch (e: Exception) {
            Log.e(TAG, "Error reading card memory: ${e.message}")
            return null
        } finally {
            try {
                nfcA.close()
            } catch (e: IOException) {
                // Ignore
            }
        }
    }
}
