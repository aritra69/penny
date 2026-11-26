package com.penny.mobile.capture

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.provider.Telephony

/**
 * Incoming SMS, when the user picked "Bank SMS" and allowed SMS access. Only messages from
 * business senders (bank IDs like AX-HDFCBK, or short codes) are read; SMS from people's
 * phone numbers are ignored here and go nowhere.
 */
class SmsCaptureReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    if (intent.action != Telephony.Sms.Intents.SMS_RECEIVED_ACTION) return
    if (!CaptureSources.allows(context, Capture.SMS)) return

    val parts = Telephony.Sms.Intents.getMessagesFromIntent(intent) ?: return
    // A long SMS arrives in parts; put each sender's back together.
    parts
      .filterNotNull()
      .groupBy { it.displayOriginatingAddress.orEmpty() }
      .forEach { (sender, messageParts) ->
        if (!isBusinessSender(sender)) return@forEach
        Captures.receive(
          context,
          Capture(
            source = Capture.SMS,
            sender = sender,
            title = null,
            text = messageParts.joinToString("") { it.displayMessageBody.orEmpty() },
            receivedAt = Capture.isoTime(messageParts.minOf { it.timestampMillis }),
          ),
        )
      }
  }

  companion object {
    private val SHORT_CODE = Regex("""\d{3,6}""")

    /** Sender IDs with letters (VM-HDFCBK) or short codes; never a person's phone number. */
    fun isBusinessSender(sender: String): Boolean =
      sender.any { it.isLetter() } || SHORT_CODE.matches(sender)
  }
}
