---
layout: post
title: Android Fragment
category: android
tags: [android]
---

Quick note about learning [Building a Dynamic UI with Fragments](https://developer.android.com/training/basics/fragments/index.html)

## Fragment 

Fragment is sort of like a "sub activity" that you can reuse in different activities.

It can:

* have its own lifecycle
* receive its own input events
* add or remove while the activity is running

> To use fragment, it needs at least Support Library v4. But better to use v7 which is compatible with Android 2.1 (API level 7) and also includes the Fragment APIs.

> For activity, it needs to extend `AppCompatActivity` when with v7. In fact, `FragmentActivity` is a special activity provided in Support Library to handle fragments on system versions older than API level 11. If the lowest system version is API level 11 or higher, then we can use a regular `Activity`. As here `AppCompatActivity` is a subclass of `FragmentActivity` and it could support older versions. So just use it :D

Steps to use fragment:

1. Add Support Library.
2. Define fragment layout xml
3. Create fragment class
4. Add fragment to activity statically/dynamically

### Define Fragment Layout

Its layout has no difference with activity's:

{% highlight xml %}
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent" 
    android:layout_height="match_parent"
    android:orientation="vertical" >

    <TextView
        android:id="@+id/textView1"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="TextView" />

    <Button
        android:id="@+id/button1"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Button" />

</LinearLayout>
{% endhighlight %}

### Create Fragment Class

Like `onCreate()` in Activity, fragment uses `onCreateView()` callback to define the layout. It is the only callback we need in order to get a fragment running. 

{% highlight java %}
public class MyFragment extends Fragment {
    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        // Inflate the layout for this fragment
        return inflater.inflate(R.layout.article_view, container, false);
    }
}
{% endhighlight %}

### Add Fragment to Activity 

There are two ways:

1. Statically by `<fragment>`
2. Dynamically by `<FrameLayout>` and `FragmentManager`

#### Statically

Add each fragment in activity layout XML file:

{% highlight xml %}
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:orientation="horizontal"
    android:layout_width="fill_parent"
    android:layout_height="fill_parent">

    <fragment android:name="com.example.android.fragments.FragmentA"
              android:id="@+id/fragment_a"
              android:layout_weight="1"
              android:layout_width="0dp"
              android:layout_height="match_parent" />

    <fragment android:name="com.example.android.fragments.FragmentB"
              android:id="@+id/fragment_b"
              android:layout_weight="2"
              android:layout_width="0dp"
              android:layout_height="match_parent" />

</LinearLayout>
{% endhighlight %}

#### Dynamically

Dynamically means adding a fragment to an activity at Runtime instead of defining fragments in activity layout file.

Add firstly in activity's layout includes an empty `<FrameLayout>` that acts as the fragment container:

{% highlight xml %}
<FrameLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:id="@+id/fragment_container"
    android:layout_width="match_parent"
    android:layout_height="match_parent" />
{% endhighlight %}

Add initial fragment(s) to activity in `onCreate()` by `FragmentTransaction`:

{% highlight java %}
public class MainActivity extends AppCompatActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.news_articles);

        // Check that the activity is using the layout version with
        // the fragment_container FrameLayout
        if (findViewById(R.id.fragment_container) != null) {

            // However, if we're being restored from a previous state,
            // then we don't need to do anything and should return or else
            // we could end up with overlapping fragments.
            if (savedInstanceState != null) {
                return;
            }

            // Create a new Fragment to be placed in the activity layout
            FragmentA firstFragment = new FragmentA();
            
            // In case this activity was started with special instructions from an
            // Intent, pass the Intent's extras to the fragment as arguments
            firstFragment.setArguments(getIntent().getExtras());
            
            // Add the fragment to the 'fragment_container' FrameLayout
            getSupportFragmentManager().beginTransaction()
                    .add(R.id.fragment_container, firstFragment)
                    .commit();
        }
    }
}
{% endhighlight %}

`FragmentTransaction` here is to provides APIs to add, remove, replace, and perform other fragment transactions.

To replace fragment:

{% highlight java %}
// Create fragment and give it an argument specifying the article it should show
FragmentB newFragment = new FragmentB();
Bundle args = new Bundle();
args.putInt(FragmentB.ARG_POSITION, position);
newFragment.setArguments(args);

FragmentTransaction transaction = getSupportFragmentManager().beginTransaction();

// Replace whatever is in the fragment_container view with this fragment,
// and add the transaction to the back stack so the user can navigate back
transaction.replace(R.id.fragment_container, newFragment);
transaction.addToBackStack(null);

// Commit the transaction
transaction.commit();
{% endhighlight %}

When replace/remove fragments, it needs to allow user to navigate backward and "undo" the change. It is why `transaction.addToBackStack(null)` is called here before commit. It makes fragment to be stopped instead of destroyed when we replace/remove it. 

What's more, this method takes an optional string parameter that specifies a unique name for the transaction. The name isn't needed unless we plan to perform advanced fragment operations using [FragmentManager.BackStackEntry APIs](https://developer.android.com/reference/android/support/v4/app/FragmentManager.BackStackEntry.html).