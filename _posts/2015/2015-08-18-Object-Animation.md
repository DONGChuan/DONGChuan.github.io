---
layout: post
title: Android Object Animator
category: android
tags: [android]
---

## Object Animator

### Why use Animator instead of Animation?

Animator is for **Interactive animation**. In general, we use animation like this: 

{% highlight java %}
TranslateAnimation animation = new TranslateAnimation(0, 200, 0, 0); // Change x from 0 to 200 
animation.setDuration(1000); 
animation.setFillAfter(true); // View will stay in the position where animation finished. Not return back 
imageView.startAnimation(animation);
{% endhighlight %}

But here if we add an onClick listener. We will find, clicking on the new location where the view is located currently doesn't work! But clicking on the previous location works?!
 
It is because Animation only **redraws** UI. But the response location won't change. So it's not fit with interactive animation.

So to make better interactive animation, we have now two animators after 3.0:

#### ValueAnimator

It provides a simple timing engine for running animations which calculate animated values and set them on target objects. **ValueAnimator itself does not act on any of properties nor provide any animation**. It is just a single timing pulse that all animations use (We could also use it for other things). It runs in a custom handler to ensure that property changes happen on the UI thread.

By default, ValueAnimator uses non-linear time interpolation, via the AccelerateDecelerateInterpolator class, which accelerates into and decelerates out of an animation. This behavior can be changed by calling setInterpolator(TimeInterpolator).

#### ObjectAnimator

To animate a property of target object. **It needs Get/Set functions for this property**. More details, this subclass of ValueAnimator provides support for animating properties on target objects. The constructors of this class take parameters to define the target object that will be animated as well as the name of the property that will be animated. Appropriate set/get functions are then determined internally and the animation will call these functions as necessary to animate the property.

### How to use ObjectAnimator

{% highlight java %}
ImageView im = (ImageView) findViewById(R.id.iamge);

// First parameter is the view to be animated. Second parameter is the name of property
ObjectAnimator.ofFloat(im, "translationX", 0F, 200F).setDuration(1000).start(); 
ObjectAnimator.ofFloat(im, "translationY", 0f, 200f).setDuration(1000).start();

ObjectAnimator.ofFloat(im, "X", 0f, 200f).setDuration(1000).start(); 
ObjectAnimator.ofFloat(im, "Y", 0f, 200f).setDuration(1000).start();

ObjectAnimator.ofFloat(im, "rotation", 0f, 360f).setDuration(1000).start();
{% endhighlight %}

But we will see here, **all actions run in the mean time beacasue start() is asynchronous**. So here we could use PropertyValuesHolder and AnimatorSet to control animators to run.

### PropertyValuesHolder

{% highlight java %}
PropertyValuesHolder p1 = PropertyValuesHolder.ofFloat("translationX", 0F, 200F); 
PropertyValuesHolder p2 = PropertyValuesHolder.ofFloat("translationY", 0F, 200F); 
PropertyValuesHolder p3 = PropertyValuesHolder.ofFloat("rotation", 0F, 360F); 

// Run all the property values together 
ObjectAnimator.ofPropertyValuesHolder(im, p1, p2, p3).setDuration(1000).start();
{% endhighlight %}

### AnimatorSet

AnimatorSet is more powful:

{% highlight java %}
AnimatorSet set = new AnimatorSet(); 
Animator animator1 = ObjectAnimator.ofFloat(im, "translationX", 0F, 200F); 
Animator animator2 = ObjectAnimator.ofFloat(im, "translationY", 0f, 200f); 
Animator animator3 = ObjectAnimator.ofFloat(im, "rotation", 0f, 360f);

// Run actions together
set.playTogether(animator1, animator2, animator3).setDuration(1000).start();

// Run actions one by one
set.playSequentially(animator1,animator2,animator3).setDuration(1000).start();

// Run 2 with 3 together
set.play(animator2).with(animator3).setDuration(1000).start();

// Run 1 after 3
set.play(animator1).after(animator3).setDuration(1000).start();
{% endhighlight %}

### Set Listener

Two ways:

1. `new Animator.AnimatorListener()` - need to override all the functions
2. `new AnimatorListenerAdapter()` - only need to override the functions we want

{% highlight java %}
ObjectAnimator animator = ObjectAnimator.ofFloat(view, "alpha", 0F, 1F); 
animator.setDuration(1000); 
animator.addListener(new AnimatorListenerAdapter() { 
	@Override 
	public void onAnimationEnd(Animator animation) { 
		super.onAnimationEnd(animation); 
		Toast.makeText(MainActivity.this, "end", Toast.LENGTH_SHORT).show(); 
	}
	// Override other functions if we need
}); 

// Override all four functions
/*
animator.addListener(new Animator.AnimatorListener() { 
	@Override 
	public void onAnimationStart(Animator animator) {}

	@Override
	public void onAnimationEnd(Animator animator) {}

	@Override
	public void onAnimationCancel(Animator animator) {}

	@Override
	public void onAnimationRepeat(Animator animator) {}
});
*/

animator.start();
{% endhighlight %}

### How to use ValueAnimator

{% highlight java %}
// Animator calulates from 0 to 100 in 5 seconds 
ValueAnimator animator = ValueAnimator.ofInt(0, 100); 
animator.setDuration(5000); 

// Listne to every animation frame 
animator.addUpdateListener(new ValueAnimator.AnimatorUpdateListener() { 
	@Override 
	public void onAnimationUpdate(ValueAnimator valueAnimator) { 
		Integer value = (Integer) valueAnimator.getAnimatedValue(); 
		button.setText("" + value);
		// Modify the objects that you want to animate with these calculated values
	} 
});

animator.start();
{% endhighlight %}

### ValueAnimator for Object

With ValueAnimator.ofObject. ValueAnimator will calculate a time factor between 0 and 1 (animation current time / animation totle time). So we could use it to set specific property animation for each frame.

The idea is that the float fraction determines the position at which to interpolate. 

* When fraction is 0.0 then evaluate should return the start value. 
* When fraction is 1.0 then it should return the end value. 
* For any number between 0.0 and 1.0, it should return an object that lies somewhere between the start value and the end value.

{% highlight java %}
ValueAnimator animator = ValueAnimator.ofObject(new TypeEvaluator<Object>() { 
	@Override 
	public Object evaluate(float v, Object startValue, Object endValue) { 
		// ToDo return your object according to v (0.0 to 1.0)
});
{% endhighlight %}