---
layout: post
title: Android Parcelable Interface
category: android
tags: [android]
---

## Parcelable Interface

Interface for classes whose instances can be written to and restored from a Parcel. 
Classes implementing the `Parcelable` interface must also have a non-null static field called **CREATOR** of a type that implements the `Parcelable.Creator` interface.

### There are two options to realize serialization:

1. Serializable Interface
2. Parcelable Interface (Android Only)

Here parcelable is more efficient. It could be used to **transfer object by intents** and **IPC** (inter-process communication). In general, we could only use intents to pass values like int, string and so on. But now with Parcelable, you can transfer **Objects** like a car, a person :P

PS: Both of these two interfaces could achieve this. `Bundle.putSerializable(Key, Object)` for `Serializable` interface. `Bundle.putParcelable(Key，Object)` for `Parcelable` interface.

###  How to choose between them?

1. Parcelable is more frequent in the use of memory.

2. Serializable will produce a large number of temporary variables which causes freqiemt GC.

3. Parcelable is not appropriate to place any Parcel data in to persistent storage. Changes in the underlying implementation of any of the data in the Parcel can render older data unreadable. In this situation, Serializable could be better.

> Why serialization? 
> 1) To permanently save the object, by sequence of bytes saved to a local file. 
> 2) To pass an object in the network. 3) To pass an object between processes (IPC). 

### When to use it?

If you need to transfer complex data types (objects) between components like Activity or Service. For simple data like int, just use Intent directly.

{% highlight java %}
public class ObjectA implements Parcelable {
 
	private String strValue;
	private Integer intValue;
 
	/**
	 * Standard basic constructor for non-parcel object creation
	 */
	public ObjectA() {};
 
	/**
	 * Constructor to use when re-constructing object
	 * from a parcel
	 */
	public ObjectA(Parcel in) {
		readFromParcel(in);
	}
 	
 	/**
     * This field is needed for Android to be able to
     * create new objects, individually or as arrays.
     * This also means that you can use the default
     * constructor to create the object and use another
     * method to hyrdate it as necessary. It's easier to 
     * use the constructor.
     */
    public static final Parcelable.Creator CREATOR =
    	new Parcelable.Creator() {
            public ObjectA createFromParcel(Parcel in) {
                return new ObjectA(in);
            }
 
            public ObjectA[] newArray(int size) {
                return new ObjectA[size];
            }
        };

 	/**
 	 * Details: http://stackoverflow.com/questions/4076946/parcelable-where-when-is-describecontents-
     * used/4914799#4914799
     * Only need when you want to put FileDescriptor object into Parceable. Dont dont care about it.
 	 */
	@Override
	public int describeContents() {
		return 0;
	}

	/**
	 * Write each field into the parcel. Take care about the order.
	 * When readFromParcel(), they should be in the same order.
	 */
	@Override
	public void writeToParcel(Parcel dest, int flags) {
		dest.writeString(strValue);
		dest.writeInt(intValue);
	}
 
	/**
	 * Called from the constructor to re-create object from a parcel.
	 * Should be the same order in writeToParcel().
	 */
	private void readFromParcel(Parcel in) {
		strValue = in.readString();
		intValue = in.readInt();
	}

    public String getStrValue() { return strValue; }
	public void setStrValue(String strValue) { this.strValue = strValue; }
 
	public Integer getIntValue() { return intValue; }
	public void setIntValue(Integer intValue) { this.intValue = intValue; }
 
}
{% endhighlight %}


