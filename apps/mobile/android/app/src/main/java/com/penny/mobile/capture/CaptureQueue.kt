package com.penny.mobile.capture

import android.content.Context
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import android.util.Base64
import java.security.KeyStore
import java.util.UUID
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec
import org.json.JSONObject

/**
 * Messages waiting to be sent to the API, so none are lost while the phone is offline, signed
 * out or the app is closed. JavaScript drains it (`lib/capture/sync.ts`).
 *
 * Each entry is encrypted with AES-256-GCM under a key that lives in the Android Keystore and
 * never leaves it. The file sits in the app's private storage, which isn't backed up
 * (`allowBackup="false"`). One-time codes never get here: they are dropped before `add`.
 */
class CaptureQueue(context: Context) {
  private val prefs =
    context.applicationContext.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

  data class Entry(val id: String, val capture: Capture)

  /** Queues a message, dropping the oldest when the queue is full. */
  @Synchronized
  fun add(capture: Capture) {
    val ids = sortedIds()
    val editor = prefs.edit()
    ids.take(maxOf(0, ids.size - MAX_ENTRIES + 1)).forEach { editor.remove(it) }
    // Zero-padded time first, so sorting the ids sorts by arrival.
    val id = "%013d-%s".format(System.currentTimeMillis(), UUID.randomUUID())
    editor.putString(id, encrypt(capture.toJson().toString()))
    editor.commit()
  }

  /** The oldest `limit` messages, still queued until `remove`d. */
  @Synchronized
  fun peek(limit: Int): List<Entry> {
    val unreadable = mutableListOf<String>()
    val entries =
      sortedIds().take(limit).mapNotNull { id ->
        try {
          Entry(id, Capture.fromJson(JSONObject(decrypt(prefs.getString(id, null)!!))))
        } catch (e: Exception) {
          // Written under a key that's gone, or corrupt: it can never be read, so let it go.
          unreadable += id
          null
        }
      }
    if (unreadable.isNotEmpty()) remove(unreadable)
    return entries
  }

  @Synchronized
  fun remove(ids: Collection<String>) {
    val editor = prefs.edit()
    ids.forEach { editor.remove(it) }
    editor.commit()
  }

  @Synchronized fun clear() = prefs.edit().clear().commit()

  @Synchronized fun size(): Int = prefs.all.size

  private fun sortedIds(): List<String> = prefs.all.keys.sorted()

  private fun encrypt(plain: String): String {
    val cipher = Cipher.getInstance(TRANSFORMATION)
    cipher.init(Cipher.ENCRYPT_MODE, key())
    val sealed = cipher.iv + cipher.doFinal(plain.toByteArray(Charsets.UTF_8))
    return Base64.encodeToString(sealed, Base64.NO_WRAP)
  }

  private fun decrypt(stored: String): String {
    val sealed = Base64.decode(stored, Base64.NO_WRAP)
    val cipher = Cipher.getInstance(TRANSFORMATION)
    cipher.init(
      Cipher.DECRYPT_MODE,
      key(),
      GCMParameterSpec(TAG_BITS, sealed, 0, IV_BYTES),
    )
    return String(cipher.doFinal(sealed, IV_BYTES, sealed.size - IV_BYTES), Charsets.UTF_8)
  }

  private fun key(): SecretKey {
    val keyStore = KeyStore.getInstance(KEYSTORE).apply { load(null) }
    (keyStore.getKey(KEY_ALIAS, null) as? SecretKey)?.let {
      return it
    }
    val generator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, KEYSTORE)
    generator.init(
      KeyGenParameterSpec.Builder(
          KEY_ALIAS,
          KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT,
        )
        .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
        .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
        .setKeySize(256)
        .build()
    )
    return generator.generateKey()
  }

  private companion object {
    const val PREFS = "penny.capture.queue"
    const val KEYSTORE = "AndroidKeyStore"
    const val KEY_ALIAS = "penny.capture.queue"
    const val TRANSFORMATION = "AES/GCM/NoPadding"
    const val IV_BYTES = 12
    const val TAG_BITS = 128
    /** About a month of alerts for a busy account; older ones go first if it's ever full. */
    const val MAX_ENTRIES = 1000
  }
}
