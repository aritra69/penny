package com.penny.mobile

import android.app.Application
import androidx.appcompat.app.AppCompatDelegate
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.penny.mobile.device.PennyDevicePackage

class MainApplication : Application(), ReactApplication {

  override val reactHost: ReactHost by lazy {
    getDefaultReactHost(
      context = applicationContext,
      packageList =
        PackageList(this).packages.apply {
          // Penny's own native code (android/app/src/main/java/com/penny/mobile/device).
          add(PennyDevicePackage())
        },
    )
  }

  override fun onCreate() {
    super.onCreate()
    // Penny is light-only (paper and ink). Without this, a phone in dark mode reports "dark" to
    // React Native and NativeWind switches to the design system's .dark tokens.
    AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_NO)
    loadReactNative(this)
  }
}
