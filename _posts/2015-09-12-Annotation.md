---
layout: post
title: Annotation Part A - Predefined Annotations
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

When compile class Apple, it will generate an override error because of wrong method name.

#### @Deprecated

It indicates that the marked element is deprecated and should no longer be used. The compiler generates a **warning** whenever a program uses a method, class, or field with the @Deprecated annotation.

It also has a certain "inheritance": **If we use in the code an overrided/inherited types or methods from deprecated ones, the compiler still generates a warning**.

{% highlight java linenos %}
public class Fruit {
    @Deprecated
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
{% endhighlight %}

So we would get a warning when use eat() in class Orange.

#### @SuppressWarnings

It tells compiler to suppress specific warnings that it would otherwise generate. In the following example, a deprecated method is used but now `@SuppressWarnings` causes the warning to be suppressed.

{% highlight java linenos %}
public class Fruit {
    @Deprecated
    public void eat(){
        System.out.println("Eat fruit");
    }
}

class Orange extends Fruit {
    @SuppressWarnings("deprecation")
    @Override
    public void eat(){
        System.out.println("eat orange");
    }
}
{% endhighlight %}

This annotation has a String[] parameter. 

* @SuppressWarnings(value={ "rawtypes", "unchecked" }) - When two warnings to suppress
* @SuppressWarnings({"unchecked", "deprecation"}) - "value=" could be ignored
* @SuppressWarnings("deprecation") - We could write like this if only one parameter

The following is some common warnings:

> It depends on jdk and ide, more details [here](http://stackoverflow.com/questions/1205995/what-is-the-list-of-valid-suppresswarnings-warning-names-in-java)

1. deprecation：to suppress warnings relative to deprecation
2. unchecked：to suppress warnings relative to unchecked operations
3. fallthrough：to suppress warnings relative to missing breaks in switch statements
4. cast: to suppress warnings relative to cast operations
5. serial：to suppress warnings relative to missing serialVersionUID field for a serializable class
6. finally：to suppress warnings relative to finally block that don't retur
7. unused: to suppress warnings relative to unused code and dead code
8. all：to suppress all warnings