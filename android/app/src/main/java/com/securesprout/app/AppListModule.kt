package com.securesprout.app

import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.provider.Settings
import android.content.pm.PackageManager
import android.app.ActivityManager
import com.facebook.react.bridge.*
import java.util.*

class AppListModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "AppListModule"
    }

    // 1. جلب استهلاك التطبيقات (للعرض في القائمة)
    @ReactMethod
    fun getTodayUsage(promise: Promise) {
        try {
            val usageStatsManager = reactApplicationContext.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
            val pm = reactApplicationContext.packageManager
            
            val calendar = Calendar.getInstance()
            val endTime = calendar.timeInMillis
            calendar.set(Calendar.HOUR_OF_DAY, 0)
            calendar.set(Calendar.MINUTE, 0)
            calendar.set(Calendar.SECOND, 0)
            val startTime = calendar.timeInMillis

            val stats = usageStatsManager.queryAndAggregateUsageStats(startTime, endTime)
            val appList: WritableArray = Arguments.createArray()

            val mainIntent = Intent(Intent.ACTION_MAIN, null)
            mainIntent.addCategory(Intent.CATEGORY_LAUNCHER)
            val launchableApps = pm.queryIntentActivities(mainIntent, 0)

            for (resolveInfo in launchableApps) {
                val packageName = resolveInfo.activityInfo.packageName
                val appMap: WritableMap = Arguments.createMap()
                
                val appLabel = resolveInfo.loadLabel(pm).toString()
                
                val usageStat = stats[packageName]
                val durationInMinutes = if (usageStat != null) {
                    (usageStat.totalTimeInForeground / 60000).toInt()
                } else {
                    0
                }

                appMap.putString("appName", appLabel)
                appMap.putString("packageName", packageName)
                appMap.putInt("duration", durationInMinutes)
                
                appList.pushMap(appMap)
            }

            promise.resolve(appList)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    // 2. دالة كشف التطبيق الحالي (المعدلة لترجع الـ Pixel Launcher فوراً ليفهمه الـ React Native)
    @ReactMethod
    fun getCurrentApp(promise: Promise) {
        try {
            val usageStatsManager = reactApplicationContext.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
            val time = System.currentTimeMillis()
            
            val stats = usageStatsManager.queryUsageStats(UsageStatsManager.INTERVAL_DAILY, time - 1000 * 10, time)
            
            if (stats != null && stats.isNotEmpty()) {
                val sortedStats = stats.sortedByDescending { it.lastTimeUsed }
                
                for (stat in sortedStats) {
                    val pkg = stat.packageName
                    
                    // هنا بنرجع اسم الحزمة المفتوحة أياً كانت عشان الـ React Native يقارنها بذكاء ويقفل في الـ Downtime
                    promise.resolve(pkg)
                    return
                }
            }
            promise.resolve("none")
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    // 3. دالة الخروج للهوم (المعدلة لفتح الـ Pixel Launcher مباشرة وبدون إظهار الـ Pop-up)
    @ReactMethod
    fun goToHomeScreen() {
        try {
            val intent = Intent(Intent.ACTION_MAIN)
            intent.addCategory(Intent.CATEGORY_HOME)
            // إجبار فتح حزمة الـ Pixel Launcher مباشرة والنشاط الرئيسي بتاعه لعدم التداخل
            intent.setClassName("com.google.android.apps.nexuslauncher", "com.google.android.apps.nexuslauncher.NexusLauncherActivity")
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
            reactApplicationContext.startActivity(intent)
        } catch (e: Exception) {
            // خطة بديلة لو اختلف اسم الكلاس الداخلي في المحاكي
            try {
                val intent = reactApplicationContext.packageManager.getLaunchIntentForPackage("com.google.android.apps.nexuslauncher")
                if (intent != null) {
                    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    reactApplicationContext.startActivity(intent)
                } else {
                    // الحل الأخير العادي للأندرويد
                    val normalIntent = Intent(Intent.ACTION_MAIN)
                    normalIntent.addCategory(Intent.CATEGORY_HOME)
                    normalIntent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
                    reactApplicationContext.startActivity(normalIntent)
                }
            } catch (ex: Exception) {
                ex.printStackTrace()
            }
        }
    }

    // 4. دالة الحظر القسري
    @ReactMethod
    fun forceLockScreen() {
        try {
            val context = reactApplicationContext
            val intent = context.packageManager.getLaunchIntentForPackage(context.packageName)
            if (intent != null) {
                intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or 
                               Intent.FLAG_ACTIVITY_SINGLE_TOP or 
                               Intent.FLAG_ACTIVITY_REORDER_TO_FRONT
                context.startActivity(intent)
            }
        } catch (e: Exception) { }
    }

    @ReactMethod
    fun bringAppToFront() {
        forceLockScreen()
    }

    // 5. فتح الإعدادات
    @ReactMethod
    fun openUsageSettings() {
        val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS)
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
        reactApplicationContext.startActivity(intent)
    }

    @ReactMethod
    fun openOverlaySettings() {
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
            val intent = Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION)
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
            reactApplicationContext.startActivity(intent)
        }
    }

    // 6. تشغيل الخدمة
    @ReactMethod
    fun startMonitorService() {
        val intent = Intent(reactApplicationContext, AppMonitorService::class.java)
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
            reactApplicationContext.startForegroundService(intent)
        } else {
            reactApplicationContext.startService(intent)
        }
    }

    // 7. دالة فحص استهلاك تطبيق معين (جديدة للـ Timer)
    @ReactMethod
    fun getTodayUsageForApp(packageName: String, promise: Promise) {
        try {
            val usageStatsManager = reactApplicationContext.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
            val calendar = Calendar.getInstance()
            
            // ضبط الوقت لبداية اليوم الحالي (12 صباحاً)
            calendar.set(Calendar.HOUR_OF_DAY, 0)
            calendar.set(Calendar.MINUTE, 0)
            calendar.set(Calendar.SECOND, 0)
            calendar.set(Calendar.MILLISECOND, 0)
            
            val startTime = calendar.timeInMillis
            val endTime = System.currentTimeMillis()

            val stats = usageStatsManager.queryAndAggregateUsageStats(startTime, endTime)
            
            val usageStat = stats[packageName]
            if (usageStat != null) {
                // تحويل الملي ثانية لدقائق
                val durationInMinutes = (usageStat.totalTimeInForeground / 60000).toInt()
                promise.resolve(durationInMinutes)
            } else {
                promise.resolve(0)
            }
        } catch (e: Exception) {
            promise.reject("TIMER_ERROR", e.message)
        }
    }
}