---
layout: post
title: Android GestureDetector
category: android
tags: [android]
---

Quick note about learning `GestureDetector` and `ScaleGestureDetector`.

## GestureDetector

Android provides `GestureDetector` class for detecting common gestures.

### Steps

1. Create an instance of `GestureDetector`
2. Override View or Activity's `onTouchEvent(MotionEvent event)` and pass event to `GestureDetector.onTouchEvent(event)`;
3. Implement `GestureDetector.OnGestureListener` callbacks for gestures.
4. Implement `GestureDetector.OnDoubleTapListener` callbacks for click gestures.
5. Or implement `GestureDetector.SimpleOnGestureListener` callbacks if process only a few gestures above.

**Suggest to use `SimpleOnGestureListener` which only needs to implement the gestures we need**.

### Gestures

Check [SimpleOnGestureListener](https://developer.android.com/reference/android/view/GestureDetector.SimpleOnGestureListener.html) Api page for the full list of gestures.

The following table shows the gestures of both `OnGestureListener` and `OnDoubleTapListener`. The first six are from `OnGestureListener` and the last three are from `OnDoubleTapListener`. But `SimpleOnGestureListener` have all of them.

| Gestures | Description | 
| ------------- |:-------------| 
| onDown() | Notified when a tap occurs with the down MotionEvent that triggered it. | 
| onFling() | Notified of a fling event when it occurs with the initial on down MotionEvent and the matching up MotionEvent.  | 
| onLongPress() | Notified when a long press occurs with the initial on down MotionEvent that trigged it. | 
| onScroll() | Notified when a scroll occurs with the initial on down MotionEvent and the current move MotionEvent. | 
| onShowPress() | The user has performed a down MotionEvent and not performed a move or up yet. | 
| onSingleTapUp() | Notified when a tap occurs with the up MotionEvent that triggered it. | 
| onDoubleTap() | Notified when a double-tap occurs. | 
| onDoubleTapEvent() | Notified when an event within a double-tap gesture occurs, including the down, move, and up events. | 
| onSingleTapConfirmed() | Notified when a single-tap occurs. Unlike `onSingleTapUp()`, it will only be called after the detector is confident that the user's first tap is not followed by a second tap leading to a double-tap gesture. | 

### Example

{% highlight java %}
public class MainActivity extends Activity { 
    
    private GestureDetectorCompat mDetector; 

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // Create an instance of GestureDetector
        mDetector = new GestureDetectorCompat(this, new MyGestureListener());
    }

    @Override 
    public boolean onTouchEvent(MotionEvent event){ 

    	// Pass event to GestureDetector.onTouchEvent(event)
        this.mDetector.onTouchEvent(event);
        return super.onTouchEvent(event);
    }
    
    class MyGestureListener extends GestureDetector.SimpleOnGestureListener {
        private static final String DEBUG_TAG = "Gestures"; 
        
        @Override
        public boolean onDown(MotionEvent event) { 
            Log.d(DEBUG_TAG, "Down"); 
            return true;
        }

        @Override
        public boolean onFling(MotionEvent event1, MotionEvent event2, 
                float velocityX, float velocityY) {
            Log.d(DEBUG_TAG, "Fling");
            return true;
        }
    }
}
{% endhighlight %}

## ScaleGestureDetector

It detects scaling transformation gestures or called pinch gestures for scaling views. (Two fingers)

### Steps

1. Create an instance of `ScaleGestureDetector`
2. Override View or Activity's `onTouchEvent(MotionEvent event)` and pass event to `ScaleGestureDetector.onTouchEvent(event)`;
3. Implement `ScaleGestureDetector.OnScaleGestureListener ` callbacks for gestures.
4. Or implement `ScaleGestureDetector.SimpleOnScaleGestureListener()` callbacks if process only a few gestures above.

### Gestures

| Gestures | Description | 
| ------------- |:-------------| 
| onScaleBegin() | Responds to the beginning of a scaling gesture. |
| onScale() | Responds to scaling events for a gesture in progress. |
| onScaleEnd() | Responds to the end of a scale gesture. |

### Example

{% highlight java %}
public class MainActivity extends Activity {

    private ImageView imageView;
    private float scale = 1f;
    private ScaleGestureDetector detector;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        imageView=(ImageView)findViewById(R.id.imageView);
        detector = new ScaleGestureDetector(this, new ScaleListener());
    }

	public boolean onTouchEvent(MotionEvent event) {
        detector.onTouchEvent(event);
        return super.onTouchEvent(event);
    }

    private class ScaleListener extends ScaleGestureDetector.SimpleOnScaleGestureListener {

        float onScaleBegin = 0;
        float onScaleEnd = 0;

        @Override
        public boolean onScaleBegin(ScaleGestureDetector detector) {

            Toast.makeText(getApplicationContext(), "Scale Begin" ,Toast.LENGTH_SHORT).show();
            onScaleBegin = scale;

            return true;
        }

        @Override
        public boolean onScale(ScaleGestureDetector detector) {

            scale *= detector.getScaleFactor();

            imageView.setScaleX(scale);
            imageView.setScaleY(scale);

            return true;
        }

        @Override
        public void onScaleEnd(ScaleGestureDetector detector) {

            Toast.makeText(getApplicationContext(), "Scale Ended", Toast.LENGTH_SHORT).show();

            onScaleEnd = scale;

            if (onScaleEnd > onScaleBegin){
                Toast.makeText(getApplicationContext(), "Scaled Up by a factor of " + String.valueOf( onScaleEnd / onScaleBegin ), Toast.LENGTH_SHORT).show();
            }

            if (onScaleEnd < onScaleBegin){
                Toast.makeText(getApplicationContext(), "Scaled Down by a factor of " + String.valueOf( onScaleBegin / onScaleEnd ), Toast.LENGTH_SHORT.show();
            }

            super.onScaleEnd(detector);
        }
	}
}
{% endhighlight %}

## Ref

* [Using Touch Gestures](https://developer.android.com/training/gestures/index.html)
* [Android Gestures and Touch Mechanics](https://www.sitepoint.com/android-gestures-and-touch-mechanics/)