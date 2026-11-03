import React, { useState } from 'react';
import {
  X,
  Download,
  Code2,
  FileCode,
  Smartphone,
  Cpu,
  CheckCircle2,
  Copy,
  Layers,
  Terminal,
} from 'lucide-react';
import { AppSettings } from '../types/hisab';
import { TRANSLATIONS } from '../utils/translations';
import {
  generateAndroidProjectZip,
  generateDebugApkPackage,
} from '../utils/apkGenerator';

interface AndroidProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
}

export const AndroidProjectModal: React.FC<AndroidProjectModalProps> = ({
  isOpen,
  onClose,
  settings,
}) => {
  const t = TRANSLATIONS[settings.language];
  const [selectedFile, setSelectedFile] = useState<string>('app/build.gradle.kts');
  const [isZipping, setIsZipping] = useState<boolean>(false);
  const [isBuildingApk, setIsBuildingApk] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  // Project source code files for inspection (Swapped: Purple primary, Pink secondary)
  const ANDROID_FILES: Record<string, { lang: string; code: string; title: string }> = {
    'app/build.gradle.kts': {
      lang: 'kotlin',
      title: 'App Gradle Config (Android 10-16)',
      code: `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("com.google.devtools.ksp")
    id("org.jetbrains.kotlin.plugin.compose")
    id("kotlinx-serialization")
}

android {
    namespace = "com.mydailyhisab.app"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.mydailyhisab.app"
        minSdk = 29 // Android 10+
        targetSdk = 35 // Android 15/16 (e.g. Redmi Note 14 Pro)
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables { useSupportLibrary = true }
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
        debug {
            applicationIdSuffix = ".debug"
            isDebuggable = true
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions { jvmTarget = "17" }
    buildFeatures { compose = true }
}

dependencies {
    val composeBom = platform("androidx.compose:compose-bom:2024.10.01")
    implementation(composeBom)

    implementation("androidx.core:core-ktx:1.13.1")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.8.6")
    implementation("androidx.compose.material3:material3:1.3.0")
    implementation("androidx.navigation:navigation-compose:2.8.3")

    // Room Database
    val roomVersion = "2.6.1"
    implementation("androidx.room:room-runtime:$roomVersion")
    implementation("androidx.room:room-ktx:$roomVersion")
    ksp("androidx.room:room-compiler:$roomVersion")

    // Jetpack DataStore Preferences for permanent Light/Dark theme
    implementation("androidx.datastore:datastore-preferences:1.1.1")
}`,
    },
    'ThemePreferences.kt': {
      lang: 'kotlin',
      title: 'DataStore Preferences: ThemePreferences.kt',
      code: `package com.mydailyhisab.app.data.preferences

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

private val Context.dataStore by preferencesDataStore(name = "my_daily_hisab_theme_prefs")

class ThemePreferences(private val context: Context) {
    companion object {
        val KEY_THEME_MODE = stringPreferencesKey("theme_mode_preference")
        const val THEME_LIGHT = "light"
        const val THEME_DARK = "dark"
    }

    // Default on very first launch is Light Mode ("light")
    val themeModeFlow: Flow<String> = context.dataStore.data.map { prefs ->
        prefs[KEY_THEME_MODE] ?: THEME_LIGHT
    }

    suspend fun setThemeMode(mode: String) {
        context.dataStore.edit { prefs -> prefs[KEY_THEME_MODE] = mode }
    }
}`,
    },
    'Theme.kt': {
      lang: 'kotlin',
      title: 'Compose Theme: Theme.kt (Swapped: Purple primary, Pink secondary)',
      code: `package com.mydailyhisab.app.ui.theme

import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

// Swapped Accents: Purple primary, Pink secondary, Orange unchanged
val AccentPurple = Color(0xFF8B5CF6)
val AccentVelvet = Color(0xFF7C3AED)
val AccentMagenta = Color(0xFFD946EF)
val AccentOrange = Color(0xFFF97316)

private val LuxuryDarkScheme = darkColorScheme(
    primary = AccentVelvet,
    secondary = AccentMagenta,
    tertiary = AccentOrange,
    background = Color(0xFF08060B),
    surface = Color(0xFF120D1B)
)

private val LuxuryLightScheme = lightColorScheme(
    primary = AccentVelvet,
    secondary = AccentMagenta,
    tertiary = Color(0xFFEA580C),
    background = Color(0xFFF8F5FC),
    surface = Color(0xFFFFFFFF)
)

@Composable
fun MyDailyHisabTheme(
    // Default on very first launch MUST be Light Mode (isDarkMode = false)
    isDarkMode: Boolean = false,
    content: @Composable () -> Unit
) {
    val colorScheme = if (isDarkMode) LuxuryDarkScheme else LuxuryLightScheme
    MaterialTheme(colorScheme = colorScheme, content = content)
}`,
    },
    'TransactionEntity.kt': {
      lang: 'kotlin',
      title: 'Room Entity: TransactionEntity.kt',
      code: `package com.mydailyhisab.app.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey
import kotlinx.serialization.Serializable

enum class TransactionType { INCOME, EXPENSE, SAVINGS }
enum class PaymentMethod { CASH, BKASH, NAGAD, BANK, CARD, OTHER }

@Serializable
@Entity(tableName = "transactions")
data class TransactionEntity(
    @PrimaryKey
    val id: String,
    val amount: Double,
    val type: TransactionType,
    val categoryId: String,
    val date: String, // YYYY-MM-DD
    val time: String, // HH:mm
    val paymentMethod: PaymentMethod,
    val note: String = "",
    val createdAt: Long = System.currentTimeMillis()
)`,
    },
    'TransactionDao.kt': {
      lang: 'kotlin',
      title: 'Room DAO: TransactionDao.kt',
      code: `package com.mydailyhisab.app.data.local

import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Dao
interface TransactionDao {
    @Query("SELECT * FROM transactions ORDER BY date DESC, time DESC")
    fun getAllTransactionsFlow(): Flow<List<TransactionEntity>>

    @Query("SELECT * FROM transactions WHERE date LIKE :monthPrefix || '%' ORDER BY date DESC")
    fun getTransactionsByMonthFlow(monthPrefix: String): Flow<List<TransactionEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertTransaction(transaction: TransactionEntity)

    @Update
    suspend fun updateTransaction(transaction: TransactionEntity)

    @Query("DELETE FROM transactions WHERE id = :id")
    suspend fun deleteTransactionById(id: String)
}`,
    },
    'AndroidManifest.xml': {
      lang: 'xml',
      title: 'Android Manifest',
      code: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-permission android:name="android.permission.VIBRATE" />
    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:theme="@style/Theme.MyDailyHisab">
        <activity android:name=".MainActivity" android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`,
    },
    'values-bn/strings.xml': {
      lang: 'xml',
      title: 'Bengali Strings: strings.xml',
      code: `<resources>
    <string name="app_name">আমার দৈনিক হিসাব</string>
    <string name="app_tagline">প্রিমিয়াম লাক্সারি দৈনিক হিসাব ও রুম লেজার</string>
    <string name="home">নীড়পাতা</string>
    <string name="transactions">লেনদেন</string>
    <string name="reports">প্রতিবেদন</string>
    <string name="categories">ক্যাটাগরি</string>
    <string name="settings">সেটিংস</string>
    <string name="total_balance">বর্তমান মোট স্থিতি</string>
    <string name="income">আয়</string>
    <string name="expense">ব্যয়</string>
    <string name="savings">সঞ্চয়</string>
</resources>`,
    },
  };

  const currentFileContent = ANDROID_FILES[selectedFile] || ANDROID_FILES['app/build.gradle.kts'];

  // Handle Download Project Zip
  const handleDownloadZip = async () => {
    try {
      setIsZipping(true);
      const blob = await generateAndroidProjectZip();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'MyDailyHisab_Android_Project.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    } finally {
      setIsZipping(false);
    }
  };

  // Handle Download Debug APK
  const handleDownloadApk = async () => {
    try {
      setIsBuildingApk(true);
      const blob = await generateDebugApkPackage();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'MyDailyHisab-debug.apk';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    } finally {
      setIsBuildingApk(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(currentFileContent.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-xs">
      <div
        className="w-full max-w-4xl bg-[#0F0A18] border border-[#2B1D42] rounded-3xl max-h-[94vh] flex flex-col overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#231738] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#1C122D] border border-[#3A245C] flex items-center justify-center text-[#8B5CF6]">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  {t.androidProject}
                </h2>
                <span className="px-2 py-0.5 rounded bg-[#21163A] border border-[#382357] text-[10px] font-mono text-[#8B5CF6]">
                  Kotlin + Compose
                </span>
              </div>
              <p className="text-[11px] text-[#948BA5] font-mono">
                minSdk: 29 (Android 10) · targetSdk: 35 (Android 16 / Redmi Note 14 Pro)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#948BA5] hover:text-white hover:bg-[#1E142F] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Download Buttons */}
        <div className="px-5 py-3 bg-[#130D20] border-b border-[#231738] flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2">
            {/* Download Full Complete Source Code (.zip) */}
            <a
              href="/My_Daily_Hisab_Source_Code.zip"
              download="My_Daily_Hisab_Source_Code.zip"
              className="px-4 py-2 rounded-xl bg-[#D946EF] hover:bg-[#C026D3] font-bold text-xs text-white shadow-md flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>
                {settings.language === 'bn' ? 'সোর্স কোড (ZIP)' : 'Full Source Code (.zip)'}
              </span>
            </a>

            {/* Download Debug APK */}
            <button
              onClick={handleDownloadApk}
              disabled={isBuildingApk}
              className="px-4 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] font-bold text-xs text-white shadow-md flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>
                {isBuildingApk
                  ? settings.language === 'bn' ? 'প্রস্তুত হচ্ছে...' : 'Generating APK...'
                  : t.downloadApk}
              </span>
            </button>

            {/* Download Complete Gradle Project (.zip) */}
            <button
              onClick={handleDownloadZip}
              disabled={isZipping}
              className="px-4 py-2 rounded-xl bg-[#1F1532] hover:bg-[#2C1D45] border border-[#3B255E] font-semibold text-xs text-[#D946EF] flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <FileCode className="w-4 h-4" />
              <span>
                {isZipping
                  ? settings.language === 'bn' ? 'জিপ তৈরি হচ্ছে...' : 'Zipping Project...'
                  : t.downloadSource}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#948BA5] font-mono">
            <span className="w-2 h-2 rounded-full bg-[#D946EF]" />
            <span>Full Source &amp; Android 16 Ready</span>
          </div>
        </div>

        {/* File Tabs & Code Preview */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* File selector sidebar */}
          <div className="w-full md:w-56 bg-[#0D0816] border-r border-[#201533] p-2 space-y-1 overflow-y-auto shrink-0">
            <span className="px-2 py-1 text-[10px] font-mono uppercase text-[#736888] block">
              {settings.language === 'bn' ? 'সোর্স ফাইলসমূহ' : 'Project Files'}
            </span>
            {Object.keys(ANDROID_FILES).map((fileName) => (
              <button
                key={fileName}
                onClick={() => setSelectedFile(fileName)}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-mono truncate transition-colors cursor-pointer ${
                  selectedFile === fileName
                    ? 'bg-[#21163A] text-[#8B5CF6] font-semibold'
                    : 'text-[#948BA5] hover:text-white hover:bg-[#181026]'
                }`}
              >
                {fileName}
              </button>
            ))}

            <div className="pt-4 px-2">
              <span className="text-[10px] font-mono uppercase text-[#736888] block mb-1">
                {settings.language === 'bn' ? 'ডিভাইস যাচাই' : 'Compatibility'}
              </span>
              <div className="p-2.5 rounded-xl bg-[#140E20] border border-[#241738] text-[11px] text-[#A69BB9] space-y-1">
                <div className="text-white font-semibold">Redmi Note 14 Pro</div>
                <div>Android 10 - 16</div>
                <div className="text-[#8B5CF6]">Jetpack Compose 1.7</div>
              </div>
            </div>
          </div>

          {/* Code Viewer Panel */}
          <div className="flex-1 flex flex-col bg-[#0A0711] overflow-hidden">
            <div className="px-4 py-2 border-b border-[#1E142F] flex items-center justify-between text-xs bg-[#120C1F]">
              <span className="font-mono text-[#8B5CF6] font-medium">{selectedFile}</span>
              <button
                onClick={copyCode}
                className="flex items-center gap-1 text-[11px] font-mono text-[#948BA5] hover:text-white cursor-pointer"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-[#8B5CF6]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>

            <pre className="flex-1 p-4 overflow-auto font-mono text-xs text-[#D8D0E8] leading-relaxed selection:bg-[#7C3AED]/30 selection:text-white">
              <code>{currentFileContent.code}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
