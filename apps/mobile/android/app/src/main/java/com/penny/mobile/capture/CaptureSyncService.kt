package com.penny.mobile.capture

import android.content.Context
import android.content.Intent
import com.facebook.react.HeadlessJsTaskService
import com.facebook.react.bridge.Arguments
import com.facebook.react.jstasks.HeadlessJsTaskConfig

/**
 * Runs the JavaScript task that sends queued messages to the API (`PennyCaptureSync`, registered
 * in `index.js`), starting React Native without a screen when the app is closed.
 */
class CaptureSyncService : HeadlessJsTaskService() {
  override fun getTaskConfig(intent: Intent?): HeadlessJsTaskConfig =
    HeadlessJsTaskConfig(TASK, Arguments.createMap(), TIMEOUT_MS, true)

  companion object {
    const val TASK = "PennyCaptureSync"
    private const val TIMEOUT_MS = 60_000L

    fun start(context: Context) {
      try {
        context.startService(Intent(context, CaptureSyncService::class.java))
        acquireWakeLockNow(context)
      } catch (e: IllegalStateException) {
        // Android won't start a service from the background right now. The message stays
        // queued and is sent the next time the task runs or the app opens.
      }
    }
  }
}
