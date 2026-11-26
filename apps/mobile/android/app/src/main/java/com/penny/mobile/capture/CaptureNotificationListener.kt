package com.penny.mobile.capture

import android.app.Notification
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification

/**
 * Android hands Penny every notification once the user allows notification access. Only those
 * from the finance apps picked in onboarding are read; the rest are ignored here and go nowhere.
 */
class CaptureNotificationListener : NotificationListenerService() {
  /** Apps repost the same alert (progress, edits). The server merges duplicates too. */
  private val recent = ArrayDeque<String>()

  override fun onNotificationPosted(sbn: StatusBarNotification) {
    val app = sbn.packageName
    if (app == packageName || !CaptureSources.allows(this, app)) return

    val notification = sbn.notification
    val skipped = Notification.FLAG_GROUP_SUMMARY or Notification.FLAG_ONGOING_EVENT
    if (notification.flags and skipped != 0) return

    val extras = notification.extras
    val title =
      (extras.getCharSequence(Notification.EXTRA_TITLE_BIG)
          ?: extras.getCharSequence(Notification.EXTRA_TITLE))
        ?.toString()
    val text =
      (extras.getCharSequence(Notification.EXTRA_BIG_TEXT)
          ?: extras.getCharSequenceArray(Notification.EXTRA_TEXT_LINES)?.joinToString("\n")
          ?: extras.getCharSequence(Notification.EXTRA_TEXT))
        ?.toString()
    if (text.isNullOrBlank()) return

    val signature = "$app\u0000$title\u0000$text"
    synchronized(recent) {
      if (signature in recent) return
      recent.addLast(signature)
      if (recent.size > RECENT_LIMIT) recent.removeFirst()
    }

    Captures.receive(
      this,
      Capture(
        source = Capture.NOTIFICATION,
        sender = app,
        title = title,
        text = text,
        receivedAt = Capture.isoTime(sbn.postTime),
      ),
    )
  }

  private companion object {
    const val RECENT_LIMIT = 50
  }
}
