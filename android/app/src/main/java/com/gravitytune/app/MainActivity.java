package com.gravitytune.app;

import android.Manifest;
import android.content.Context;
import android.content.pm.PackageManager;
import android.media.AudioAttributes;
import android.media.AudioFocusRequest;
import android.media.AudioManager;
import android.os.Build;
import android.os.Bundle;
import android.os.PowerManager;
import android.view.View;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    public static MainActivity instance;
    private PowerManager.WakeLock wakeLock;
    private AudioManager audioManager;
    private AudioFocusRequest audioFocusRequest;

    public void keepWebViewAlive() {
        try {
            WebView webView = this.bridge != null ? this.bridge.getWebView() : null;
            if (webView != null) {
                // Force Chromium to treat the window as VISIBLE to prevent background video/audio pausing
                webView.dispatchWindowVisibilityChanged(View.VISIBLE);
                webView.resumeTimers();
                webView.onResume();
            }
        } catch (Exception ignored) {}
    }

    public static void sendJsCommand(String js) {
        if (instance != null) {
            instance.runOnUiThread(() -> {
                try {
                    instance.keepWebViewAlive();
                    WebView webView = instance.bridge != null ? instance.bridge.getWebView() : null;
                    if (webView != null) {
                        webView.evaluateJavascript(js, null);
                    }
                } catch (Exception ignored) {}
            });
        }
    }

    public class AudioBridgeInterface {
        @JavascriptInterface
        public void updateMedia(String title, String artist, String thumbnailUrl, boolean isPlaying, long duration, long position) {
            MediaNotificationService.update(MainActivity.this, title, artist, thumbnailUrl, isPlaying, duration, position);
        }
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        instance = this;

        // Request POST_NOTIFICATIONS for Android 13+ so notification shade controls show up
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS}, 101);
            }
        }

        try {
            WebView webView = this.bridge != null ? this.bridge.getWebView() : null;
            if (webView != null) {
                WebSettings settings = webView.getSettings();
                settings.setMediaPlaybackRequiresUserGesture(false);
                settings.setJavaScriptCanOpenWindowsAutomatically(true);
                settings.setJavaScriptEnabled(true);
                settings.setDomStorageEnabled(true);
                settings.setDatabaseEnabled(true);
                webView.addJavascriptInterface(new AudioBridgeInterface(), "GravityNativeBridge");
            }

            // Acquire AudioFocus for background media playback
            audioManager = (AudioManager) getSystemService(Context.AUDIO_SERVICE);
            if (audioManager != null && Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                AudioAttributes playbackAttributes = new AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_MEDIA)
                    .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                    .build();
                audioFocusRequest = new AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN)
                    .setAudioAttributes(playbackAttributes)
                    .setAcceptsDelayedFocusGain(true)
                    .setOnAudioFocusChangeListener(focusChange -> {
                        // Keep audio focus alive
                    })
                    .build();
                audioManager.requestAudioFocus(audioFocusRequest);
            }

            // Acquire Partial Wake Lock to keep CPU active during screen off
            PowerManager powerManager = (PowerManager) getSystemService(POWER_SERVICE);
            if (powerManager != null) {
                wakeLock = powerManager.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "GravityTune::AudioKeepAlive");
                wakeLock.acquire(12 * 60 * 60 * 1000L); // 12 hours max
            }
        } catch (Exception ignored) {
        }
    }

    @Override
    public void onPause() {
        super.onPause();
        keepWebViewAlive();
    }

    @Override
    public void onStop() {
        super.onStop();
        keepWebViewAlive();
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (!hasFocus) {
            keepWebViewAlive();
        }
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        try {
            if (wakeLock != null && wakeLock.isHeld()) {
                wakeLock.release();
            }
            if (audioManager != null && audioFocusRequest != null && Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                audioManager.abandonAudioFocusRequest(audioFocusRequest);
            }
        } catch (Exception ignored) {
        }
        if (instance == this) {
            instance = null;
        }
    }
}
