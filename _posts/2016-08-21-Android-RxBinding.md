---
layout: post
title: RxBinding 学习笔记
category: android
tags: [android]
---

RxJava binding APIs for Android's UI widgets. 学习的是 [JakeWharton 的版本](https://github.com/JakeWharton/RxBinding). 另外还有用于 mvvm 的 [ogaclejapan 版本](https://github.com/ogaclejapan/RxBinding).

RxBinding 是 RxAndroid 中处理控件异步调用的方式. 通过绑定组件, 异步获取事件, 并进行处理. 编码风格非常优雅. 不需要去添加各种 listener 的匿名方法.

## Setup

添加依赖:

```
compile 'io.reactivex:rxandroid:1.2.0'
compile 'io.reactivex:rxjava:1.1.4'
compile 'com.jakewharton.rxbinding:rxbinding:0.4.0'
```

如果使用 `support-v4` 库还需要加入:

```
compile 'com.jakewharton.rxbinding:rxbinding-support-v4:0.4.0'
```

如果使用 `appcompat-v7` 库还需要加入:

```
compile 'com.jakewharton.rxbinding:rxbinding-appcompat-v7:0.4.0'
```

如果使用 `recyclerview` 需要加入:

```
compile 'com.jakewharton.rxbinding:rxbinding-recyclerview-v7:0.4.0'
```

具体信息参考[官方库](https://github.com/JakeWharton/RxBinding)

## 实例

思路是使用 RxJava 将安卓控件的事件转化成 Observable. 这样就可以借助于 RxJava 获取事件并进行处理.

一般情况下添加控件事件:

{% highlight java %}
Button button = (Button) findViewById(R.id.button);
button.setOnClickListener(new View.OnClickListener() {
   @Override
   public void onClick(View v) {
      //handle on click here
   }
});
{% endhighlight %}

如果使用 RxBinding:

{% highlight java %}
Button button = (Button) findViewById(R.id.button);
Subscription buttonSub = RxView.clicks(button).subscribe(new Action1<Void>() {
   @Override
   public void call(Void aVoid) {
      //handle on click here
   }
});
// make sure to unsubscribe the subscription
{% endhighlight %}

另外一个例子

{% highlight java %}
EditText editText = (EditText) findViewById(R.id.editText);
editText.addTextChangedListener(new TextWatcher() {
   @Override
   public void beforeTextChanged(CharSequence s, int start, int count, int after) {}

   @Override
   public void onTextChanged(CharSequence s, int start, int before, int count) {}

   @Override
   public void afterTextChanged(Editable s) {}
});
{% endhighlight %}

如果使用 RxBinding, 就可以只关心其中的一个方法, 而不需要实现整个 `TextWatcher()`:

{% highlight java %}
EditText editText = (EditText) findViewById(R.id.editText);
Subscription editTextSub = RxTextView.textChanges(editText).subscribe(new Action1<String>() {
   @Override
   public void call(String value) {}
});
// make sure to unsubscribe the subscription
{% endhighlight %}

### ListView 添加点击事件

下面这个例子是使用 `RxAdapterView` 给 `ListView` 添加点击事件:

{% highlight java %}
listView = (ListView) findViewById(R.id.listview);

List<String> list = new ArrayList<>();

for (int i = 0 ; i < 40 ; i++){
    list.add("sss" + i) ;
}

ArrayAdapter<String> adapter = new ArrayAdapter<String>(this, android.R.layout.simple_expandable_list_item_1);
adapter.addAll(list);

listView.setAdapter( adapter );

// item click event
RxAdapterView.itemClicks( listView )
    .subscribe(new Action1<Integer>() {
        @Override
        public void call(Integer integer) {
            Toast.makeText(ListActivity.this, "item click " + integer , Toast.LENGTH_SHORT).show();
        }
    }) ;
{% endhighlight %}


## 使用 RxJava 操作符

既然 RxBinding 是基于 RxJava, 我们当然可以使用 RxJava 的操作符, 比如 `map()`

{% highlight java %}
TextView nameLabel = (TextView) findViewById(R.id.name_label);
EditText etName = (EditText) findViewById(R.id.name);

Subscription editTextSub =
    RxTextView.textChanges(etName)
            .map(new Func1<CharSequence, String>() {
                @Override
                public String call(CharSequence charSequence) {
                    return new StringBuilder(charSequence).reverse().toString();
                }
            })
            .subscribe(new Action1<String>() {
                @Override
                public void call(String value) {
                    nameLabel.setText(value);
                }
            });
{% endhighlight %}

## 参考

* [Reactive Android UI Programming with RxBinding](https://realm.io/news/donn-felker-reactive-android-ui-programming-with-rxbinding/)
