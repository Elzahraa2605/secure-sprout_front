package com.securesprout.app

import android.app.*
import android.content.*
import android.os.*
import android.app.usage.UsageStatsManager
import android.util.Log
import android.content.pm.PackageManager
import android.content.pm.ResolveInfo
import androidx.core.app.NotificationCompat
import org.json.JSONArray
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import java.util.Calendar
import kotlin.concurrent.thread

class AppMonitorService : Service() {
    private val handler = Handler(Looper.getMainLooper())
    
    private var allowedApps = mutableListOf<String>() 
    private var blockedApps = mutableListOf<String>() 
    private val reportedAppsInSession = mutableSetOf<String>()

    // 🚀 متغيرات الـ Downtime الأصلية بتاعتك بدون المساس بها
    private var downtimeStartTime: String? = null
    private var downtimeEndTime: String? = null
    private var isDowntimeEnabled = false
    private val downtimeDays = mutableListOf<Int>()

    // 1. برودكاست ريسيفر يلقط حذف التطبيقات فوراً
    private val packageRemovedReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            if (intent?.action == Intent.ACTION_PACKAGE_REMOVED) {
                val packageName = intent.data?.schemeSpecificPart
                Log.d("AppMonitor", "🗑️ تم مسح تطبيق: $packageName - جاري تحديث السيرفر...")
                syncInitialApps() // نادى المزامنة فوراً عشان يتمسح من الداتابيز
            }
        }
    }

    private val checkRunnable = object : Runnable {
        override fun run() {
            checkCurrentApp()
            handler.postDelayed(this, 1000)
        }
    }

    private val updateAppsRunnable = object : Runnable {
        override fun run() {
            // تحديث البيانات المعتاد من السيرفر
            fetchAllDataFromServer()
            // فحص إضافي سريع ومباشر للـ Downtime من السيرفر لضمان المزامنة الفورية
            fetchDowntimeFastFromServer()
            handler.postDelayed(this, 60000) 
        }
    }

    private fun getChildIdFromStorage(): String {
        val sharedPref = getSharedPreferences("UserPrefs", Context.MODE_PRIVATE)
        return sharedPref.getString("child_id", "100") ?: "100"
    }

    override fun onCreate() {
        super.onCreate()
        // تسجيل الريسيفر لمراقبة الحذف
        val filter = IntentFilter().apply {
            addAction(Intent.ACTION_PACKAGE_REMOVED)
            addDataScheme("package")
        }
        registerReceiver(packageRemovedReceiver, filter)
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        createNotificationChannel()
        val notification = NotificationCompat.Builder(this, "monitor_channel")
            .setContentTitle("SecureSprout Protection Active")
            .setSmallIcon(android.R.drawable.ic_lock_lock)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
        
        startForeground(1, notification)
        
        syncInitialApps()
        
        handler.post(checkRunnable)
        handler.post(updateAppsRunnable)
        return START_STICKY
    }

    private fun syncInitialApps() {
        val childId = getChildIdFromStorage()
        thread {
            try {
                val pm = packageManager
                val mainIntent = Intent(Intent.ACTION_MAIN, null)
                mainIntent.addCategory(Intent.CATEGORY_LAUNCHER)
                
                val resolvedInfos: List<ResolveInfo> = pm.queryIntentActivities(mainIntent, 0)
                val appList = JSONArray()

                for (resolveInfo in resolvedInfos) {
                    val packageName = resolveInfo.activityInfo.packageName
                    if (packageName != this.packageName) {
                        val obj = JSONObject()
                        obj.put("package_name", packageName)
                        obj.put("app_name", resolveInfo.loadLabel(pm).toString())
                        appList.put(obj)
                    }
                }

                val json = JSONObject()
                json.put("child_id", childId)
                json.put("apps", appList)

                val url = URL("http://192.168.1.9:8000/api/child/sync-all-apps")
                val conn = url.openConnection() as HttpURLConnection
                conn.requestMethod = "POST"
                conn.setRequestProperty("Content-Type", "application/json; utf-8")
                conn.doOutput = true
                conn.outputStream.use { it.write(json.toString().toByteArray()) }

                if (conn.responseCode in 200..201) {
                    Log.d("AppMonitor", "✅ مزامنة ناجحة (تم تنظيف المحذوفات)")
                    fetchAllDataFromServer()
                }
            } catch (e: Exception) {
                Log.e("AppMonitor", "❌ فشل المزامنة: ${e.message}")
            }
        }
    }

    private fun fetchAllDataFromServer() {
        val childId = getChildIdFromStorage()
        thread {
            try {
                val blockedUrl = URL("http://192.168.1.9:8000/api/child/$childId/blocked-apps")
                blockedApps = parseJsonArray(blockedUrl)

                val allowedUrl = URL("http://192.168.1.9:8000/api/child/$childId/allowed-apps")
                val newAllowed = parseJsonArray(allowedUrl)
                if (newAllowed.isNotEmpty()) {
                    allowedApps = newAllowed
                }
                
                // تنظيف الذاكرة المؤقتة من التطبيقات اللي اتعرفت خلاص
                reportedAppsInSession.removeAll(blockedApps.toSet())
                reportedAppsInSession.removeAll(allowedApps.toSet())

                Log.d("AppMonitor", "✅ تحديث القوائم بنجاح")
            } catch (e: Exception) {
                Log.e("AppMonitor", "❌ خطأ اتصال: ${e.message}")
            }
        }
    }

    // 🔥 دالة فحص وتحديث فوري للـ Downtime مباشرة من السيرفر وتخزينها في الـ SharedPreferences
    private fun fetchDowntimeFastFromServer() {
        val childId = getChildIdFromStorage()
        thread {
            try {
                val url = URL("http://192.168.1.9:8000/api/child/downtime/check/$childId")
                val conn = url.openConnection() as HttpURLConnection
                conn.connectTimeout = 3000
                if (conn.responseCode == 200) {
                    val responseText = conn.inputStream.bufferedReader().readText()
                    val jsonResponse = JSONObject(responseText)
                    
                    // تحويل وتخزين الداتا في الكاش بنفس الفورمات اللي الكود القديم بيقراه
                    val localDowntimeJson = JSONObject()
                    val isLocked = jsonResponse.optBoolean("is_locked", false) || jsonResponse.optInt("is_locked", 0) == 1
                    val isEnabled = jsonResponse.optBoolean("is_enabled", false) || isLocked
                    
                    localDowntimeJson.put("is_enabled", isEnabled)
                    localDowntimeJson.put("start_time", jsonResponse.optString("start_time", "00:00"))
                    localDowntimeJson.put("end_time", jsonResponse.optString("end_time", "23:59"))
                    
                    // لو مقفول قسرياً نجبر الأيام تشمل اليوم الحالي
                    val daysArray = jsonResponse.optJSONArray("days") ?: JSONArray(listOf(0,1,2,3,4,5,6))
                    localDowntimeJson.put("days", daysArray)

                    val sharedPrefs = getSharedPreferences("AppPrefs", Context.MODE_PRIVATE)
                    sharedPrefs.edit().putString("downtime_list", localDowntimeJson.toString()).apply()
                    Log.d("AppMonitor", "⚡ تم تحديث كاش الـ Downtime من السيرفر فوراً")
                }
            } catch (e: Exception) {
                Log.e("AppMonitor", "❌ فشل جلب الـ Downtime الفوري: ${e.message}")
            }
        }
    }

    private fun parseJsonArray(url: URL): MutableList<String> {
        return try {
            val conn = url.openConnection() as HttpURLConnection
            conn.connectTimeout = 5000
            if (conn.responseCode == 200) {
                val response = conn.inputStream.bufferedReader().readText()
                val jsonArray = JSONArray(response)
                val list = mutableListOf<String>()
                for (i in 0 until jsonArray.length()) { list.add(jsonArray.getString(i)) }
                list
            } else mutableListOf()
        } catch (e: Exception) { mutableListOf() }
    }

    private fun checkCurrentApp() {
        // 🚀 أ) قراءة إعدادات الـ Downtime المخزنة على الجهاز من الـ SharedPreferences كما هي
        val sharedPrefs = getSharedPreferences("AppPrefs", Context.MODE_PRIVATE)
        val downtimeJsonStr = sharedPrefs.getString("downtime_list", null)

        if (downtimeJsonStr != null) {
            try {
                val json = JSONObject(downtimeJsonStr)
                isDowntimeEnabled = json.optBoolean("is_enabled", false)
                downtimeStartTime = json.optString("start_time", null)
                downtimeEndTime = json.optString("end_time", null)
                
                downtimeDays.clear()
                val daysArray = json.optJSONArray("days")
                if (daysArray != null) {
                    for (i in 0 until daysArray.length()) {
                        downtimeDays.add(daysArray.getInt(i))
                    }
                }
            } catch (e: Exception) {
                Log.e("AppMonitor", "خطأ في قراءة JSON الـ Downtime: ${e.message}")
            }
        }

        // 🚀 ب) فحص الـ Downtime بالدقائق 
        if (isDowntimeEnabled && downtimeStartTime != null && downtimeEndTime != null) {
            val calendar = Calendar.getInstance()
            val currentDayIndex = calendar.get(Calendar.DAY_OF_WEEK) - 1

            if (downtimeDays.contains(currentDayIndex)) {
                try {
                    val currentHour = calendar.get(Calendar.HOUR_OF_DAY)
                    val currentMinute = calendar.get(Calendar.MINUTE)
                    val currentTimeInMinutes = (currentHour * 60) + currentMinute

                    val startParts = downtimeStartTime!!.split(":")
                    val startMinutes = (startParts[0].toInt() * 60) + startParts[1].toInt()

                    val endParts = downtimeEndTime!!.split(":")
                    val endMinutes = (endParts[0].toInt() * 60) + endParts[1].toInt()

                    val isCurrentTimeInDowntime = if (startMinutes <= endMinutes) {
                        currentTimeInMinutes in startMinutes..endMinutes
                    } else {
                        currentTimeInMinutes >= startMinutes || currentTimeInMinutes <= endMinutes
                    }

                    if (isCurrentTimeInDowntime) {
                        val uStatsManager = getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
                        val t = System.currentTimeMillis()
                        val activeStats = uStatsManager.queryUsageStats(UsageStatsManager.INTERVAL_DAILY, t - 10000, t)
                        
                        if (activeStats != null && activeStats.isNotEmpty()) {
                            val currentTopApp = activeStats.sortedByDescending { it.lastTimeUsed }.firstOrNull()?.packageName
                            
                            // 🔥 التعديل الذكي الأساسي: لو الـ Downtime شغال والطفل برة تطبيقنا (حتى لو في الـ Pixel Launcher)، اجبره يرجع يقفل فوراً
                            if (currentTopApp != null && currentTopApp != packageName && currentTopApp != "com.android.systemui") {
                                Log.d("AppMonitor", "🔒 فترة الـ Downtime نشطة قسرياً. تم حظر التطبيق الحالي: $currentTopApp")
                                blockApp()
                            }
                        }
                        return // نخرج فوراً ونوقف الفحص العادي طول ما الـ Downtime شغال
                    }
                } catch (e: Exception) {
                    Log.e("AppMonitor", "خطأ في حسابات وقت الـ Downtime: ${e.message}")
                }
            }
        }

        // 🟢 كود الفحص القديم والأصلي بتاعك زي ما هو بالظبط بدون أي تعديل
        val usageStatsManager = getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
        val time = System.currentTimeMillis()
        val stats = usageStatsManager.queryUsageStats(UsageStatsManager.INTERVAL_DAILY, time - 10000, time)
        
        if (stats != null && stats.isNotEmpty()) {
            val lastApp = stats.sortedByDescending { it.lastTimeUsed }.firstOrNull()?.packageName
            
            if (lastApp != null && lastApp != packageName) {
                val isEssential = lastApp.contains("launcher") || 
                                 lastApp.contains("systemui") || 
                                 lastApp.contains("settings") || 
                                 lastApp == "android" ||
                                 lastApp.contains("packageinstaller") ||
                                 lastApp.contains("permissioncontroller")

                if (!isEssential) {
                    if (blockedApps.contains(lastApp)) {
                        blockApp()
                    } 
                    else if (!allowedApps.contains(lastApp)) {
                        blockApp()
                        // 🚀 ذكاء التسميع في app_requests:
                        if (!reportedAppsInSession.contains(lastApp)) {
                            reportedAppsInSession.add(lastApp)
                            sendAppRequestToLaravel(lastApp)
                        }
                    }
                }
            }
        }
    }

    // 🔥 تعديل دالة الحظر لتسحب الأبلكيشن بتاعك قسرياً للواجهة بدلاً من إرساله للهوم فقط وقت الـ Downtime
    private fun blockApp() {
        try {
            // سحب واجهة التطبيق لتقفل الشاشة بالـ LockScreen فوراً وتكسر تجميد الـ JS
            val launchIntent = packageManager.getLaunchIntentForPackage(packageName)
            if (launchIntent != null) {
                launchIntent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or 
                               Intent.FLAG_ACTIVITY_SINGLE_TOP or 
                               Intent.FLAG_ACTIVITY_REORDER_TO_FRONT
                startActivity(launchIntent)
            } else {
                // Fallback للهوم سكرين العادي لو فيه مشكلة في الـ Intent
                val homeIntent = Intent(Intent.ACTION_MAIN).apply {
                    addCategory(Intent.CATEGORY_HOME)
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK
                }
                startActivity(homeIntent)
            }
        } catch (e: Exception) {
            Log.e("AppMonitor", "خطأ أثناء سحب التطبيق للواجهة: ${e.message}")
        }
    }

    private fun sendAppRequestToLaravel(packageName: String) {
        val childId = getChildIdFromStorage()
        thread {
            try {
                val url = URL("http://192.168.1.9:8000/api/child/app-requests/store")
                val conn = url.openConnection() as HttpURLConnection
                conn.requestMethod = "POST"
                conn.setRequestProperty("Content-Type", "application/json; utf-8")
                conn.setRequestProperty("Accept", "application/json") 
                conn.doOutput = true
                
                val json = JSONObject()
                json.put("child_id", childId) 
                json.put("package_name", packageName)
                json.put("app_name", packageName) 
                
                conn.outputStream.use { it.write(json.toString().toByteArray()) }

                if (conn.responseCode in 200..201) {
                    Log.d("AppMonitor", "📡 تم إرسال طلب الموافقة لـ $packageName")
                }
                conn.disconnect()
            } catch (e: Exception) {
                Log.e("AppMonitor", "❌ فشل إرسال الطلب")
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        unregisterReceiver(packageRemovedReceiver)
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel("monitor_channel", "SecureSprout Guard", NotificationManager.IMPORTANCE_LOW)
            val manager = getSystemService(NotificationManager::class.java)
            manager?.createNotificationChannel(channel)
        }
    }

    override fun onBind(intent: Intent?): IBinder? = null
}