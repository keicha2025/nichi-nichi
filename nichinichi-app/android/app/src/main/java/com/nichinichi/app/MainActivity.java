package com.nichinichi.app;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        registerPlugin(WidgetUpdatePlugin.class);
    }
}

@CapacitorPlugin(name = "WidgetUpdate")
class WidgetUpdatePlugin extends Plugin {
    @PluginMethod
    public void notifyUpdate(PluginCall call) {
        Context context = getContext();
        String packageName = context.getPackageName();
        
        // Broadcast to JPY Widget
        Intent intentJpy = new Intent(context, NichiWidgetJpy.class);
        intentJpy.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
        int[] idsJpy = AppWidgetManager.getInstance(context).getAppWidgetIds(new ComponentName(context, NichiWidgetJpy.class));
        intentJpy.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, idsJpy);
        context.sendBroadcast(intentJpy);

        // Broadcast to TWD Widget
        Intent intentTwd = new Intent(context, NichiWidgetTwd.class);
        intentTwd.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
        int[] idsTwd = AppWidgetManager.getInstance(context).getAppWidgetIds(new ComponentName(context, NichiWidgetTwd.class));
        intentTwd.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, idsTwd);
        context.sendBroadcast(intentTwd);

        // Also send the custom broadcast for legacy/extra safety
        Intent customIntent = new Intent("com.nichinichi.app.UPDATE_WIDGET");
        customIntent.setPackage(packageName);
        context.sendBroadcast(customIntent);

        call.resolve();
    }
}
