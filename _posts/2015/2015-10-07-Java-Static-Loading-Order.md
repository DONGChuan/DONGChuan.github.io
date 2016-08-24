---
layout: post
title: Java Static Blocks Loading Order
category: java
tags: [java]
---

## Java Static Blocks Loading Order

### Main Points

* Static blocks are always ran before the object is created
* When static field and static variable are together, they are in **textual order**
* Static block of parent is executed firstly because it is loaded firstly

### Static field and static variable

This question confused me a lot when I learnt lazy initialization holder class of `Singleton` design pattern. 

{% highlight java %}
public class Singleton {

    private Singleton(){}

    private static class SingletonHolder{ // Inner static class
        private static Singleton instance = new Singleton();  // Inner static variable
    }

    public static Singleton getInstance(){
        return SingletonHolder.instance;
    }
}
{% endhighlight %}

So why here it could be a `Singleton`? How is the order of initialization?! 

When `getInstance()` is invoked in the first time. It will load `SingletonHolder.instance` which leads `SingletonHolder` class to be initialized. When `SingletonHolder` is initialized, it will initialize its static field. As it's a static field, so it will only be initialized one time and thread safe. 

From this moment, a question comes into my mind? What's the order to initializer static blocks mixed with inner class and superclass?

Let's see amore complexe situation:

{% highlight java %}
public class Singleton {
     
    public static class Inner{
        static {
            System.out.println("Inner Statuc Field");
        }
        public final static Singleton testInstance = new Singleton(3);
    }
 
    public static Singleton getInstance(){
        return Inner.testInstance;
    }
 
    public Singleton(int i) {
        System.out.println("Test " + i +" Construct! ");
    }
 
    static {
        System.out.println("Static Field");
    }
 
    public static Singleton testOut = new Singleton(1);
 
    public static void main(String args[]){
        Singleton t = new Singleton(2);
        Singleton.getInstance();
    }
}
{% endhighlight %}

Output:

```
Static Field
Test 1 Construct! 
Test 2 Construct! 
Inner Statuc Field
Test 3 Construct! 
```

So From the output, we get the following process:

* `Singleton t = new Singleton(2)` -> Initialize Class `Singleton -> Initialize Static Filed -> Initialize Static Variable -> Run its constructor
* `Singleton.getInstance()` -> Initialize Class `Inner` -> Initialize Static Filde -> Initialize Static Variable -> Run `Singleton` constructor

Now let's exchange positions of static field and static variable of inner class:

{% highlight java %}
public static class Inner{
    public final static Singleton testInstance = new Singleton(3);
        
    static {
        System.out.println("Inner Static Field");
    }
}
{% endhighlight %}

Output:

```
Static Field
Test 1 Construct! 
Test 2 Construct! 
Test 3 Construct! 
Inner Static Field
```

So here, the order to initialize Static Field and Static Variable exchanges, too!

From [section 12.4.2](http://docs.oracle.com/javase/specs/jls/se7/html/jls-12.html#jls-12.4.2) of the Oracle Java Language Specification:

>The procedure for initializing is as follows:
>
>Then, initialize the final class variables and fields of interfaces whose values are compile-time constant expressions (§8.3.2.1, §9.3.1, §13.4.9, §15.28).
>Next, execute either the class variable initializers and static initializers of the class, or the field initializers of the interface, **in textual order**, as though they were a single block.

**In textual order**! So this is why we have different out put in the above example!
 
### With Parent

{% highlight java %}
public class Parent {

    public Parent() {
        System.out.println("Parent Constructor");
    }

    static {
        System.out.println("Parent static block");
    }

    {
        System.out.println("Parent initialisation block");
    }
}

public class Child extends Parent {

    public Child() {
        System.out.println("Child Constructor");
    }

    {
        System.out.println("Child initialisation block");
    }

    static {
        System.out.println("Child static block");
    }

    public static void main(String[] args) {
        new Child();
    }
}
{% endhighlight %}

Output:

```
Parent static block
Child static block
Parent initialisation block
Parent Constructor
Child initialisation block
Child Constructor
```

When we are calling constructor of the subclass (child), then this constructor implicitly calls `super()` before executing it's own constructor. So Class `Parent` will now be initialized. But **static blocks are always ran before the object is created**, so we see firstly "Parent static block", then "Child static block". What's more, Initialization block comes into play even before the constructor call.

## Ref

* [Stackoverflow](http://stackoverflow.com/questions/12448465/in-what-order-are-static-blocks-and-static-variables-in-a-class-executed)
* [Oracle Java Language Specification](http://docs.oracle.com/javase/specs/jls/se7/html/jls-12.html#jls-12.4.2)