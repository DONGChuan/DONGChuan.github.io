---
layout: post
title: Android PendingIntent
category: android
tags: [android]
---

Quick note about learning PendingIntent.

## PendingIntent

A `PendingIntent` is a token that we give to a foreign application (e.g. NotificationManager, AlarmManager, AppWidgetManager, or other 3rd party applications), which allows the foreign application to use our own application's permissions to execute a predefined piece of code even if our application's process is killed.

If we give the foreign application an Intent, and that application sends/broadcasts the Intent you gave, they will execute the Intent with their own permissions. But if we instead give the foreign application a `PendingIntent` you created using your own permission, that application will execute the contained Intent using your application's permission.

For example, I send a `PendingIntent` to AlarmManager to give AlarmManager permissions to launch an activity in my own application in 5 mins.

## Create a PendingIntent

Retrieve a `PendingIntent` to start a new Activity(s)/Broadcast/Service:

{% highlight java %}
PendingIntent.getActivity(Context context, int requestCode, Intent intent, int flags)
PendingIntent.getActivities(Context context, int requestCode, Intent[] intents, int flags)
PendingIntent.getBroadcast(Context context, int requestCode, Intent intent, int flags)
PendingIntent.getService(Context context, int requestCode, Intent intent, int flags)
{% endhighlight %}

### Flags

* `FLAG_CANCEL_CURRENT` - If the described PendingIntent already exists, the current one should be canceled before generating a new one. 
* `FLAG_NO_CREATE` - If the described PendingIntent **does not already exist**, then simply return **null** instead of creating it. 
* `FLAG_ONE_SHOT` - PendingIntent can be used only once.
* `FLAG_UPDATE_CURRENT` - If the described PendingIntent already exists, then keep it but replace its extra data with what is in this new Intent.
* `FLAG_IMMUTABLE` - PendingIntent should be immutable. It means that the additional intent argument passed to the send methods to fill in unpopulated properties of this intent will be ignored

### RequestCode

It is a private request code for the sender and quite useful when there are more than one PendingIntents to send (ex. send two notifications in the mean time). It works as ID to distinguish different PendingIntents. If not set different values, the next PendingIntent will override the previous one even if their wrapped intents have different extra values.

For `FLAG_UPDATE_CURRENT` and `FLAG_CANCEL_CURRENT`, request code will be used here to tell android how to distinguish two PendingIntents.

### Example

{% highlight java %}
// Create an explicit intent to wrap
Intent intent = new Intent(this, LoginActivity.class);
 
PendingIntent pendingIntent = 
	PendingIntent.getActivity(this, 1, intent, PendingIntent.FLAG_CANCEL_CURRENT);

try {
    // Perform the operation associated with our pendingIntent
    pendingIntent.send();
} catch (PendingIntent.CanceledException e) {
    e.printStackTrace();
}
{% endhighlight %}

Another example with Notification:

{% highlight java %}
Intent showUnlockIntent = new Intent(context, AlarmAlertFullScreen.class);
showUnlockIntent.putExtra(Alarms.ALARM_INTENT_EXTRA, alarm);
showUnlockIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_NO_USER_ACTION);

PendingIntent resultPendingIntent =
	PendingIntent.getActivity(
		context,
		alarm.id,
		showUnlockIntent,
		PendingIntent.FLAG_UPDATE_CURRENT);

NotificationCompat.Builder mBuilder =
	new NotificationCompat.Builder(context)
		.setSmallIcon(R.mipmap.ic_launcher)
		.setContentTitle("X-Alarm!")
		.setContentText(label)
		.setContentIntent(resultPendingIntent)
		.setFullScreenIntent(resultPendingIntent, true)
		.setOngoing(true)
		.setDefaults(NotificationCompat.DEFAULT_LIGHTS);

NotificationManager mNotifyMgr = (
	NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);

// Uses the alarm id to easily identify the correct notification.
mNotifyMgr.notify(alarm.id, mBuilder.build());
{% endhighlight %}

## Differences with Intent

* Intent is immediate. But PendingIntent can be triggered later or even cancel later.
* Intent is killed when the related Activity is killed. But PendingIntent still keeps alive.
* Intent must run with a Context. But PendingIntent has its own Context.
* Intent runs in the original task. But PendingIntent run in a new task.

## Refs

* [What is an Android PendingIntent?](http://stackoverflow.com/questions/2808796/what-is-an-android-pendingintent)
* [PendingIntent API Doc](https://developer.android.com/reference/android/app/PendingIntent.html)