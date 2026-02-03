package com.bookdigest.app

import android.app.Application
import dagger.hilt.android.HiltAndroidApp

@HiltAndroidApp
class BookDigestApp : Application() {
    override fun onCreate() {
        super.onCreate()
    }
}
