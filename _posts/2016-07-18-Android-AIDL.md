---
layout: post
title: AIDL 学习笔记
category: android
tags: [android]
---

AIDL 全称 **Android Interface Definition Language**. 主要用来处理进程间通信 (IPC), 也就是两个安卓应用程序之间的通信. 

> 在安卓平台上, 一个进程通常不能访问另外一个进程的内存空间. 

可以将两个通信的应用看成一个客户端和一个服务端.

## 如何使用

下面是一个例子, 在客户端传递两个参数 a 和 b, 然后在服务端 (另外一个进程) 进行计算.

### 在服务端新建 AIDL 文件

先创建一个 AIDL 文件，这个文件语法类似于 Java, 定义了自己需要的接口, 若要在两个进程见通信, 两个项目中必须有一模一样的 AIDL 文件, 包括包名.

IMyService.aidl:

{% highlight java %}
// IMyService.aidl
package io.github.loopx;

// Declare any non-default types here with import statements

interface IMyService {
    //计算 a + b, 这个方法将在服务端的服务里实现, 然后让客户端绑定服务来调用这个方法.
    int add(int a,int b);
}
{% endhighlight %}

然后编译器会自动生成一个 IMyService.java (app/build/generated/source/aidl), 在这个 java 文件里有一个叫做 proxy 的类, 这是一个代理类, 这个类运行在客户端中, 其实 AIDL 实现的进程间的通信并不是直接的通信, 客户端和服务端都是通过 proxy 来进行通信的: **客户端调用的方法实际是调用是proxy中的方法, 然后 proxy 通过和服务端通信将返回的结果返回给客户端.**

### 在服务端创建服务监听请求

在服务端创建一个服务用来监听客户端的连接请求 (客户端绑定该服务).

{% highlight java %}
public class IRemoteService extends Service {

    // 客户端绑定服务时会执行 ServiceConnection.onServiceConnected 获得该 iBinder. 
    // 从而可以调用 add() 方法
    @Override
    public IBinder onBind(Intent intent) {
        return iBinder;
    }

    private IBinder iBinder = new IMyService.Stub(){

        @Override
        public int add(int a, int b) throws RemoteException {
            Log.e("TAG", "收到了来自客户端的请求 " + a + " + " + b );
            return a + b;
        }

    };
}
{% endhighlight %}

还需要在 `AndroidManifest.xml` 中注册该服务

{% highlight xml %}
<service android:name=".IRemoteService"
    android:process=":remote"
    android:exported="true">
    <intent-filter>
        <action android:name="io.github.loopx.IRomoteService"/>
    </intent-filter>
</service>
{% endhighlight %}

### 在客户端创建同样的 AIDL 文件

**同样要在客户端创建AIDL文件, 里面的包名和所在位置要求完全一样**, 这样在客户端也会生成一个 IMyService 类.

### 绑定服务端的服务

{% highlight java %}
private IMyService iMyService;

// 用于绑定服务
private ServiceConnection conn = new ServiceConnection() {

    //绑定服务端服务, 回调onBind()方法
    @Override
    public void onServiceConnected(ComponentName name, IBinder service) {
        iMyService = IMyService.Stub.asInterface(service);
    }

    @Override
    public void onServiceDisconnected(ComponentName name) {
        iMyService = null;
    }
};

private void bindService() {

    Intent intent = new Intent();
        
    // 绑定服务端的service
    // intent.setAction("io.github.loopx.IRomoteService");
    
    // 新版本（5.0后）必须显式 intent 启动绑定服务
    intent.setComponent(new ComponentName("io.github.loopx","io.github.loopx.IRomoteService"));

    // 绑定的时候服务端自动创建
    bindService(intent, conn, Context.BIND_AUTO_CREATE);
}

// 然后就可以进行通信了
iMyService.add(1,2);
{% endhighlight %}

## 参考

* [AIDL使用解析](http://www.jianshu.com/p/a5c73da2e9be)
* [Android 进程间通信（IPC）之AIDL的认识](http://www.jianshu.com/p/3a597ddb1bd2)