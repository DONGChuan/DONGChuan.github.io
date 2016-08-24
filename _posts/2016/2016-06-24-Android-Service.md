---
layout: post
title: Service 学习笔记
category: android
tags: [android]
---

Service, 四大组件之一, 是一个可以在后台执行长时间运行操作而不使用用户界面的应用组件. 比如播放音乐, 下载文件等.

请注意, 虽然是后台执行任务, 但是 **Service 是运行在主线程的**! 如果要执行耗时任务, 最好手动创建新线程或者直接使用 `IntentService`. (参考 [IntentService 学习笔记](http://dongchuan.github.io/android/2016/06/14/Android-IntentService.html)).

## 两种启动方式

* 启动/停止- startService/stopService
* 绑定/解绑 - bindService/unbindService

### 区别

* startService 只是启动服务, 启动它的组件（如 Activity）和服务并没有关联, 只有当服务调用 `stopSelf()` 或者其他组件调用 `stopService()` 时服务才会终止. 

* bindService 方法启动服务, 其它组件可以通过回调获取服务的代理对象**和服务交互**, 而这两方也进行了**绑定**, 当启动方销毁时, 服务也会自动进行 `unBind` 操作, 当发现所有绑定都进行了 `unBind` 时才会销毁服务.

### 生命周期

通过 startService 与 bindService 两种方式启动的 Service 的生命周期

![service生命周期.jpg](http://DONGChuan.github.io/assets/images/service-life-cycle.jpg)

## 启动服务

### 如何使用

#### 创建服务类

继承 Service 类并覆写 `onCreate()`  `onStartCommand()` `onDestroy()` 三个方法

#### 注册服务

AndroidManifest.xml 里注册服务类.

{% highlight java %}
<service 
    android:name=".service.MyService" 
    android:enabled="true" 
    android:exported="false">
</service>
{% endhighlight %}

* enabled: 是否能被系统实例化
* exported: 其他应用的组件是否能跟它交互, false表示私有只能自己应用使用, true表示可以被其他应用调起

#### 启动服务

{% highlight java %}
Intent intent = new Intent(this, MyService.class);
startService(intent); 
{% endhighlight %}

#### 停止服务

通过外部组件: 

{% highlight java %}
Intent intent = new Intent(this, MyService.class);
stopService(intent); 
{% endhighlight %}

或者通过服务自身

{% highlight java %}
stopSelf();
{% endhighlight %}

> 如果不调用 `stopService` 或者 `stopSelf`, 直接关掉 Activity 对服务没影响, 因为两者的生命周期没有关联.

### onStartCommand 返回值

`onStartCommand()` 方法返回整型数来描述系统应该**如何在服务终止的情况下继续运行服务**.

返回的值必须是以下常量之一:

* START_STICKY 

如果服务在开始后 (`onStartCommand()` 返回后) 被终止, 比如内存不足, 然后会保持已开始状态 (started state), 但是并不保留接收的 intent. 稍后当系统有足够内存时会自己尝试重新创建服务. 因为服务仍处于已开始状态, 所以重建后会调用 `onStartCommand()` 方法. **但是除非此时有挂起的 intent 要启动服务, 不然传递的 intent 为 null.** 使用此方式需要在代码中考虑处理 null 的情况.

该模式主要用于可以在任意的时间段显示的开始和结束服务, 比如后台的音乐播放服务. 

* START_NOT_STICKY 

如果服务在开始后 (`onStartCommand()` 返回后) 被终止, 但是不会保持已开始状态. 系统也不会再自建该服务. 只能通过显示的调用 `startService(Intent)` 来重新创建服务. 这是最安全的选项, 可以**避免在不必要时以及应用能够轻松重启所有未完成的作业时运行服务**.

* START_REDELIVER_INTENT 
如果服务在开始后 (`onStartCommand()` 返回后) 被终止, 则会重建服务, 并且传入最后一个接收的 intent 到 `onStartCommand()`. 这适用于主动执行应该立即恢复的服务(例如下载文件).

小结:

* `START_STICKY`, `START_REDELIVER_INTENT` 会重启服务
* `START_STICKY` 会传递 null 的 intent
* `START_REDELIVER_INTENT` 会传递最后一个 intent

## 绑定服务

通过 `onBind()` 方法启动的service则会在 `onCreate()` 方法之后调用 `onBind()` 方法, 该方法返回一个 `Binder` 对象, 与该服务绑定的组件一般是通过返回的这个 `Binder` 对象与服务进行通信.

当所有与该服务绑定的组件分别都调用 `unBindService()` 后, 该服务才会被销毁

### 如何使用

#### 创建服务类

{% highlight java %}
public class BindService extends Service{

    public class MyBinder extends Binder {
        // 我们可以通过这些方法告知绑定的组建服务当前的状态, 比如某个变量的值
        public int doSth(){
            // 返回服务当前的状态
        }
    }

    @Override
    public IBinder onBind(Intent intent) {
        return new MyBinder(); // 将被 ServiceConnection.onServiceConnected 接收
    }

    @Override
    public void onCreate() {
        super.onCreate();

        // 进行一些任务
    }

}
{% endhighlight %}

#### 注册服务

同 `startService` 一样需要在 AndroidManifest.xml 里进行注册.

{% highlight java %}
<service 
    android:name=".BindService" 
    android:enabled="true" 
    android:exported="false">
</service>
{% endhighlight %}

#### 创建 ServiceConnection 实例

在调用 `onBind()` 方法时需要传入一个 `ServiceConnection` 对象: 

{% highlight java %}
private ServiceConnection mConnection = new ServiceConnection() { 
  public void onServiceConnected(ComponentName className, IBinder service) { 
    // 当与服务的连接建立时调用. 
    // 传入的 IBinder 将用作与服务通信
  } 

  public void onServiceDisconnected(ComponentName className) { 
    // 当由于异常, 与服务失去连接时调用. 
  }
};
{% endhighlight %}

可以看到 `onServiceConnected()` 方法中有一个 `IBinder` 对象, **这个 `IBinder` 对象即为 Service 中 `onBind()` 方法返回的对象.**

#### 绑定服务

{% highlight java %}
Intent intent = new Intent(this, BindService.class);
bindService(intent, conn, Service.BIND_AUTO_CREATE);
{% endhighlight %}

> 注意：
>
> * 当你的 activity 需要在可见时才需要同服务交互则需要在activity的`onStart()` 中绑定服务, 并在 `onStop()` 方法中解除绑定。
> * 若当在 activity 在后台时仍需要与服务交互, 则需要在 `onCreate()`方法中绑定, 并在 `onDestory()` 方法中解除绑定.

#### 解除绑服务

{% highlight java %}
unbindService(conn);
{% endhighlight %}

### 实例

创建服务类

{% highlight java %}
public class BindService extends Service{

    private int count = 0;
    private boolean quit = false;

    public class MyBinder extends Binder {
        // 我们可以通过这个方法告知绑定的组建 count 是多少.
        public int getCount(){
            return count;
        }

    }

    @Override
    public IBinder onBind(Intent intent) {
        return new MyBinder(); // 将被 ServiceConnection.onServiceConnected 接收
    }

    @Override
    public void onCreate() {
        super.onCreate();

        new Thread(){
            public void run(){
                while(!quit){
                    try {
                        Thread.sleep(1000);
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                    count++;
                }
            }
        }.start();
    }

    @Override
    public boolean onUnbind(Intent intent) {
        return super.onUnbind(intent);
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        // Service被关闭前回调该方法, 将quit改为true, 停止递增count
        this.quit = true;
    }

}
{% endhighlight %}

在 MainActivity 中绑定服务:

Intent intent = new Intent(this, BindService.class);
bindService(intent, conn, Service.BIND_AUTO_CREATE);

{% highlight java %}
public class MainActivity extends AppCompatActivity implements View.OnClickListener {

    private Button btnBind;
    private Button btnUnBind;
    private Button btnGetStatus;

    private Toast toast;

    private BindService.MyBinder binder;

    private ServiceConnection conn = new ServiceConnection() {
        @Override
        public void onServiceConnected(ComponentName componentName, IBinder iBinder) {
            // iBinder 来自于服务里的 onBind 方法
            binder = (BindService.MyBinder) iBinder;
        }

        @Override
        public void onServiceDisconnected(ComponentName componentName) {
            // 只有异常失去连接才会回调
            Toast.makeText(MainActivity.this,
                    "Disconnection", Toast.LENGTH_LONG).show();
        }
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        btnBind = (Button) findViewById(R.id.btn_bind);
        btnUnBind = (Button) findViewById(R.id.btn_unbind);
        btnGetStatus = (Button) findViewById(R.id.btn_get_status);

    }

    @Override
    public void onClick(View view) {
        switch (view.getId()) {
            case R.id.btn_bind:
                Intent intent = new Intent(this, BindService.class);
                bindService(intent, conn, Service.BIND_AUTO_CREATE);
                break;
            case R.id.btn_unbind:
                // 这里其实还要判断服务是福存在. 不然连续按2次按钮会报错
                unbindService(conn);
                stopService(new Intent(this, BindService.class));
                break;
            case R.id.btn_get_status:
                // 这里如果 unbind 之后继续点击, 将获得 count 最后的值
                Toast.makeText(MainActivity.this,
                        "Count 值为："+ binder.getCount(), Toast.LENGTH_SHORT)。show();
                break;
        }
    }
}
{% endhighlight %}

## 常见问题

* Service的 onCreate 回调函数可以做耗时的操作吗？

> 不行. Service 是在主线程中调用的, 耗时操作会阻塞UI. 可以使用创建一个新的线程或者使用 `IntentService`.

* 两种启动方式的区别

> 见上文

## 参考

* [START_STICKY and START_NOT_STICKY](http://stackoverflow.com/questions/9093271/start-sticky-and-start-not-sticky)
* [Service与Bind Service](http://www.jianshu.com/p/be7537484c41)
* [Android面试一天一题](http://www.jianshu.com/p/7a7db9f8692d)