package com.example.security

import android.util.Base64
import org.junit.Assert.*
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config
import java.security.KeyPairGenerator
import java.security.Signature
import java.security.spec.ECGenParameterSpec

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34])
class CryptographyManagerTest {

    @Test
    fun testOfflineSignatureVerification_CorrectSignature_ReturnsTrue() {
        // Generate a standard EC keypair in memory for testing (not utilizing the Android Keystore)
        val keyPairGenerator = KeyPairGenerator.getInstance("EC")
        keyPairGenerator.initialize(ECGenParameterSpec("secp256r1"))
        val keyPair = keyPairGenerator.generateKeyPair()

        val payload = "EP-0047|1|1720000000000|500.0"

        // Sign the payload
        val privateKey = keyPair.private
        val signatureEngine = Signature.getInstance("SHA256withECDSA")
        signatureEngine.initSign(privateKey)
        signatureEngine.update(payload.toByteArray(Charsets.UTF_8))
        val signatureBytes = signatureEngine.sign()

        // Encode keys and signatures in Base64 (Robolectric shadows android.util.Base64)
        val publicKeyBase64 = Base64.encodeToString(keyPair.public.encoded, Base64.NO_WRAP)
        val signatureBase64 = Base64.encodeToString(signatureBytes, Base64.NO_WRAP)

        // Verify using CryptographyManager
        val isValid = CryptographyManager.verifySignature(
            payload = payload,
            signatureBase64 = signatureBase64,
            publicKeyBase64 = publicKeyBase64
        )

        assertTrue("Verification should succeed with correct signature", isValid)
    }

    @Test
    fun testOfflineSignatureVerification_TamperedPayload_ReturnsFalse() {
        val keyPairGenerator = KeyPairGenerator.getInstance("EC")
        keyPairGenerator.initialize(ECGenParameterSpec("secp256r1"))
        val keyPair = keyPairGenerator.generateKeyPair()

        val payload = "EP-0047|1|1720000000000|500.0"
        val tamperedPayload = "EP-0047|1|1720000000000|5000.0" // User tried to inflate balance/amount

        // Sign payload
        val privateKey = keyPair.private
        val signatureEngine = Signature.getInstance("SHA256withECDSA")
        signatureEngine.initSign(privateKey)
        signatureEngine.update(payload.toByteArray(Charsets.UTF_8))
        val signatureBytes = signatureEngine.sign()

        val publicKeyBase64 = Base64.encodeToString(keyPair.public.encoded, Base64.NO_WRAP)
        val signatureBase64 = Base64.encodeToString(signatureBytes, Base64.NO_WRAP)

        // Verify with tampered payload
        val isValid = CryptographyManager.verifySignature(
            payload = tamperedPayload,
            signatureBase64 = signatureBase64,
            publicKeyBase64 = publicKeyBase64
        )

        assertFalse("Verification should fail if payload is tampered", isValid)
    }

    @Test
    fun testOfflineSignatureVerification_IncorrectKey_ReturnsFalse() {
        val keyPairGenerator = KeyPairGenerator.getInstance("EC")
        keyPairGenerator.initialize(ECGenParameterSpec("secp256r1"))
        
        val keyPair1 = keyPairGenerator.generateKeyPair()
        val keyPair2 = keyPairGenerator.generateKeyPair() // Different keypair

        val payload = "EP-0047|1|1720000000000|500.0"

        // Sign with key 1
        val privateKey1 = keyPair1.private
        val signatureEngine = Signature.getInstance("SHA256withECDSA")
        signatureEngine.initSign(privateKey1)
        signatureEngine.update(payload.toByteArray(Charsets.UTF_8))
        val signatureBytes = signatureEngine.sign()

        // Encode with key 2's public key (e.g. wrong key verification)
        val publicKeyBase64For2 = Base64.encodeToString(keyPair2.public.encoded, Base64.NO_WRAP)
        val signatureBase64 = Base64.encodeToString(signatureBytes, Base64.NO_WRAP)

        val isValid = CryptographyManager.verifySignature(
            payload = payload,
            signatureBase64 = signatureBase64,
            publicKeyBase64 = publicKeyBase64For2
        )

        assertFalse("Verification should fail with incorrect verification key", isValid)
    }
}
