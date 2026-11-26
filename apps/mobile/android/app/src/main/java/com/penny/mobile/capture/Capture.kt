package com.penny.mobile.capture

import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone
import org.json.JSONObject

/** One message as the phone received it: the body of the API's `POST /captures`. */
data class Capture(
  /** "sms" or "notification". */
  val source: String,
  /** SMS sender ID (e.g. AX-HDFCBK) or the app's package name. */
  val sender: String,
  val title: String?,
  val text: String,
  /** ISO 8601, UTC. */
  val receivedAt: String,
) {
  fun toJson(): JSONObject =
    JSONObject()
      .put("source", source)
      .put("sender", sender)
      .put("title", title ?: JSONObject.NULL)
      .put("text", text)
      .put("receivedAt", receivedAt)

  /** Cut to what the API accepts: sender ≤ 200, title and text ≤ 2,000 together. */
  fun fitted(): Capture {
    val fittedTitle = title?.trim()?.take(MAX_TITLE_LENGTH)?.ifEmpty { null }
    val room = MAX_MESSAGE_LENGTH - (fittedTitle?.length ?: 0)
    return copy(
      sender = sender.trim().take(MAX_SENDER_LENGTH),
      title = fittedTitle,
      text = text.trim().take(room),
    )
  }

  companion object {
    const val SMS = "sms"
    const val NOTIFICATION = "notification"

    private const val MAX_SENDER_LENGTH = 200
    private const val MAX_TITLE_LENGTH = 200
    private const val MAX_MESSAGE_LENGTH = 2000

    fun fromJson(json: JSONObject): Capture =
      Capture(
        source = json.getString("source"),
        sender = json.getString("sender"),
        title = if (json.isNull("title")) null else json.getString("title"),
        text = json.getString("text"),
        receivedAt = json.getString("receivedAt"),
      )

    fun isoTime(millis: Long): String =
      SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US)
        .apply { timeZone = TimeZone.getTimeZone("UTC") }
        .format(Date(millis))
  }
}
