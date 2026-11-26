package com.penny.mobile.capture

import android.content.Context

/**
 * Which sources Penny may read: the package names of the finance apps the user picked during
 * onboarding, plus "sms" for bank SMS. Set from JavaScript; empty (nothing read) until then and
 * after sign-out. Not secret, so plain SharedPreferences.
 */
object CaptureSources {
  private const val PREFS = "penny.capture.sources"
  private const val KEY_IDS = "ids"
  private const val KEY_OWNER = "owner"

  private fun prefs(context: Context) =
    context.applicationContext.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

  /**
   * `owner` is the signed-in account (null when signed out, which keeps the last one). When a
   * different account signs in, the queue is emptied, so one account's messages are never sent
   * as another's.
   */
  @Synchronized
  fun set(context: Context, ids: Collection<String>, owner: String?) {
    val prefs = prefs(context)
    val previous = prefs.getString(KEY_OWNER, null)
    if (owner != null && previous != null && owner != previous) CaptureQueue(context).clear()
    val editor = prefs.edit().putStringSet(KEY_IDS, ids.toSet())
    if (owner != null) editor.putString(KEY_OWNER, owner)
    editor.commit()
  }

  fun allows(context: Context, id: String): Boolean =
    prefs(context).getStringSet(KEY_IDS, emptySet())?.contains(id) == true
}
