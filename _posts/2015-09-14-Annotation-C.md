---
layout: post
title: Annotation Part C - Customize Annotations
---

## Customize Annotations

The format to define an annotation:

{% highlight java %}
@Meta-Annotation A
@Meta-Annotation B
public @interface annotationName {
    returnType functionA() default defaultValueA;
    returnType functionB() default defaultValueB;
}
{% endhighlight %}

When we use `@interface`, it implements automatically `java.lang.annotation.Annotation` interface. Every method in it 
is actually a configuration parameter. Name of the method is the name of the parameter, returnType is the type of argument
(returnType can only be a basic type, Class, String, enum). You can declare the default value of the parameter.

It supports the following types:

1. All basic types（int,float,boolean,byte,double,char,long,short)
2. String
3. Class
4. enum
5. Annotation
6. All above in array

>When we define an annotation, it can not inherit other annotations or interfaces.
>Only public or default is allowed for functions.
>If only one parameter, better to set the name as "value". So we could ignore "value=" when use this annotation.

### Example

Define now @MethodInfo to indicate information about a method

{% highlight java %}
@Documented
@Target(ElementType.METHOD)
@Inherited
@Retention(RetentionPolicy.RUNTIME)
public @interface MethodInfo{
    String author() default "Dong";
    String date();
    int revision() default 1;
    String comments();
}
{% endhighlight %}

Now we use this annotation on a method

{% highlight java %} 
public class AnnotationExample {
 
    public static void main(String[] args) {
    }
 
    @MethodInfo(author = "Dong", comments = "It's just an example", date = "26 12 2015", revision = 3)
    public String todo() {
        return "I use annotations!";
    }
}
{% endhighlight %}

我相信这个例子是很明了的，展示了不同场景下注解的使用方式。

Java注解解析

我们将使用Java反射机制从一个类中解析注解，请记住，注解保持性策略应该是RUNTIME，否则它的信息在运行期无效，我们也不能从中获取任何数据。

{% highlight java %} 
public class AnnotationParsing {
 
    public static void main(String[] args) {
        try {
            for (Method method : AnnotationParsing.class
                    .getClassLoader()
                    .loadClass(("com.journaldev.annotations.AnnotationExample"))
                    .getMethods()) {
                // checks if MethodInfo annotation is present for the method
                if (method
                        .isAnnotationPresent(com.journaldev.annotations.MethodInfo.class)) {
                    try {
                        // iterates all the annotations available in the method
                        for (Annotation anno : method.getDeclaredAnnotations()) {
                            System.out.println("Annotation in Method '"
                                    + method + "' : " + anno);
                        }
                        MethodInfo methodAnno = method
                                .getAnnotation(MethodInfo.class);
                        if (methodAnno.revision() == 1) {
                            System.out.println("Method with revision no 1 = "
                                    + method);
                        }
 
                    } catch (Throwable ex) {
                        ex.printStackTrace();
                    }
                }
            }
        } catch (SecurityException | ClassNotFoundException e) {
            e.printStackTrace();
        }
    }
 
}

{% endhighlight %}

以上程序的输出是：

{% highlight java %} 
Annotation in Method 'public java.lang.String com.journaldev.annotations.AnnotationExample.toString()' : @com.journaldev.annotations.MethodInfo(author=Pankaj, revision=1, comments=Main method, date=Nov 17 2012)
Method with revision no 1 = public java.lang.String com.journaldev.annotations.AnnotationExample.toString()
Annotation in Method 'public static void com.journaldev.annotations.AnnotationExample.oldMethod()' : @java.lang.Deprecated()
Annotation in Method 'public static void com.journaldev.annotations.AnnotationExample.oldMethod()' : @com.journaldev.annotations.MethodInfo(author=Pankaj, revision=1, comments=deprecated method, date=Nov 17 2012)
Method with revision no 1 = public static void com.journaldev.annotations.AnnotationExample.oldMethod()
Annotation in Method 'public static void com.journaldev.annotations.AnnotationExample.genericsTest() throws java.io.FileNotFoundException' : @com.journaldev.annotations.MethodInfo(author=Pankaj, revision=10, comments=Main method, date=Nov 17 2012)
{% endhighlight %}

注解API非常强大，被广泛应用于各种Java框架，如Spring，Hibernate，JUnit。