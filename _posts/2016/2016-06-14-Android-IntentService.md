---
layout: post
title: IntentService 学习笔记
category: android
tags: [android]
---

`IntentService` 是用来处理异步 (asynchronous) 请求的 `Service` 的子类. 但是是通过创建一个独立的[工作者线程 (worker thread)](http://www.ibm.com/developerworks/library/j-jtp0730/) 来完成工作. 并且在完成工作后自动关闭服务.

## 什么时候用?

通常的 `Service` 是用于无需 UI 的任务. 但是不能执行耗时任务. 不然的话需要创建额外的线程来执行任务. 所以就有了 IntentService. 它主要被用于处理耗时任务的服务, 自身内部会自动创建一个额外的线程来执行任务.

## 注意点

* 所有的请求都是在同一个工作者线程中处理的.
* 但是一次只能处理一个请求.
* 多次启动 `IntentService` 不会重新创建新的服务和新的线程， 只是把消息加入消息队列中等待执行. 
* 可以是一个耗时任务. 由于异步, 它也不会阻断主线程. 
* 不需要主动调用 stopSelf() 来结束服务. 在所有的 intent 被处理完后, 系统会自动关闭服务.

## 源码简析

[源码地址](https://android.googlesource.com/platform/frameworks/base/+/master/core/java/android/app/IntentService.java)

{% highlight java %}
public abstract class IntentService extends Service {

  private volatile Looper mServiceLooper;
  private volatile ServiceHandler mServiceHandler;
  private String mName;
  private boolean mRedelivery;

  private final class ServiceHandler extends Handler {

    public ServiceHandler(Looper looper) {
      super(looper);
    }

    @Override
    public void handleMessage(Message msg) {
      onHandleIntent((Intent)msg.obj);
      stopSelf(msg.arg1); // 执行完毕后自动关闭
    }
  }

  /**
  * 这里的 name 是用来给工作者线程命名的. 主要是用于 debug.
  */
  public IntentService(String name) {
    super();
    mName = name;
  }

  /**
  * Sets intent redelivery preferences. Usually called from the constructor
  * with your preferred semantics.
  *
  * 如果为 true, onStartCommand(Intent, int, int) 会返回 Service#START_REDELIVER_INTENT. 
  * 那么如果进程在 onHandleIntent() 返回值之前终结, 进程会重新启动. 
  * 同时 intent 也会重新发送. 如果有许多个 intents 已经发送了. 那么只有最近的 intent 才回保证重新发送.
  *
  * 如果为 false (默认值t), onStartCommand(Intent, int, int) 将会返回
  * Service#START_NOT_STICKY, 如果进程终结. Intent 也会终结.
  */
  public void setIntentRedelivery(boolean enabled) {
    mRedelivery = enabled;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    // 自己本身就建立了一个新的线程
    HandlerThread thread = new HandlerThread("IntentService[" + mName + "]");
    thread.start();
    mServiceLooper = thread.getLooper();
    mServiceHandler = new ServiceHandler(mServiceLooper);
  }

  @Override
  public void onStart(Intent intent, int startId) {
    Message msg = mServiceHandler.obtainMessage();
    msg.arg1 = startId;
    msg.obj = intent;
    mServiceHandler.sendMessage(msg);
  }

  /**
   * 不要覆写这个方法. 而应该覆写 onHandleIntent(), onHandleIntent() 会在 IntentService 接收到请求时调用.
   * 默认实现的 onStartCommand() 的目的是将intent插入到工作队列中
   */
  @Override
  public int onStartCommand(Intent intent, int flags, int startId) {
    onStart(intent, startId);
    return mRedelivery ? START_REDELIVER_INTENT : START_NOT_STICKY;
  }

  @Override
  public void onDestroy() {
    mServiceLooper.quit();
  }

  /**
   * 除非你需要给你的 service 提供绑定. 不然不需要实现这个方法. 因为默认返回 null
   */
  @Override
  public IBinder onBind(Intent intent) {
    return null;
  }

  /**
   * 这个方法会在工作者线程中被调用. 同一时间只有一个 Intent 被执行. 
   * 但是这个工作者线程是和其他的应用逻辑是独立的. 它只会用来处理 IntentService 的请求. 而不会干其他事. 
   * 当所有请求执行完毕. IntentService 会自动关. 不需要再调用 stopSelf(). 
   */
  @WorkerThread
  protected abstract void onHandleIntent(Intent intent);
}
{% endhighlight %}

## 如何使用

继承 `IntentService` 并实现 `onHandleIntent(Intent)` 方法. 然后就可以接收 `Intent `并启动一个工作者线程处理工作, 结束后自动关闭服务.

它和 `Service` 一样. 通过 startService(Intent) 启动.

{% highlight java %}
public class IntentServiceSub extends IntentService {    

  private static final String TAG = "IntentServiceSub";    

  public IntentServiceSub() {        
    super("IntentServiceSub");        
    Log.i(TAG, "=>IntentServiceSub");    
  }    
   
  @Override    
  public void onCreate() {        
    Log.i(TAG, "=>onCreate");        
    super.onCreate();    
  }    
  
  @Override    
  public void onDestroy() {        
    Log.i(TAG, "=>onDestroy");        
    super.onDestroy();   
  }    

  @Override    
  protected void onHandleIntent(Intent arg0) {        
    Log.i(TAG, "IntentService 线程："+Thread.currentThread.getId());
    // ToDo 这里添加服务的逻辑                   
  }
}
{% endhighlight %}

## 常见问题

1. 为什么多次启动 `IntentService` 会顺序执行事件，停止服务后，后续的事件得不到执行？
`IntentService` 中使用的 `Handler`, `Looper`, `MessageQueue` 机制把消息发送到相同的线程中去执行的, 所以**多次启动 `IntentService` 不会重新创建新的服务和新的线程， 只是把消息加入消息队列中等待执行**, 而如果服务停止, 会清除消息队列中的消息, 后续的事件得不到执行.

2. 为什么不建议通过 `bindService()` 启动 `IntentService`？
`IntentService` 源码中的 `onBind()` 默认返回 `null`. 不适合 `bindService()` 启动服务，如果你执意要 `bindService()` 来启动 `IntentService`, 可能因为你想通过 `Binder` 或 `Messenger` 使得 `IntentService` 和 `Activity` 可以通信, 这样那么 `onHandleIntent()` 不会被回调,相当于在你使用 `Service` 而不是 `IntentService`.

## 参考

* [IntentService 示例与详解](http://www.jianshu.com/p/edbd9e21542b) - [[jacky123](http://www.jianshu.com/users/9fd6d8c00868)](http://www.jianshu.com/users/9fd6d8c00868/latest_articles)
* [IntentService简介和使用](http://www.jianshu.com/p/6f97028a26f9) - [冯奕欢](http://www.jianshu.com/users/444dabff6bef)
* [IntentService API Doc](https://developer.android.com/reference/android/app/IntentService.html)
