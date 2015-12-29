---
layout: post
title: Annotation
---

## Predefined Annotations

A set of annotation types are already predefined in the Java SE API in `java.lang`. They are:

1. `@Override`
2. `@Deprecated`
3. `@SuppressWarnings`

#### @Override

`@Override` informs the compiler that the marked method is meant to override a method in a superclass. If a method with `@Override` fails to override a method in one of its superclasses, a wrong method name for example, the compiler generates an error. It can only be used for methods.

{% highlight java linenos %}
public class Fruit {
    public void eat(){
        System.out.println("Eat fruit");
    }
}

class Orange extends Fruit {
    @Override
    public void eat(){
        System.out.println("eat orange");
    }
}

class Apple extends Fruit {
    // wrong method name here
    @Override
    public void aet(){
        System.out.println("eat apple");
    }
}
{% endhighlight %}

When compile class Apple, it will throw an override error because of wrong method name.

#### @Deprecated


#### @SuppressWarnings