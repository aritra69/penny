package com.penny.mobile.device

import android.app.AppOpsManager
import android.content.ActivityNotFoundException
import android.content.ComponentName
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.PowerManager
import android.os.Process
import android.provider.Settings
import androidx.core.app.NotificationManagerCompat
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray
import com.penny.mobile.capture.CaptureNotificationListener
import com.penny.mobile.capture.CaptureQueue
import com.penny.mobile.capture.CaptureSources

/**
 * Penny's view of the phone, for `lib/device` and `lib/capture`: which finance apps are installed,
 * the Android settings screens behind each permission, and the queue of captured messages.
 * SMS permissions themselves are asked from JavaScript (`PermissionsAndroid`).
 */
class PennyDeviceModule(private val context: ReactApplicationContext) :
  ReactContextBaseJavaModule(context) {

  override fun getName() = NAME

  /**
   * Which of `candidates` (package names) are installed. Penny passes its own catalogue of
   * finance apps, so the list of everything else on the phone never reaches JavaScript.
   */
  @ReactMethod
  fun getInstalledPackages(candidates: ReadableArray, promise: Promise) {
    val packageManager = context.packageManager
    val installed = Arguments.createArray()
    strings(candidates).distinct().filter { isInstalled(packageManager, it) }.forEach {
      installed.pushString(it)
    }
    promise.resolve(installed)
  }

  /** The parts of the permission state JavaScript can't read itself. */
  @ReactMethod
  fun getStatus(promise: Promise) {
    val status = Arguments.createMap()
    status.putBoolean(
      "notificationAccess",
      NotificationManagerCompat.getEnabledListenerPackages(context).contains(context.packageName),
    )
    status.putBoolean("restrictedSettings", restrictedSettings())
    status.putBoolean(
      "batteryUnrestricted",
      context.getSystemService(PowerManager::class.java)
        ?.isIgnoringBatteryOptimizations(context.packageName) == true,
    )
    promise.resolve(status)
  }

  /** Opens Penny's switch in Notification access. Resolves whether a screen opened. */
  @ReactMethod
  fun openNotificationAccessSettings(promise: Promise) {
    val component = ComponentName(context, CaptureNotificationListener::class.java)
    val detail =
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
        Intent(Settings.ACTION_NOTIFICATION_LISTENER_DETAIL_SETTINGS)
          .putExtra(
            Settings.EXTRA_NOTIFICATION_LISTENER_COMPONENT_NAME,
            component.flattenToString(),
          )
      } else null
    promise.resolve(
      open(detail) || open(Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS))
    )
  }

  /** Opens Penny's App info, where "Allow restricted settings" lives. */
  @ReactMethod
  fun openAppInfo(promise: Promise) {
    promise.resolve(
      open(
        Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:${context.packageName}"))
      )
    )
  }

  /** Asks Android to stop battery-optimising Penny, or opens the list if it can't ask. */
  @ReactMethod
  fun requestUnrestrictedBattery(promise: Promise) {
    val ask =
      Intent(
        Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS,
        Uri.parse("package:${context.packageName}"),
      )
    promise.resolve(open(ask) || open(Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS)))
  }

  /** The finance apps (package names) and "sms" Penny may read. Empty reads nothing. */
  @ReactMethod
  fun setSources(ids: ReadableArray, owner: String?, promise: Promise) {
    CaptureSources.set(context, strings(ids), owner)
    promise.resolve(null)
  }

  /** The oldest queued messages, oldest first. They stay queued until `removeCaptures`. */
  @ReactMethod
  fun peekCaptures(limit: Double, promise: Promise) {
    val list = Arguments.createArray()
    CaptureQueue(context).peek(limit.toInt()).forEach { (id, capture) ->
      val item = Arguments.createMap()
      item.putString("id", id)
      item.putString("source", capture.source)
      item.putString("sender", capture.sender)
      if (capture.title == null) item.putNull("title") else item.putString("title", capture.title)
      item.putString("text", capture.text)
      item.putString("receivedAt", capture.receivedAt)
      list.pushMap(item)
    }
    promise.resolve(list)
  }

  @ReactMethod
  fun removeCaptures(ids: ReadableArray, promise: Promise) {
    CaptureQueue(context).remove(strings(ids))
    promise.resolve(null)
  }

  private fun strings(array: ReadableArray): List<String> =
    (0 until array.size()).mapNotNull { array.getString(it) }

  private fun isInstalled(packageManager: PackageManager, packageName: String): Boolean =
    try {
      packageManager.getApplicationInfo(packageName, 0).enabled
    } catch (e: PackageManager.NameNotFoundException) {
      false
    }

  /**
   * Whether Android is holding back "restricted settings" (SMS, notification access) because
   * Penny was installed from a file rather than an app store. "Allow restricted settings" in
   * App info lifts it. Android has no public API for this, so it reads the app op behind that
   * switch; where it can't, it says no and the normal prompts take over.
   */
  private fun restrictedSettings(): Boolean {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU) return false
    return try {
      val appOps = context.getSystemService(AppOpsManager::class.java) ?: return false
      val mode =
        appOps.unsafeCheckOpNoThrow(
          "android:access_restricted_settings",
          Process.myUid(),
          context.packageName,
        )
      mode == AppOpsManager.MODE_ERRORED || mode == AppOpsManager.MODE_IGNORED
    } catch (e: Exception) {
      false
    }
  }

  private fun open(intent: Intent?): Boolean {
    if (intent == null) return false
    val activity = context.currentActivity
    return try {
      if (activity != null) {
        activity.startActivity(intent)
      } else {
        context.startActivity(intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
      }
      true
    } catch (e: ActivityNotFoundException) {
      false
    } catch (e: SecurityException) {
      false
    }
  }

  companion object {
    const val NAME = "PennyDevice"
  }
}
