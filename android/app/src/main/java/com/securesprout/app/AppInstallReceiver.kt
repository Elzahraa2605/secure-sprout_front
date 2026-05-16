package com.securesprout.app

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log

class AppInstallReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        // 1. أول سطر ده عشان نتأكد إن الـ Terminal شغال أصلاً
        Log.d("AppMonitor", "تم لقط إشارة من النظام: ${intent.action}")

        val action = intent.action
        if (action == Intent.ACTION_PACKAGE_ADDED || action == Intent.ACTION_PACKAGE_REPLACED) {
           // val packageName = intent.data?.schemeSpecificPart
            // بدلاً من السطر القديم، استخدمي هذا السطر:
val packageName = intent.data?.encodedSchemeSpecificPart
            Log.d("AppMonitor", "تطبيق جديد تم تثبيته فعلياً: $packageName")

            if (packageName != null) {
                val serviceIntent = Intent(context, AppMonitorService::class.java)
                serviceIntent.putExtra("new_app", packageName)

                // 2. تأكيد تشغيل الخدمة فوراً
                try {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                        context.startForegroundService(serviceIntent)
                    } else {
                        context.startService(serviceIntent)
                    }
                } catch (e: Exception) {
                    Log.e("AppMonitor", "فشل في تشغيل الخدمة: ${e.message}")
                }
            }
        }
    }
}