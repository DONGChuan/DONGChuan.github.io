---
layout: post
title: Android Shape Drawable
category: android
tags: [android]
---

Quick note about learning Android Shape Drawable. It is an XML file defining a geometric shape, including colors and gradients.

## Shape

Four shapes available:

* rectangle (By default)
* oval
* line
* ring

{% highlight xml %}
<shape
    xmlns:android="http://schemas.android.com/apk/res/android"
    android:shape=[ rectangle | oval | line | ring ] >

</shape>
{% endhighlight %}

### Addtional attributes for ring

With `ring`, we could have following additonal attributes:

* `android:innerRadius` - Dimension. Radius for the inner part of the ring
* `android:innerRadiusRatio` - Radius for the inner part of the ring, expressed as a ratio of the ring's width. Overridden by `android:innerRadius`. Default value is 9.
* `android:thickness` - Dimension. Thickness of the ring. 
* `android:thicknessRatio` - Thickness of the ring, expressed as a ratio of the ring's width. Overridden by `android:innerRadius`. Default value is 3.
* `ndroid:useLevel` - Boolean. "true" if this is used as a `LevelListDrawable`. This should normally be "false" or your shape may not appear.

## Properties of shape

Then inside `<shape>`, we could define the following properties:

* `<corners>` (Only with rectangle)
* `<padding>`
* `<solid>`
* `<stroke>`
* `<size>`
* `<padding>`

### corners

**Creates rounded corners for the shape. Applies only when the shape is a rectangle.**

{% highlight xml %}
<corners 
    android:radius="1dp"
    android:topLeftRadius="Dimension" 
    android:topRightRadius="Dimension"
    android:bottomLeftRadius="Dimension"
    android:bottomRightRadius="Dimension" />
{% endhighlight %}

`android:radius` for all corners. Overridden for each corner by the other four attributes.

### gradient

**Specifies a gradient color for the shape.**

{% highlight xml %}
<gradient
    android:angle="Integer" 
    android:centerX="Float"
    android:centerY="Float"
    android:startColor="Color"
    android:centerColor="Color"
    android:endColor="Color"
    android:type=[ linear | radial | sweep ]
    android:gradientRadius="Float"
    android:useLevel="Boolean" />
{% endhighlight %}

* `android:angle` - Angle for the gradient, in degrees. 0 is left to right, 90 is bottom to top. It must be a multiple of 45. Default is 0.
* `android:centerX` - The relative X-position for the center of the gradient (0 - 1.0).
* `android:centerY` - The relative Y-position for the center of the gradient (0 - 1.0).
* `android:startColor` - Starting color
* `android:centerColor` - Optional color that comes between the start and end colors
* `android:endColor` - Ending color
* `android:gradientRadius` - Radius for the gradient. Only applied when `android:type="radial"`.
* `android:useLevel` - Boolean. "true" if this is used as a LevelListDrawable.
* `android:type` - Type of gradient pattern to apply. 
* `linear` - A linear gradient. By default.
* `radial` - A radial gradient. The start color is the center color.
* `sweep` - A sweeping line gradient.

### solid

**A solid color to fill the shape.**

{% highlight xml %}
<solid android:color="Color" />
{% endhighlight %}

### stroke

**A stroke line for the shape.** Could be considered as border of the shape.

{% highlight xml %}
<stroke
    android:width="Dimension"
    android:color="Color"
    android:dashWidth="Dimension"
    android:dashGap="Dimension" />
{% endhighlight %}

* `android:dashWidth` - Size of each dash line. Only valid if `android:dashGap` is set.
* `android:dashGap` - Distance between line dashes. Only valid if `android:dashWidth` is set.

### padding

**Padding to apply to the containing View element** (this pads the position of the View content, not the shape).

{% highlight xml %}
<padding
    android:left="Dimension"
    android:top="Dimension"
    android:right="Dimension"
    android:bottom="Dimension" />
{% endhighlight %}

### size

**Size of the shape.**

{% highlight xml %}
<size
    android:width="Dimension"
    android:height="Dimension" />
{% endhighlight %}

## File Location

**res/drawable/filename.xml**

The filename is used as the resource ID.

## Resource reference

* In Java: **R.drawable.filename**
* In XML: **@[package:]drawable/filename**

## Refs

* [Android Developer Drawable-Resource](https://developer.android.com/guide/topics/resources/drawable-resource.html)
* [Android shape的使用](http://www.cnblogs.com/cyanfei/archive/2012/07/27/2612023.html)