---
layout: post
title: Singleton Pattern
category: design pattern
tags: [java, design pattern]
---

## Singleton

It ensures **only one instance for a class**. More detail, it involves one class which is responsible to instantiate itself, to make sure it creates only one instance and, in the same time, it provides a global point of access to that instance. 

## Different implementations

There are different implementations for singleton to solve different problems. They have some common points

> Constructor must be private. To ensure that only itself could instantiates itself :P
> A static method which should be a global point of access to get the instance

### Basic

The following is the simplest way:

{% highlight java %}
public class Singleton {  

    private static Singleton instance;

    private Singleton (){}
 
    public static Singleton getInstance() { 
	    if (instance == null) {         // 1
	        instance = new Singleton(); // 2
	    } 
	    return instance;                // 3
    } 
} 
{% endhighlight %}

It ensures that only creates a Singleton object. Its constructor is **private**, `getInstance ()` method creates only one object. **But it is only suitable for single-threaded programs**. 

So for multi-thread, 'synchronized' key word must be added on `getInstance()`. If no this key word, `getInstance()` may return two different instances. 

Now let's suppose two threads concurrently call the `getInstance()` method in the following order:

1. Thread 1 calls `getInstance()` method and finds instance at // 1 is null.
2. Thread 1 enters `if` block, but in the implementation of the code line // 2 Thread 2 is preempted.
3. Thread 2 calls `getInstance()` method and finds instance at // 1 is null.
4. Thread 2 enters `if` block and creates a new Singleton object.
5. Thread 2 returns reference of instance at // 3.
6. Thread 2 is preempted by Thread 1.
7. Thread 1 starts where it left off and executes // 2, which lead to creation of another instance.
8. Thread 1 returns reference of another instance at // 3.

So `getInstance()` method creates two different instances. By synchronizing the 'getInstance()' method so that in the mean time, only one thread is allowed to execute code. Let's see the next implementation.

### Thread safe

Now with `synchronized` key word for thread safety:

{% highlight java %}
public class Singleton { 

    private static Singleton instance;  

    private Singleton (){}  

    public static synchronized Singleton getInstance() {  
	    if (instance == null) {  
	        instance = new Singleton();  
	    }  
	    return instance;  
    }  
} 
{% endhighlight %}

But we should only use this way when `getInstance()` is not invoked too many times. Because `synchronized` consumes a lot of resources.

### Eager initialization

It will **create an instance when load a class but before it is used by any thread**. So it means, no need to synchronize the `getInstance()` method, meaning all threads will see the same instance and no (expensive) locking is required. But this implementation will always creates an instance. So it is suggested to use when you are 100% sure an instance will be needed. If not, waste resource for sure.

{% highlight java %}
public class Singleton { 

    private static Singleton instance = new Singleton();  

    private Singleton (){}  

    public static Singleton getInstance() {  
    	return instance;  
    }  
} 
{% endhighlight %}

> You could also add `final` keyword on instance which means that the instance cannot be redefined, ensuring that one and only one instance ever exists.

### Double-checked locking

Let's see firstly:

{% highlight java %}
public static Singleton getInstance()
{
	if (instance == null) {
	    synchronized(Singleton.class) {
	      instance = new Singleton(); // 1
		}
	}

	return instance;
}
{% endhighlight %}

I think this is reasonable, because we only need to do synchronized at // 1. But it has the same thread problem when two threads concurrently call the `getInstance()` method. They do the null checking before synchronized. So let's add another check after `synchronized`:

{% highlight java %}
public static Singleton getInstance()
{
 	if (instance == null) {
		synchronized(Singleton.class) {
	     	if (instance == null) 
	        	instance = new Singleton(); 
   		}
  	}

  	return instance;
}
{% endhighlight %}

So it's why it is called **Double-checked locking**. What's more, in this way, if the first instance is checked not null, synchronized will be skipped which saves resources. But due to **Java platform memory model** problems. It's not that stable, please check * [Double-checked locking and the Singleton pattern](http://www.ibm.com/developerworks/library/j-dcl/) for more details about this discussion.

Here `volatile` is suggested to use for jdk > 1.5 for memory problems. Check [here](http://www.javamex.com/tutorials/synchronization_volatile.shtml) for more details about this key word.

{% highlight java %}
public class Singleton { 

    private volatile static Singleton singleton; 

    private Singleton (){} 

    public static Singleton getSingleton() {  
	    if (singleton == null) {  
	        synchronized (Singleton.class) {  
	        if (singleton == null) {  
	            singleton = new Singleton();  
	        }  
	        }  
	    }  
	    return singleton;  
    }  
} 
{% endhighlight %}

### Lazy initialization holder class

To achieve thread-safe simply, we can use static initializer. For example, like **Eager initialization**. But in this way, it will initialize the object when load class, regardless of whether you need it or not.

So we want to load the class without initializing this object. One possible way is to use the class-level internal class, in this class to create an object instance. As a result, it will not create this instance until this class is used, so we have lazy loading and thread-safe in the mean time.

{% highlight java %}
public class Singleton {
    
    private Singleton(){}
    
    private static class SingletonHolder{
        private static Singleton instance = new Singleton();
    }
    
    public static Singleton getInstance(){
        return SingletonHolder.instance;
    }
}
{% endhighlight %}

When `getInstance()` is invoked in the first time. It will load `SingletonHolder.instance` which leads `SingletonHolder` class to be initialized. When `SingletonHolder` is initialized, it will initialize its static field. As it's a static field, so it will only be initialized one time and thread safe :D

### Enum

It is suggested by Josh Bloch, author of <<Effective Java>>. Due to `enum`, It can not only avoid the multi-thread synchronization problem, but also automatically supports serialization mechanism and prevent deserialization recreate a new object, also for sure, absolutely prevent multiple instances! 

{% highlight java %}
public enum Singleton {

    /**
     * Define an element which means an instance of Singleton
     */
    uniqueInstance;
    
    public void Singleton(){
        //ToDo
    }
}
{% endhighlight %}

Let's see an example:

{% highlight java %}
public enum MySingleton {
    INSTANCE;
    private MySingleton() {
        System.out.println("Here");
    }
}
{% endhighlight %}

An `enum` type is a special type of `class` type. This enum declaration actually compiles to something like

{% highlight java %}
public final class MySingleton {
    public final static MySingleton INSTANCE = new MySingleton(); 
}
{% endhighlight %}

When your code first accesses INSTANCE, the class `MySingleton` will be loaded and initialized by the JVM. This process initializes the static field above once (lazily).

Test it:

{% highlight java %}
public static void main(String[] args) {
    System.out.println(MySingleton.INSTANCE);
}
{% endhighlight %}

Output:

{% highlight java %}
Here
INSTANCE
{% endhighlight %}

## Ref

* [Wiki](https://en.wikipedia.org/wiki/Singleton_pattern)
* [Double-checked locking and the Singleton pattern](http://www.ibm.com/developerworks/library/j-dcl/)
* [Volatile](http://www.javamex.com/tutorials/synchronization_volatile.shtml)
* [单例模式](http://www.cnblogs.com/java-my-life/archive/2012/03/31/2425631.html)
* [Stackover - Enum for singleton](http://stackoverflow.com/questions/26285520/implementing-singleton-with-an-enum-in-java)


