package com.nichinichi.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.widget.RemoteViews;

public class NichiWidgetTwd extends AppWidgetProvider {

    private static final String PREFS_NAME = "CapacitorStorage";
    private static final String KEY_TODAY_TOTAL = "today_total_twd";

    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String todayTotal = prefs.getString(KEY_TODAY_TOTAL, "$ 0");

        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.nichi_widget);
        views.setTextViewText(R.id.widget_amount, todayTotal);

        // Home
        Intent intentHome = new Intent(Intent.ACTION_VIEW, Uri.parse("nichinichi://home"));
        intentHome.setPackage(context.getPackageName());
        PendingIntent pendingIntentHome = PendingIntent.getActivity(context, 0, intentHome, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.summary_container, pendingIntentHome);

        // Add
        Intent intentAdd = new Intent(Intent.ACTION_VIEW, Uri.parse("nichinichi://add"));
        intentAdd.setPackage(context.getPackageName());
        PendingIntent pendingIntentAdd = PendingIntent.getActivity(context, 1, intentAdd, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.widget_add_btn, pendingIntentAdd);

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);
        if ("com.nichinichi.app.UPDATE_WIDGET".equals(intent.getAction())) {
            AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
            ComponentName thisAppWidget = new ComponentName(context.getPackageName(), NichiWidgetTwd.class.getName());
            int[] appWidgetIds = appWidgetManager.getAppWidgetIds(thisAppWidget);
            onUpdate(context, appWidgetManager, appWidgetIds);
        }
    }
}
