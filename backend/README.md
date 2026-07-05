To view the local offline Room database of the Android application for real-time comparison, you have two options depending on your preference.

NOTE

EazyPay implements SQLCipher Database Encryption to protect offline transaction ledger files. The database decryption password is: eazypay_babcock_db_sec_2026_auth

Option A: Using Android Studio App Inspection (Recommended)
This is the easiest method because Android Studio automatically decrypts and displays the database in real-time as the emulator runs.

Open Android Studio.
Start your Android Emulator and run the app.
Go to the top menu and select View > Tool Windows > App Inspection.
In the tool window that opens at the bottom, select the Database Inspector tab.
Select your running app process (e.g., com.example.customer or com.example.merchant) from the dropdown.
You will see eazypay_database listed. Expand it to see the transactions table. You can view, run SQL queries, and see live updates as you trigger checkouts.
Option B: Pulling the Database to Open in TablePlus
If you prefer to compare both side-by-side in TablePlus:

Locate the database file on the emulator: The database files are stored in the app's secure private folder:

Customer Flavor: /data/data/com.example.customer/databases/eazypay_database
Merchant Flavor: /data/data/com.example.merchant/databases/eazypay_database
Pull the file to your computer using ADB: Open your terminal and run:

bash


# For Customer flavor:
adb pull /data/data/com.example.customer/databases/eazypay_database ~/Downloads/eazypay_customer.db
# For Merchant flavor:
adb pull /data/data/com.example.merchant/databases/eazypay_database ~/Downloads/eazypay_merchant.db
Open in TablePlus:

Create a new SQLite connection in TablePlus.
Choose the pulled file (eazypay_customer.db or eazypay_merchant.db).
Since the database is encrypted, TablePlus will prompt you for the Encryption Key/Passphrase. Enter: eazypay_babcock_db_sec_2026_auth
Click Connect to view your offline transactions ledger.