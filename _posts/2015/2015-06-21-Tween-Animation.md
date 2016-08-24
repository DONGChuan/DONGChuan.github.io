---
layout: post
title: Android Tween Animation
category: android
tags: [android]
---

## Tween Animation

Tween Animation is one kind of animation that we only need to set the start and the end. It will supply the lack between the start and the end. It is why we called **tween** here.

We have four kinds tween animation: Alpha, Rotate, Translate, Scale.

1. Tween animation could be set in both code and xml.
2. By **AnimationSet**, we could mix these animations together.
3. By **AnimationUtils.loadAnimation**, we could load these animations defined in xml.
4. By **Animation.AnimationListener**, we could add listner to listen to changes of animations.

### AlphaAnimation 

{% highlight java %}
AlphaAnimation a = new AlphaAnimation(0, 1); // From 0 to 1
a.setDuration(1000); // 1s
View.startAnimation(a);
{% endhighlight %}

Tween animation could also be set in xml. It needs to create firstly a xml file in **/res/anim** folder: animation_alpha.xml.

{% highlight xml %}
<alpha xmlns:android="http://schemas.android.com/apk/res/android"
android:fromAlpha="0"
android:toAlpha="1"
android:duration="1000"

</alpha>
{% endhighlight %}

Then in the code, we could load one animation its file id.

{% highlight java %}
View.startAnimation(AnimationUtils.loadAnimation(getActivity(), R.anim.animation_alpha);
{% endhighlight %}

### RotateAnimation

{% highlight java %}
// From 0 to 360 degree. Rotates around the top left point
RotateAnimation ra1 = new RotateAnimation(0, 360);
// Rotates around point (100, 50)
RotateAnimation ra2 = new RotateAnimation(0, 360, 100, 50);
// Rotates around UI's own center points
RotateAnimation ra3 = new RotateAnimation(0, 360, Animation.RELATIVE_TO_SELF, 0.5f, Animation.RELATIVE_TO_SELF, 0.5f);
{% endhighlight %}

By xml:

{% highlight xml %}
<?xml version="1.0" encoding="utf-8"?>
<rotate xmlns:android="http://schemas.android.com/apk/res/android"
    android:fromDegrees="0"
    android:toDegrees="360"
    android:duration="1000"
    android:pivotX="50%"
    android:pivotY="50%" >
    <!-- 50 means pixels, 50% means UI's own 50% position -->

</rotate>
{% endhighlight %}

### TranslateAnimation

{% highlight java %}
// X moves from 0 to right 200 pixels 
// Y moves from 0 down 200 pixels 
new TranslateAnimation(0, 200, 0, 200);
{% endhighlight %}

By xml:

{% highlight xml %}
<?xml version="1.0" encoding="utf-8"?>
<translate xmlns:android="http://schemas.android.com/apk/res/android"
    android:fromXDelta="0"
    android:toXDelta="200"
    android:fromYDelta="0"
    android:toYDelta="200"
    android:duration="1000" >

</translate>
{% endhighlight %}

### ScaleAnimation 

{% highlight java %}
// From (100, 50) to scale. By default scale from Top Left
new ScaleAnimation(0, 1, 0, 1, 100, 50);
// From UI's own center to scale
new ScaleAnimation(0, 1, 0, 1, Animation.RELATIVE_TO_SELF, 0.5f, Animation.RELATIVE_TO_SELF, 0.5f);
{% endhighlight %}

By xml:

{% highlight xml %}
<?xml version="1.0" encoding="utf-8"?>
<scale xmlns:android="http://schemas.android.com/apk/res/android"
    android:fromXScale="0"
    android:toXScale="1"
    android:fromYScale="0"
    android:toYScale="1"
    android:duration="1000"
    android:pivotX="50%"
    android:pivotY="50%" >
    <!-- 50 means pixels, 50% means UI's own 50% position -->

</scale>
{% endhighlight %}

### How to mix these animations

By adding every animation in **AnimationSet**. We could mix animations together.

{% highlight java %}
AlphaAnimation aa = new AlphaAnimation(0, 1);
aa.setDuration(1000);
TranslateAnimation ta = new TranslateAnimation(200, 0, 200, 0);
ta.setDuration(1000);

as = new AnimationSet(true); 
as.setDuration(1000);
as.addAnimation(aa); // Add Alpha Animation
as.addAnimation(ta); // Add TranslateAnimation
{% endhighlight %}

By xml:

{% highlight xml %}
<?xml version="1.0" encoding="utf-8"?>
<set xmlns:android="http://schemas.android.com/apk/res/android"
    android:duration="1000"
    android:shareInterpolator="true" >

    <alpha
        android:fromAlpha="0"
        android:toAlpha="1" />

    <translate
        android:fromXDelta="200"
        android:fromYDelta="200"
        android:toXDelta="0"
        android:toYDelta="0" />

</set>
{% endhighlight %}

### Set Listener

We could listner to start/repeat/end of an animation

{% highlight java %}
Animation a = AnimationUtils.loadAnimation(MainActivity.this, R.anim.anim);
a.setAnimationListener(new Animation.AnimationListener() {
	
	@Override
	public void onAnimationStart(Animation animation) {}
					
	@Override
	public void onAnimationRepeat(Animation animation) {}
					
	@Override
	public void onAnimationEnd(Animation animation) {}

);		
{% endhighlight %}

