---
layout: post
title: Android ListActivity
category: android
tags: [android]
---

`ListActivity` is to simplify the handling of `ListView`. It extends `Activity` and provides simplified handling of lists.

## Difference with `Activity`

1. Override `onListItemClick()` method to add item click listener. With `Activity`, we need to create a separate listener with `OnClickListener`.
2. No need to use `findViewById()` to find listview in layout resource.
3. Could show a special view to replace list view automatically when there is no data in list.
4. `setListAdapter()` to set adapter instead of calling `ListView.setAdaper()`.

> Please inform me if any expert know more about it.

## Example

Points to pay attention:

1. `ListView` must set id `@android:id/list`. So `ListActivity` could find it automatically.
2. The view to show when there is no data in the list must set id `android:id/empty`.

{% highlight xml %}
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical">

    <ListView android:id="@android:id/list"
        android:layout_width="match_parent"
        android:layout_height="0dp"
        android:background="#00FF00"
        android:layout_weight="1"
        android:drawSelectorOnTop="false"/>

    <TextView android:id="@android:id/empty"
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        android:background="#FF0000"
        android:text="No data"/>

</LinearLayout>
{% endhighlight %}

Then extend `ListActivity` and override `onListItemClick()` to add item listener

{% highlight java %}
public class MainActivity extends ListActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        String[] data = {"a", "b", "c"};

        // Set data null to test no data textview
        // String[] data = {};

        ArrayAdapter<String> adapter = 
        	new ArrayAdapter<String>(this, android.R.layout.simple_list_item_1, data);

        // Add adapter	
        setListAdapter(adapter);
    }

    @Override
    protected void onListItemClick(ListView l, View v, int position, long id) {
        super.onListItemClick(l, v, position, id);

        Toast.makeText(this, "Position:" + position + " id:" + id, Toast.LENGTH_SHORT)
                .show();
    }
}
{% endhighlight %}

## Refs

* [Android Developer ListActivity](https://developer.android.com/reference/android/app/ListActivity.html)
* [Differences between extending Activity and extending ListActivity?](http://stackoverflow.com/questions/11969386what-are-the-differences-between-extending-activity-and-extending-listactivity)