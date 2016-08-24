---
layout: post
title: Handler 小结
category: android
tags: [android]
---

安卓的 UI 操作并不是线程安全的. 如果多个线程并发操作 UI 组件, 则可能导致线程安全问题. 为了解决这个问题, 安卓制定了一条简单的规则, 只允许 UI 线程也就是主线程修改 Activity 里的 UI 组件.

当一个程序第一次启动时, 安卓会同时启动一条主线程, 主要负责处理与 UI 相关的事件, 如用户的按键事件, 屏幕绘图等. 由于只有主线程可以修改 UI 组件, 这样就导致新启动的线程无法动态改变 UI. **Handler 的消息传递机制就可以让新启动的线程周期性的改变 UI**.

Handler 主要有 2 个作用:

* 在新启动的线程中发送消息
* 在主线程中获取处理消息

## 如何使用

### 创建一个 Handler 实例

在主线程中创建 Handler 实例

{% highlight java %}
Handler handler = new Handler(){
	@Override
    public void handleMessage(Message msg) {
        super.handleMessage(msg);
        // 处于主线程
        // 可以在这里更新 UI
    }
}
{% endhighlight %}

或者使用 `Handler.Callback()` 在处理消息之前加入一些前置的判断: 

{% highlight java %}
Handler handler = new Handler(new Handler.Callback() {
    @Override
    public boolean handleMessage(Message msg) {
        // 截获消息 返回值 true 代表消息被截获, 不再向下执行
        eturn false;
    }
}) {
    @Override
    public void handleMessage(Message msg) {
        super.handleMessage(msg);
    }
};
{% endhighlight %}

### 发送消息

在**新的线程**中发送消息, **发送的消息都会进入 Handler 的 `handleMessage()` 方法中**, 即是发送到主线程.

{% highlight java %}
//第一种 
Message message = new Message();
//...arg1,arg2,what,obj相关赋值
handler.sendMessage(message);

//第二种 复用msg
Message message = handler.obtainMessage();
//...arg1,arg2,what,obj相关赋值
message.sendToTarget();

//第三种 直接发送
handler.sendEmptyMessage();

//第四种 延迟发送
handler.sendMessageDelayed();

//第五种 指定时间
handler.sendMessageAtTime();

//第六种 插入到队列前侧
handler.sendMessageAtFrontOfQueue();
{% endhighlight %}

## 深入了解工作原理

Handler 一共有四个组件

* **Message**: 是 Handler 接收和处理的消息对象
* **Looper**: 每个线程只能有一个 Looper. 它的 loop 方法负责读取 MessageQueue 中的消息, 读到消息之后就把消息交给发送该消息的 Handler 进行处理.
* **MessageQueue**: 消息队列. 它采用先进先出的方式来管理 Message. 程序创建 Looper 对象时, 会在它的构造器中创建 MessageQueue 对象. 
* **Handler**: 就是之前描述的发送消息和处理消息. 

### 流程图

当新启动的线程发送消息时, 消息会发送到与之关联的 MessageQueue, 而 Handler 会不断地从 MessageQueue 中获取并处理消息. 这将导致 Handler 类中处理消息的方法被回调. 这个方法处于主线程, 从而更新 UI.

![handler流程图.png](http://DONGChuan.github.io/assets/images/handler-process.png)

既然 MessageQueue 是被 Looper 创建的, 那我们需不需要手动创建这个 Looper 对象呢?

答案是不一定. 如果在主线程中, 系统已经初始化了一个 Looper 对象, 因为程序直接创建 Handler 即可. 如果是我们自己启动的子线程, 需要在子线程中创建 Handler 的话, 就需要再手动创建一个 Looper 对象. 创建 Looper 对象调用它的 prepare() 方法即可. 该方法保证每个线程最多只有一个 Looper 对象. 接下来调用 loop() 方法启动即可. 该方法会使用一个死循环不断取出 MessageQueue 中的消息.
