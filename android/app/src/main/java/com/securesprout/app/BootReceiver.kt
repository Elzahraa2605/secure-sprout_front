package com.securesprout.app

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

class BootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_BOOT_COMPLETED) {
            // أول ما الموبايل يفتح، بنشغل الخدمة فوراً
            val serviceIntent = Intent(context, AppMonitorService::class.java)
            context.startForegroundService(serviceIntent)
        }
    }
}