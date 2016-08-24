---
layout: post
title: Activity 启动模式
category: android
tags: [android]
---

有四种模式来定义如何启动一个 Activity. 它们可以同时和 Intent 标志一起使用来定义各种不同的启动模式. 

下面是四种基本的启动模式.

## 四种启动模式

* **standard** (默认)
* **singleTop**
* **singleTask**
* **singleInstance**

## 如何设置启动模式

在 `AndroidManifest.xml` 设置启动模式 launchMode

{% highlight xml %}
<activity 
    android:name=".TestActivity"
    android:launchMode="standard|singleInstance|singleTask|singleTop">
</activity>
{% endhighlight %}

### standard

默认启动模式. 每个发送的 Intent 都会创建一个新的 Activity, 并且将其放入任务栈栈顶, 而不管这个 Activity 是否已经存在. Activity 的启动三回调(*onCreate()->onStart()->onResume()*)都会执行. 也就是说**每次都创建一个新的实例**.

### singleTop

如果新 Activity 已经位于任务栈的栈顶, 那么此 Activity 不会被重新创建, 所以它的启动三回调就不会执行, 同时 Activity 的 `onNewIntent()` 方法会被回调. 如果 Activity 已经存在却不在栈顶, 那么作用和标准模式一样, 一个新的 Activity 会被创建并放到栈顶.

在这个模式下, 我们必须同时在 `onCreate()`
 和 `onNewIntent()` 两个方法中处理好传入的 Intent.

#### 应用场景

比如搜索功能. 当用户在搜索条中搜索完会跳转到 SearchActivity 查看搜索结果. 通常, 我们在结果页面的顶端也会放置一个同样的搜索条, 这样用户就不需要回退就可以进行相同的搜索.

如果是 standard 模式, 搜索十次就会在栈里创建了十个 SearchActivity 实例, 同时用户需要按十次回退键才能回到之前的页面. 这明显比较二.

如果是 singleTop 模式, 当在搜索结果界面时, SearchActivity 处在栈的顶端. 所以我们只需要发送 Intent 到已经存在的 SearchActivity 实例, 更新页面的结果就足够了, 不需要创建新的 Activity. 同时只需要按一次回退就能回到之前的页面.

### singleTask

如果栈中任意位置已经有一个 Activity 实例, 那么这个 Activity 就会被调到栈顶, 始终保持一个实例,  同时回调 `onNewIntent()` , 并且 singleTask 会清理在当前 Activity 上面的所有 Activity.

### singleInstance

这个模式和 singleTask 很接近, 只会有一个实例存在. 不同点是**持有这个 Activity 的 Task 不能再有其他 Activity 的实例了**. 

如果从这个 Activity 中启动另外一个不同的 Activity, 将会自动创建一个新的 Task 来存放新的 Activity. 

如果从一个已经存在许多 Activity 的 Task 中调用  singleInstance Activity. 这个新 Activity 同样会被放在一个新的 Task 中.

## 参考

* [https://inthecheesefactory.com/blog/understand-android-activity-launchmode/en](https://inthecheesefactory.com/blog/understand-android-activity-launchmode/en)


