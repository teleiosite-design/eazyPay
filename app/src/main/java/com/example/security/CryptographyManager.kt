package com.example.security

import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import android.util.Base64
import java.security.KeyStore
import java.security.KeyPairGenerator
import java.security.PrivateKey
import java.security.PublicKey
import java.security.Signature
import java.security.spec.ECGenParameterSpec
import java.security.spec.X509EncodedKeySpec
import java.security.KeyFactory

object CryptographyManager {
    private const val KEY_STORE_PROVIDER = "AndroidKeyStore"
    private const val KEY_ALIAS = "eazypay_auth_key"
    private const val SIGNING_ALGORITHM = "SHA256withECDSA"

    init {
        try {
            if (isKeystoreSupported() && !hasKeyPair()) {
                generateKeyPair()
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun isKeystoreSupported(): Boolean {
        return try {
            KeyStore.getInstance(KEY_STORE_PROVIDER)
            true
        } catch (e: Exception) {
            false
        }
    }

    /**
     * Checks if the KeyPair exists in the Android Keystore.
     */
    fun hasKeyPair(): Boolean {
        return try {
            val keyStore = KeyStore.getInstance(KEY_STORE_PROVIDER)
            keyStore.load(null)
            keyStore.containsAlias(KEY_ALIAS)
        } catch (e: Exception) {
            e.printStackTrace()
            false
        }
    }

    /**
     * Generates a hardware-backed ECDSA key pair using the secp256k1 curve.
     */
    fun generateKeyPair() {
        try {
            val keyPairGenerator = KeyPairGenerator.getInstance(
                KeyProperties.KEY_ALGORITHM_EC,
                KEY_STORE_PROVIDER
            )
            
            val parameterSpec = KeyGenParameterSpec.Builder(
                KEY_ALIAS,
                KeyProperties.PURPOSE_SIGN or KeyProperties.PURPOSE_VERIFY
            )
                .setAlgorithmParameterSpec(ECGenParameterSpec("secp256r1"))
                .setDigests(KeyProperties.DIGEST_SHA256)
                .build()

            keyPairGenerator.initialize(parameterSpec)
            keyPairGenerator.generateKeyPair()
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    /**
     * Retrieves the public key from the Android Keystore.
     */
    fun getPublicKey(): PublicKey? {
        return try {
            val keyStore = KeyStore.getInstance(KEY_STORE_PROVIDER)
            keyStore.load(null)
            val certificate = keyStore.getCertificate(KEY_ALIAS)
            certificate?.publicKey
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }

    /**
     * Returns the public key encoded as a Base64 string so it can be written to NFC/QR.
     */
    fun getPublicKeyBase64(): String? {
        val publicKey = getPublicKey() ?: return null
        return Base64.encodeToString(publicKey.encoded, Base64.NO_WRAP)
    }

    /**
     * Signs a transaction payload (e.g. "customerId|nonce|amount|timestamp") using the private key.
     * Returns the signature encoded in Base64.
     */
    fun signPayload(payload: String): String? {
        return try {
            val keyStore = KeyStore.getInstance(KEY_STORE_PROVIDER)
            keyStore.load(null)
            
            val privateKey = keyStore.getKey(KEY_ALIAS, null) as? PrivateKey 
                ?: return null

            val signature = Signature.getInstance(SIGNING_ALGORITHM)
            signature.initSign(privateKey)
            signature.update(payload.toByteArray(Charsets.UTF_8))
            
            val signatureBytes = signature.sign()
            Base64.encodeToString(signatureBytes, Base64.NO_WRAP)
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }

    /**
     * Verifies an ECDSA signature offline using a public key (both Base64 encoded).
     */
    fun verifySignature(payload: String, signatureBase64: String, publicKeyBase64: String): Boolean {
        return try {
            val publicKeyBytes = Base64.decode(publicKeyBase64, Base64.NO_WRAP)
            val keySpec = X509EncodedKeySpec(publicKeyBytes)
            val keyFactory = KeyFactory.getInstance("EC")
            val publicKey = keyFactory.generatePublic(keySpec)

            val signatureBytes = Base64.decode(signatureBase64, Base64.NO_WRAP)

            val signature = Signature.getInstance(SIGNING_ALGORITHM)
            signature.initVerify(publicKey)
            signature.update(payload.toByteArray(Charsets.UTF_8))
            
            signature.verify(signatureBytes)
        } catch (e: Exception) {
            e.printStackTrace()
            false
        }
    }

    /**
     * Deletes the key alias from the keystore (used during sign-out or resets).
     */
    fun deleteKey() {
        try {
            val keyStore = KeyStore.getInstance(KEY_STORE_PROVIDER)
            keyStore.load(null)
            if (keyStore.containsAlias(KEY_ALIAS)) {
                keyStore.deleteEntry(KEY_ALIAS)
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}
