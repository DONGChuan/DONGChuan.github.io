---
layout: post
title: WakefulBroadcastReceiver 学习笔记
category: android
tags: [android]
---

[WakefulBroadcastReceiver](https://developer.android.com/reference/android/support/v4/content/WakefulBroadcastReceiver.html) 是一种特殊的广播接收器. 它可以自动创建和管理唤醒锁 `PARTIAL_WAKE_LOCK` 来执行任务. 确保耗时任务执行完毕之前设备不会休眠.

`WakefulBroadcastReceiver` 收到广播后一般会启动 `Service` (通常用 `IntentService` 来处理耗时任务), 同时确保设备在整个 `Service` 执行过程中保持唤醒状态. 不然的话, 对于耗时任务, 设备可能在你完成任务之前就休眠了.

## 注意点

* 通过 `startWakefulService(Context, Intent)` 启动 `Service` 而不是 `startService()`. `WakefulBroadcastReceiver` 启动 `Service` 的时候会自动创建唤醒锁, 并在 `Intent` 附上唤醒锁的 ID 来判断这个唤醒锁.

* 最后必须在 `Service` 中调用 `completeWakefulIntent(intent)` 释放唤醒锁.

## 源码简析

[源码地址](http://grepcode.com/file/repository.grepcode.com/java/ext/com.google.android/android/4.3_r1/android/support/v4/content/WakefulBroadcastReceiver.java#WakefulBroadcastReceiver.0EXTRA_WAKE_LOCK_ID)

先看一看启动服务的方法 `startWakefulService()`

{% highlight java %}
public static ComponentName startWakefulService(Context context, Intent intent) {
    synchronized (mActiveWakeLocks) {
        
        ....
        
        // 这里在 intent 中加入了唤醒锁的 ID
        intent.putExtra(EXTRA_WAKE_LOCK_ID, id);
        ComponentName comp = context.startService(intent);
        if (comp == null) {
          return null;
        }
        
        // 获得设备的电源管理服务
        PowerManager pm = (PowerManager)context.getSystemService(Context.POWER_SERVICE);
        
        // 这里获得了 PARTIAL_WAKE_LOCK 唤醒锁
        PowerManager.WakeLock wl = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK,
                    "wake:" + comp.flattenToShortString());
        wl.setReferenceCounted(false);
        wl.acquire(60*1000);
        mActiveWakeLocks.put(id, wl);

        return comp;
    }
}
{% endhighlight %}

再看一看最后需要调用的方法 `completeWakefulIntent()`

{% highlight java %}
public static boolean completeWakefulIntent(Intent intent) {
    // 获得唤醒锁的 ID
    final int id = intent.getIntExtra(EXTRA_WAKE_LOCK_ID, 0);
    if (id == 0) {
        return false;
    }
    synchronized (mActiveWakeLocks) {
        // 通过 ID 找到唤醒锁
        PowerManager.WakeLock wl = mActiveWakeLocks.get(id);
        if (wl != null) {
            // 释放唤醒锁
            wl.release();
            mActiveWakeLocks.remove(id);
            return true;
        }
            
        return true;
    }
}
{% endhighlight %}

## 如何使用

和使用 `BroadcastReceiver` 一样, 需要先在 AndroidManifest 定义接收器

{% highlight xml %}
<receiver android:name=".SimpleWakefulReceiver"></receiver>
{% endhighlight %}

然后继承 `WakefulBroadcastReceiver` 并实现 `onReceive()` 方法

{% highlight java %}
public class SimpleWakefulReceiver extends WakefulBroadcastReceiver {            
    @Override    
    public void onReceive(Context context, Intent intent) {
        Intent service = new Intent(context, SimpleWakefulService.class);        
        // 启动 service 并保持设备唤醒状态直到调用 completeWakefulIntent()
        startWakefulService(context, service);    
    }
}
{% endhighlight %}

在相应的 `SimpleWakefulService` 中进行耗时操作最后释放唤醒锁.

{% highlight java %}
public class SimpleWakefulService extends IntentService {    
    public SimpleWakefulService() {        
        super("SimpleWakefulService");    
    } 

    @Override    
    protected void onHandleIntent(Intent intent) {        
    
        // 执行耗时任务
        ... 
    
        // 结束任务时释放唤醒锁
        SimpleWakefulReceiver.completeWakefulIntent(intent);    
    }
}
{% endhighlight %}

## 参考

* [How to use WakefulBroadcastReceiver](https://plus.google.com/+AndroidDevelopers/posts/i6MzCp1NyzF)
* [WakefulBroadcastReceiver API Doc](https://developer.android.com/reference/android/support/v4/content/WakefulBroadcastReceiver.html)