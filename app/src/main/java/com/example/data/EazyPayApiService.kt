package com.example.data

import retrofit2.Retrofit
import retrofit2.converter.moshi.MoshiConverterFactory
import retrofit2.http.Body
import retrofit2.http.Header
import retrofit2.http.POST
import retrofit2.http.GET
import retrofit2.http.Path
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import com.squareup.moshi.Moshi
import com.squareup.moshi.kotlin.reflect.KotlinJsonAdapterFactory

// --- API Request/Response Models ---

data class RegisterCustomerRequest(
    val name: String,
    val phone: String,
    val publicKeyBase64: String,
    val initialBalance: Double = 5000.0
)

data class CustomerResponse(
    val id: String,
    val name: String,
    val phone: String,
    val balance: Double,
    val publicKeyBase64: String?,
    val isPhoneVerified: Boolean
)

data class RegisterMerchantRequest(
    val name: String,
    val phone: String,
    val password: String
)

data class MerchantResponse(
    val id: String,
    val name: String,
    val phone: String,
    val balance: Double,
    val isPhoneVerified: Boolean
)

data class SendOtpRequest(
    val phone: String,
    val role: String // "customer" or "vendor"
)

data class SendOtpResponse(
    val success: Boolean,
    val otpCode: String?
)

data class VerifyOtpRequest(
    val phone: String,
    val otp: String,
    val role: String
)

data class VerifyOtpResponse(
    val success: Boolean
)

data class SetPinRequest(
    val phone: String,
    val pin: String
)

data class SetPinResponse(
    val success: Boolean
)

data class TransferRequest(
    val recipientPhone: String,
    val amount: Double,
    val pin: String
)

data class TransferResponse(
    val success: Boolean,
    val message: String
)

data class LoginRequest(
    val phone: String,
    val password: String
)

data class LoginResponse(
    val accessToken: String
)

data class SyncTransactionPayload(
    val customerId: String,
    val vendorId: String,
    val amount: Double,
    val nonce: Int,
    val timestamp: Long,
    val signature: String
)

data class SyncTransactionsRequest(
    val transactions: List<SyncTransactionPayload>
)

data class SyncResponse(
    val success: Boolean,
    val message: String? = null
)

// --- Retrofit Interface Definition ---

interface EazyPayApiService {
    @POST("users/register")
    suspend fun registerCustomer(@Body body: RegisterCustomerRequest): CustomerResponse

    @POST("merchants/register")
    suspend fun registerMerchant(@Body body: RegisterMerchantRequest): MerchantResponse

    @POST("auth/login")
    suspend fun login(@Body body: LoginRequest): LoginResponse

    @POST("auth/send-otp")
    suspend fun sendOtp(@Body body: SendOtpRequest): SendOtpResponse

    @POST("auth/verify-otp")
    suspend fun verifyOtp(@Body body: VerifyOtpRequest): VerifyOtpResponse

    @POST("users/set-pin")
    suspend fun setCustomerPin(@Body body: SetPinRequest): SetPinResponse

    @POST("merchants/set-pin")
    suspend fun setMerchantPin(@Body body: SetPinRequest): SetPinResponse

    @POST("transactions/sync")
    suspend fun syncTransactions(
        @Header("Authorization") token: String,
        @Body body: SyncTransactionsRequest
    ): List<SyncResponse>

    @GET("users/{id}")
    suspend fun getCustomerProfile(@Path("id") id: String): CustomerResponse

    @GET("merchants/{id}")
    suspend fun getMerchantProfile(@Path("id") id: String): MerchantResponse

    @POST("users/transfer")
    suspend fun transferFunds(
        @Header("Authorization") token: String,
        @Body body: TransferRequest
    ): TransferResponse
}

// --- Retrofit Client Provider ---

object EazyPayApiClient {
    private val moshi = Moshi.Builder()
        .add(KotlinJsonAdapterFactory())
        .build()

    private val okHttpClient = OkHttpClient.Builder()
        .addInterceptor(HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        })
        .build()

    val apiService: EazyPayApiService by lazy {
        Retrofit.Builder()
            .baseUrl("http://10.0.2.2:3000/") // Localhost address seen by the Android emulator
            .client(okHttpClient)
            .addConverterFactory(MoshiConverterFactory.create(moshi))
            .build()
            .create(EazyPayApiService::class.java)
    }
}
