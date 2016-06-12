---
layout: post
title: Android DragViewHelper
category: android
tags: [android]
---

Quick note about learning ViewDragHelper from [ViewDragHelper tutorial
](https://newfivefour.com/android-viewdraghelper-example-tutorial.html) and [ViewDragHelper完全解析 自定义ViewGroup神器](http://blog.csdn.net/lmj623565791/article/details/46858663).

## ViewDragHelper

> `ViewDragHelper` is in support.v4. It is a utility class for writing custom ViewGroups. It offers a number of useful operations and state tracking for allowing a user to drag and reposition views within their parent ViewGroup.

**So it's for moving Views in ViewGroup!**. For example, customize a LinearLayout in which we could drag views.

## Create an instance

To create a ViewDragHelper by its factory method:

{% highlight java %}
ViewDragHelper.create(ViewGroup forParent, float sensitivity, ViewDragHelper.Callback cb)
{% endhighlight %}

> sensitive here means how sensitive the helper should be about detecting the start of a drag. Larger values are more sensitive. 1.0f is normal.

{% highlight java %}
mDraggerHelper = ViewDragHelper.create(this, 1.0f, new ViewDragHelper.Callback() { 
        // some callbacks
    })
{% endhighlight %}

## Create Callbacks

[ViewDragHelper.Callback](https://developer.android.com/reference/android/support/v4/widget/ViewDragHelper.Callback.html)  has many public methods to override. Some important ones:

* `tryCaptureView(View child, int pointerId)` - Called when user touches a view in the viewgroup. Should return true if the user is permitted to drag the given view with the indicated pointer.
* `clampViewPositionVertical(View child, int top, int dy)` - Restrict the motion of the dragged child view along the vertical axis.
* `clampViewPositionHorizontal(View child, int left, int dx)`  - Restrict the motion of the dragged child view along the horizontal axis.
* `getViewVerticalDragRange(View child)` - Returns range of vertical motion in pixels. Views cannot move vertically when it returns 0.
* `getViewHorizontalDragRange(View child)` - Returns range of horizontal motion in pixels. Views cannot move horizontally when it returns 0.
* `onViewReleased(View child, float xvel, float yvel)` - Called when child view is no longer being actively dragged.

The following is an example. All the child views could be dragged in the groupview. But they could only stay inside groupview:

{% highlight java %}
mDraggerHelper = ViewDragHelper.create(this, 1.0f, new ViewDragHelper.Callback() {

        @Override
        public boolean tryCaptureView(View child, int pointerId) {
            return true;
        }
    
        @Override
        public int clampViewPositionHorizontal(View child, int left, int dx) {
    
            final int leftBound = getPaddingLeft();
            final int rightBound = getWidth() - child.getWidth() - getPaddingRight();
    
            // Views could only stay inside groupview horizontally
            return Math.min(Math.max(left, leftBound), rightBound);
        }
    
        @Override
        public int clampViewPositionVertical(View child, int top, int dy) {
    
            final int topBound = getPaddingTop();
            final int bottomBound = getHeight() - child.getHeight() - getPaddingBottom();
    
            // Views could only stay inside groupview vertically
            return Math.min(Math.max(top, topBound), bottomBound);
        }

    });
{% endhighlight %}

## Detect Touch Event

Those above ViewDragHelper.Callbacks will be called when ViewGroup detects touch event.

It needs to override two functions in ViewGroup:

1. **`onInterceptTouchEvent()`** - In it, using `mDraggerView.shouldInterceptTouchEvent(event)` to decide if it should intercept this touch event or not.
2. **`onTouchEvent()`** - In it, using `mDraggerView.processTouchEvent(event)` to process the motion event.

> `onInterceptTouchEvent()` is called whenever a touch event is detected on the surface of a ViewGroup, including on the surface of its children. If it returns true, the MotionEvent is intercepted, meaning it will be not be passed on to the child, but rather to `onTouchEvent()` method of ViewGroup.

{% highlight java %}
@Override
public boolean onInterceptTouchEvent(MotionEvent ev) {
    return mDragHelper.shouldInterceptTouchEvent(ev);
}

@Override
public boolean onTouchEvent(MotionEvent event) {
    mDragHelper.processTouchEvent(event);
    return true;
}
{% endhighlight %}

## Ref

* [ViewDragHelper完全解析 自定义ViewGroup神器](http://blog.csdn.net/lmj623565791/article/details/46858663)
* [ViewDragHelper tutorial](https://newfivefour.com/android-viewdraghelper-example-tutorial.html)
* [Each Navigation Drawer Hides a ViewDragHelper](http://flavienlaurent.com/blog/2013/08/28/each-navigation-drawer-hides-a-viewdraghelper/)