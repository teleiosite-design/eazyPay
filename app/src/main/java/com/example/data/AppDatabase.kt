package com.example.data

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import net.sqlcipher.database.SupportFactory
import net.sqlcipher.database.SQLiteDatabase

@Database(entities = [TransactionEntity::class], version = 2, exportSchema = false)
abstract class AppDatabase : RoomDatabase() {
    abstract fun transactionDao(): TransactionDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null
        private val PASSPHRASE = "eazypay_babcock_db_sec_2026_auth".toCharArray()

        fun getDatabase(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val builder = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "eazypay_database"
                )

                try {
                    // Initialize SQLCipher native libraries
                    SQLiteDatabase.loadLibs(context.applicationContext)
                    val factory = SupportFactory(SQLiteDatabase.getBytes(PASSPHRASE))
                    builder.openHelperFactory(factory)
                } catch (e: UnsatisfiedLinkError) {
                    android.util.Log.w("AppDatabase", "SQLCipher native libraries not found. Falling back to unencrypted SQLite helper.")
                } catch (e: Exception) {
                    android.util.Log.e("AppDatabase", "Failed to configure SQLCipher: ${e.message}", e)
                }

                val instance = builder
                    .fallbackToDestructiveMigration()
                    .build()
                
                INSTANCE = instance
                instance
            }
        }
    }
}
