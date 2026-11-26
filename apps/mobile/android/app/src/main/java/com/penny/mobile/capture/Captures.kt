package com.penny.mobile.capture

import android.content.Context

/** Where the notification listener and the SMS receiver hand over a message. */
object Captures {
  /**
   * Drops one-time codes, queues the rest (encrypted) and wakes JavaScript to send them. A code
   * returns here, before anything is written, so it is never stored, logged or sent.
   */
  fun receive(context: Context, capture: Capture) {
    val message = listOfNotNull(capture.title, capture.text).joinToString("\n")
    if (message.isBlank() || OneTimeCode.matches(message)) return
    CaptureQueue(context).add(capture.fitted())
    CaptureSyncService.start(context)
  }
}
