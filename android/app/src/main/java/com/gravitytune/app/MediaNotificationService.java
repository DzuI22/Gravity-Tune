package com.gravitytune.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.media.MediaMetadata;
import android.media.session.MediaSession;
import android.media.session.PlaybackState;
import android.os.Build;
import android.os.IBinder;
import androidx.annotation.Nullable;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class MediaNotificationService extends Service {
    public static final String ACTION_UPDATE = "com.gravitytune.app.ACTION_UPDATE";
    public static final String ACTION_TOGGLE = "com.gravitytune.app.ACTION_TOGGLE";
    public static final String ACTION_PREV = "com.gravitytune.app.ACTION_PREV";
    public static final String ACTION_NEXT = "com.gravitytune.app.ACTION_NEXT";
    public static final String ACTION_STOP = "com.gravitytune.app.ACTION_STOP";

    public static final String EXTRA_TITLE = "extra_title";
    public static final String EXTRA_ARTIST = "extra_artist";
    public static final String EXTRA_THUMBNAIL = "extra_thumbnail";
    public static final String EXTRA_IS_PLAYING = "extra_is_playing";
    public static final String EXTRA_DURATION = "extra_duration";
    public static final String EXTRA_POSITION = "extra_position";

    private static final String CHANNEL_ID = "gravitytune_playback_channel";
    private static final int NOTIFICATION_ID = 510;

    private MediaSession mediaSession;
    private NotificationManager notificationManager;
    private final ExecutorService executorService = Executors.newSingleThreadExecutor();

    private String currentTitle = "GravityTune";
    private String currentArtist = "Playing Music";
    private String currentThumbnail = "";
    private boolean isPlaying = false;
    private long currentDuration = 0;
    private long currentPosition = 0;
    private Bitmap currentArtBitmap = null;

    @Override
    public void onCreate() {
        super.onCreate();
        notificationManager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        createNotificationChannel();
        initMediaSession();
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "GravityTune Playback",
                NotificationManager.IMPORTANCE_LOW
            );
            channel.setDescription("Background music playback controls and notifications");
            channel.setShowBadge(false);
            channel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
            if (notificationManager != null) {
                notificationManager.createNotificationChannel(channel);
            }
        }
    }

    private void initMediaSession() {
        mediaSession = new MediaSession(this, "GravityTuneMediaSession");
        mediaSession.setCallback(new MediaSession.Callback() {
            @Override
            public void onPlay() {
                super.onPlay();
                MainActivity.sendJsCommand("window.gravityTuneTogglePlay && window.gravityTuneTogglePlay();");
            }

            @Override
            public void onPause() {
                super.onPause();
                MainActivity.sendJsCommand("window.gravityTuneTogglePlay && window.gravityTuneTogglePlay();");
            }

            @Override
            public void onSkipToNext() {
                super.onSkipToNext();
                MainActivity.sendJsCommand("window.gravityTuneNext && window.gravityTuneNext();");
            }

            @Override
            public void onSkipToPrevious() {
                super.onSkipToPrevious();
                MainActivity.sendJsCommand("window.gravityTunePrev && window.gravityTunePrev();");
            }

            @Override
            public void onSeekTo(long pos) {
                super.onSeekTo(pos);
                long sec = pos / 1000;
                MainActivity.sendJsCommand("window.gravityTuneSeek && window.gravityTuneSeek(" + sec + ");");
            }

            @Override
            public void onStop() {
                super.onStop();
                MainActivity.sendJsCommand("window.gravityTunePause && window.gravityTunePause();");
                stopSelf();
            }
        });
        mediaSession.setActive(true);
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null && intent.getAction() != null) {
            String action = intent.getAction();
            if (ACTION_UPDATE.equals(action)) {
                String title = intent.getStringExtra(EXTRA_TITLE);
                String artist = intent.getStringExtra(EXTRA_ARTIST);
                String thumb = intent.getStringExtra(EXTRA_THUMBNAIL);
                boolean playing = intent.getBooleanExtra(EXTRA_IS_PLAYING, false);
                long dur = intent.getLongExtra(EXTRA_DURATION, 0);
                long pos = intent.getLongExtra(EXTRA_POSITION, 0);

                if (title != null) currentTitle = title;
                if (artist != null) currentArtist = artist;
                isPlaying = playing;
                currentDuration = dur;
                currentPosition = pos;

                if (thumb != null && !thumb.equals(currentThumbnail)) {
                    currentThumbnail = thumb;
                    fetchThumbnailBitmap(thumb);
                } else {
                    updateNotificationAndSession();
                }
            } else if (ACTION_TOGGLE.equals(action)) {
                MainActivity.sendJsCommand("window.gravityTuneTogglePlay && window.gravityTuneTogglePlay();");
            } else if (ACTION_NEXT.equals(action)) {
                MainActivity.sendJsCommand("window.gravityTuneNext && window.gravityTuneNext();");
            } else if (ACTION_PREV.equals(action)) {
                MainActivity.sendJsCommand("window.gravityTunePrev && window.gravityTunePrev();");
            } else if (ACTION_STOP.equals(action)) {
                MainActivity.sendJsCommand("window.gravityTunePause && window.gravityTunePause();");
                stopForeground(true);
                stopSelf();
            }
        }

        return START_STICKY;
    }

    private void fetchThumbnailBitmap(String urlStr) {
        executorService.execute(() -> {
            try {
                URL url = new URL(urlStr);
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setDoInput(true);
                conn.setConnectTimeout(5000);
                conn.setReadTimeout(5000);
                conn.connect();
                InputStream input = conn.getInputStream();
                currentArtBitmap = BitmapFactory.decodeStream(input);
            } catch (Exception ignored) {
                currentArtBitmap = null;
            }
            updateNotificationAndSession();
        });
    }

    private void updateNotificationAndSession() {
        // Update MediaSession PlaybackState
        PlaybackState.Builder stateBuilder = new PlaybackState.Builder()
            .setActions(
                PlaybackState.ACTION_PLAY |
                PlaybackState.ACTION_PAUSE |
                PlaybackState.ACTION_PLAY_PAUSE |
                PlaybackState.ACTION_SKIP_TO_NEXT |
                PlaybackState.ACTION_SKIP_TO_PREVIOUS |
                PlaybackState.ACTION_SEEK_TO
            )
            .setState(isPlaying ? PlaybackState.STATE_PLAYING : PlaybackState.STATE_PAUSED, currentPosition, isPlaying ? 1.0f : 0.0f);
        mediaSession.setPlaybackState(stateBuilder.build());

        // Update MediaSession Metadata
        MediaMetadata.Builder metaBuilder = new MediaMetadata.Builder()
            .putString(MediaMetadata.METADATA_KEY_TITLE, currentTitle)
            .putString(MediaMetadata.METADATA_KEY_ARTIST, currentArtist)
            .putString(MediaMetadata.METADATA_KEY_ALBUM, "GravityTune")
            .putLong(MediaMetadata.METADATA_KEY_DURATION, currentDuration);
        if (currentArtBitmap != null) {
            metaBuilder.putBitmap(MediaMetadata.METADATA_KEY_ALBUM_ART, currentArtBitmap);
        }
        mediaSession.setMetadata(metaBuilder.build());

        // Build Notification
        Intent appIntent = new Intent(this, MainActivity.class);
        appIntent.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pApp = PendingIntent.getActivity(
            this, 100, appIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        // Previous Action
        Intent prevIntent = new Intent(this, MediaNotificationService.class);
        prevIntent.setAction(ACTION_PREV);
        PendingIntent pPrev = PendingIntent.getService(
            this, 101, prevIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        Notification.Action prevAction = new Notification.Action.Builder(
            android.R.drawable.ic_media_previous, "Previous", pPrev
        ).build();

        // Toggle Action
        Intent toggleIntent = new Intent(this, MediaNotificationService.class);
        toggleIntent.setAction(ACTION_TOGGLE);
        PendingIntent pToggle = PendingIntent.getService(
            this, 102, toggleIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        int playPauseIcon = isPlaying ? android.R.drawable.ic_media_pause : android.R.drawable.ic_media_play;
        String playPauseTitle = isPlaying ? "Pause" : "Play";
        Notification.Action toggleAction = new Notification.Action.Builder(
            playPauseIcon, playPauseTitle, pToggle
        ).build();

        // Next Action
        Intent nextIntent = new Intent(this, MediaNotificationService.class);
        nextIntent.setAction(ACTION_NEXT);
        PendingIntent pNext = PendingIntent.getService(
            this, 103, nextIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        Notification.Action nextAction = new Notification.Action.Builder(
            android.R.drawable.ic_media_next, "Next", pNext
        ).build();

        Notification.Builder builder;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            builder = new Notification.Builder(this, CHANNEL_ID);
        } else {
            builder = new Notification.Builder(this);
        }

        builder.setContentTitle(currentTitle)
            .setContentText(currentArtist)
            .setSubText("GravityTune")
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentIntent(pApp)
            .setVisibility(Notification.VISIBILITY_PUBLIC)
            .setOngoing(isPlaying)
            .addAction(prevAction)
            .addAction(toggleAction)
            .addAction(nextAction)
            .setStyle(new Notification.MediaStyle()
                .setMediaSession(mediaSession.getSessionToken())
                .setShowActionsInCompactView(0, 1, 2)
            );

        if (currentArtBitmap != null) {
            builder.setLargeIcon(currentArtBitmap);
        }

        Notification notification = builder.build();

        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                startForeground(NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK);
            } else {
                startForeground(NOTIFICATION_ID, notification);
            }
        } catch (Exception ignored) {
            if (notificationManager != null) {
                notificationManager.notify(NOTIFICATION_ID, notification);
            }
        }
    }

    public static void update(Context context, String title, String artist, String thumbnail, boolean isPlaying, long duration, long position) {
        try {
            Intent intent = new Intent(context, MediaNotificationService.class);
            intent.setAction(ACTION_UPDATE);
            intent.putExtra(EXTRA_TITLE, title);
            intent.putExtra(EXTRA_ARTIST, artist);
            intent.putExtra(EXTRA_THUMBNAIL, thumbnail);
            intent.putExtra(EXTRA_IS_PLAYING, isPlaying);
            intent.putExtra(EXTRA_DURATION, duration);
            intent.putExtra(EXTRA_POSITION, position);

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(intent);
            } else {
                context.startService(intent);
            }
        } catch (Exception ignored) {}
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        try {
            if (mediaSession != null) {
                mediaSession.setActive(false);
                mediaSession.release();
            }
            executorService.shutdown();
        } catch (Exception ignored) {}
    }
}
